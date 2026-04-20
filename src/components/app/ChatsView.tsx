'use client';

// src/components/app/ChatsView.tsx
// Wraps the EXISTING ChatList, ChatWindow, AddRecipientModal, TemplatesPanel, BulkSendPanel.
// ZERO changes to those components — only filters contacts by workspace before passing them in.
// STRICT WORKSPACE ISOLATION: only contacts saved in the active workspace appear.
// Fast reply templates accessible via ⚡ overlay button in the chat area.

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UserPlus } from 'lucide-react';
import ChatList from '@/components/ChatList';
import ChatWindow from '@/components/ChatWindow';
import AddRecipientModal from '@/components/AddRecipientModel';
import TemplatesPanel from '@/components/TemplatesPanel';
import BulkSendPanel from '@/components/BulkSendPanel';
import ToastNotification from '@/components/ToastNotification';
import { useRealtimeMessages } from '@/app/hooks/useRealtimeMessages';
import { useGlobalNotifications } from '@/app/hooks/useGlobalNotifications';
import { useWorkspace } from '@/components/workspace/WorkspaceProvider';
import { Contact, Message, MessageStatus } from '@/types';

type SidebarTab = 'chats' | 'templates' | 'bulk';

interface TemplateForBulk {
  id: string;
  name: string;
  language: string;
  category: string;
  status: string;
  components: Array<{ type: string; text?: string }>;
}

// Helper: normalize phone number by stripping leading '+'
function normalizePhone(phone: string | undefined | null): string {
  if (!phone) return '';
  return String(phone).replace(/^\+/, '');
}

export default function ChatsView() {
  const {
    activeWorkspace,
    activeContacts: workspaceContacts, // contacts from WorkspaceProvider scoped to the active workspace
    activeFastReplies,
  } = useWorkspace();

  const [allBackendContacts, setAllBackendContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const { messages: realtimeMessages, phoneNumber: realtimeMessagesPhone } = useRealtimeMessages(selectedContact);
  const [showAddModal, setShowAddModal] = useState(false);
  const [config, setConfig] = useState({ accessToken: '', phoneNumberId: '' });
  const [activeTab, setActiveTab] = useState<SidebarTab>('chats');
  const [preSelectedTemplate, setPreSelectedTemplate] = useState<TemplateForBulk | null>(null);
  const [showFastReply, setShowFastReply] = useState(false);
  const [pendingFastReplyText, setPendingFastReplyText] = useState<string | null>(null);

  // Global notification system
  const selectedPhoneNormalized = selectedContact ? normalizePhone(selectedContact.phoneNumber) : null;
  const {
    unreadCounts,
    clearUnread,
    latestNotification,
    dismissNotification,
    incomingMessageEvent,
  } = useGlobalNotifications(selectedPhoneNormalized);

  // ─── STRICT WORKSPACE FILTERING ───
  // Build the contacts list for ChatList using ONLY workspace contacts.
  // For each workspace contact, check if there's a matching backend conversation
  // and use the workspace contact's name (not "Unknown" or raw phone number).
  const filteredContacts: Contact[] = useMemo(() => {
    if (!activeWorkspace) return [];

    // Build a Set of normalized workspace contact phone numbers
    const wsPhoneSet = new Set(
      workspaceContacts.map(c => normalizePhone(c.phoneNumber))
    );

    // Create Contact entries from workspace contacts
    // If a backend contact exists with the same phone, merge the chat data
    return workspaceContacts.map(wc => {
      const normPhone = normalizePhone(wc.phoneNumber);
      // Find matching backend contact (from MongoDB conversations)
      const backendMatch = allBackendContacts.find(
        bc => normalizePhone(bc.phoneNumber) === normPhone
      );

      return {
        id: backendMatch?.id || wc.id,
        name: wc.name, // Always use workspace contact's name (never "Unknown")
        phoneNumber: normPhone,
        avatar: wc.avatar || backendMatch?.avatar,
        online: undefined,
        lastSeen: backendMatch?.lastSeen,
      } as Contact;
    });
  }, [activeWorkspace, workspaceContacts, allBackendContacts]);

  // Clear selected contact when workspace changes
  useEffect(() => {
    setSelectedContact(null);
  }, [activeWorkspace?.id]);

  // Real-time synchronization for background updates
  useEffect(() => {
    if (incomingMessageEvent) {
      const normPhone = normalizePhone(incomingMessageEvent.phoneNumber);
      setMessages(prev => {
        const contactMessages = prev[normPhone] || [];
        if (contactMessages.some(m => m.id === incomingMessageEvent.message.id)) {
          return {
            ...prev,
            [normPhone]: contactMessages.map(m => m.id === incomingMessageEvent.message.id ? { ...m, ...incomingMessageEvent.message } : m)
          };
        }
        return {
          ...prev,
          [normPhone]: [...contactMessages, incomingMessageEvent.message]
        };
      });
    }
  }, [incomingMessageEvent]);

  // Load config and hydrate chats from MongoDB on component mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('whatsappConfig');
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      if (parsedConfig.accessToken && parsedConfig.phoneNumberId) {
        setConfig(parsedConfig);
      } else {
        // Saved config is invalid, re-fetch from server
        localStorage.removeItem('whatsappConfig');
      }
    }

    // Always fetch fresh env variables to ensure config is up to date
    fetch('/api/get-env-variables')
      .then(r => r.json())
      .then(data => {
        // API returns { success: true, env: { accessToken, ... } }
        const token = data.env?.accessToken || data.accessToken || data.config?.accessToken;
        const phoneId = data.env?.phoneNumberId || data.phoneNumberId || data.config?.phoneNumberId;
        if (token && phoneId) {
          const autoConfig = { accessToken: token, phoneNumberId: phoneId };
          setConfig(autoConfig);
          localStorage.setItem('whatsappConfig', JSON.stringify(autoConfig));
        }
      })
      .catch(() => {});

    // Hydrate conversations from backend (these are all conversations across all workspaces)
    fetch('/api/conversations')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.conversations) {
          const initialMessages: Record<string, Message[]> = {};
          const backendContacts: Contact[] = [];

          data.conversations.forEach((conv: any) => {
            const normPhone = normalizePhone(conv.phoneNumber);
            if (!normPhone) return;

            backendContacts.push({
              id: conv._id.toString(),
              name: conv.contactName || normPhone,
              phoneNumber: normPhone,
              online: undefined
            });

            if (conv.lastMessage) {
              initialMessages[normPhone] = [{
                id: 'preview-' + conv._id,
                content: conv.lastMessage,
                timestamp: conv.lastMessageTimestamp,
                sender: 'contact',
                status: MessageStatus.DELIVERED,
                recipientId: normPhone,
                attachments: false
              }];
            }
          });

          setAllBackendContacts(backendContacts);

          setMessages(prev => {
            const merged = { ...initialMessages };
            Object.keys(prev).forEach(key => {
              if (prev[key] && prev[key].length > 1) {
                merged[key] = prev[key];
              }
            });
            return merged;
          });
        }
      })
      .catch(err => console.error('Failed to hydrate conversations:', err));
  }, []);

  // Real-time messages sync
  useEffect(() => {
    if (selectedContact && realtimeMessages.length > 0) {
      const key = normalizePhone(selectedContact.phoneNumber);
      if (realtimeMessagesPhone && realtimeMessagesPhone !== key) return;
      // Deduplicate by message id to prevent duplicate key React errors
      const seen = new Set<string>();
      const deduped = realtimeMessages.filter(m => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      });
      setMessages(prev => ({ ...prev, [key]: deduped }));
    }
  }, [realtimeMessages, realtimeMessagesPhone, selectedContact]);

  const handleAddContact = (contact: Contact) => {
    setAllBackendContacts(prev => [...prev, contact]);
    setShowAddModal(false);
  };

  const handleEditContact = (updatedContact: Contact) => {
    setAllBackendContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
    if (selectedContact?.id === updatedContact.id) setSelectedContact(updatedContact);
  };

  const handleDeleteContact = (contactId: string) => {
    setAllBackendContacts(prev => prev.filter(c => c.id !== contactId));
    if (selectedContact?.id === contactId) setSelectedContact(null);
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    clearUnread(contact.phoneNumber);
    setShowFastReply(false);
  };

  const handleToastClick = (phoneNumber: string) => {
    dismissNotification();
    const normalized = normalizePhone(phoneNumber);
    const contact = filteredContacts.find(c => normalizePhone(c.phoneNumber) === normalized);
    if (contact) {
      setSelectedContact(contact);
      clearUnread(phoneNumber);
      setActiveTab('chats');
    }
  };

  const sendMessage = async (content: string, options?: { mediaId?: string; mediaType?: string; mimeType?: string; filename?: string; mediaData?: string }) => {
    if (!selectedContact) return;
    const key = normalizePhone(selectedContact.phoneNumber);

    const newMessage: Message = {
      id: Date.now().toString(),
      content: content || '',
      timestamp: new Date().toISOString(),
      sender: 'user',
      status: MessageStatus.PENDING,
      recipientId: key,
      attachments: !!options?.mediaId,
      mediaType: (options?.mediaType as any) || 'text',
      mediaId: options?.mediaId,
      mimeType: options?.mimeType,
      filename: options?.filename
    };

    setMessages(prev => {
      const contactMessages = prev[key] || [];
      const updatedMessages = [...contactMessages, newMessage];
      fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: key,
          message: { id: newMessage.id, text: { body: content }, timestamp: Math.floor(Date.now() / 1000), from: 'user', mediaType: newMessage.mediaType, mediaId: newMessage.mediaId, mimeType: newMessage.mimeType, filename: newMessage.filename }
        })
      }).catch(error => console.error('Failed to store message:', error));
      return { ...prev, [key]: updatedMessages };
    });

    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedContact.phoneNumber,
          message: content,
          accessToken: config.accessToken,
          phoneNumberId: config.phoneNumberId,
          mediaId: options?.mediaId,
          mediaType: options?.mediaType,
          mimeType: options?.mimeType,
          filename: options?.filename
        }),

      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to send message');
      }

      setMessages(prev => ({
        ...prev,
        [key]: (prev[key] || []).map(msg => msg.id === newMessage.id ? { ...msg, status: MessageStatus.SENT } : msg)
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => ({
        ...prev,
        [key]: (prev[key] || []).map(msg => msg.id === newMessage.id ? { ...msg, status: MessageStatus.FAILED } : msg)
      }));
    }
  };

  // Handle fast reply selection — send the message immediately
  const handleFastReplySelect = (body: string) => {
    setShowFastReply(false);
    if (selectedContact) {
      sendMessage(body);
    }
  };

  const simulateIncomingMessage = (contact: Contact, content: string) => {
    const key = normalizePhone(contact.phoneNumber);
    const incomingMessage: Message = {
      id: Date.now().toString(), content, timestamp: new Date().toISOString(),
      sender: 'contact', status: MessageStatus.DELIVERED, recipientId: 'me', attachments: false
    };
    setMessages(prev => ({ ...prev, [key]: [...(prev[key] || []), incomingMessage] }));
  };

  const handleUseTemplate = (template: TemplateForBulk) => {
    setPreSelectedTemplate(template);
    setActiveTab('bulk');
  };

  const getContactMessages = (phoneNumber: string): Message[] => {
    return messages[normalizePhone(phoneNumber)] || [];
  };

  const tabs: { key: SidebarTab; label: string; icon: string }[] = [
    { key: 'chats', label: 'Chats', icon: '💬' },
    { key: 'templates', label: 'Templates', icon: '📋' },
    { key: 'bulk', label: 'Bulk Send', icon: '📢' },
  ];

  const accentColor = activeWorkspace?.color || '#8b5cf6';

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* Left Sidebar — Chat List */}
      <div className="h-full flex flex-col border-r" style={{ width: '340px', borderColor: '#e2e8f0', background: '#ffffff', flexShrink: 0 }}>
        {/* Tab Navigation */}
        <div className="flex border-b" style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all duration-200 relative"
              style={{ color: activeTab === tab.key ? accentColor : '#94a3b8' }}
            >
              <span className="text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}99)` }} />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'chats' && (
          <>
            <ChatList
              contacts={filteredContacts}
              selectedContact={selectedContact}
              onSelectContact={handleContactSelect}
              onEditContact={handleEditContact}
              onDeleteContact={handleDeleteContact}
              messages={messages}
              unreadCounts={unreadCounts}
              onShowAddModal={() => setShowAddModal(true)}
            />
          </>
        )}

        {activeTab === 'templates' && (
          <TemplatesPanel onUseTemplate={handleUseTemplate} />
        )}

        {activeTab === 'bulk' && (
          <BulkSendPanel preSelectedTemplate={preSelectedTemplate} />
        )}
      </div>

      {/* Right Side — Chat Window + Fast Reply Overlay */}
      <div className="flex-1 h-full flex flex-col" style={{ background: '#f8fafc', position: 'relative' }}>
        {selectedContact ? (
          <>
            <ChatWindow
              contact={selectedContact}
              messages={getContactMessages(selectedContact.phoneNumber)}
              onSendMessage={sendMessage}
              onSimulateIncoming={() => simulateIncomingMessage(selectedContact, 'This is a test reply')}
              onCloseChat={() => setSelectedContact(null)}
            />

            {/* ⚡ Fast Reply Button — floating above the chat input */}
            <button
              onClick={() => setShowFastReply(!showFastReply)}
              title="Fast Replies"
              style={{
                position: 'absolute', bottom: '72px', right: '20px',
                width: '42px', height: '42px', borderRadius: '50%',
                background: showFastReply ? accentColor : '#ffffff',
                border: `2px solid ${accentColor}`,
                boxShadow: `0 4px 16px ${accentColor}30`,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', transition: 'all 0.2s ease', zIndex: 30,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {showFastReply ? '✕' : '⚡'}
            </button>

            {/* Fast Reply Popup */}
            {showFastReply && (
              <div style={{
                position: 'absolute', bottom: '120px', right: '16px',
                width: '300px', maxHeight: '320px', overflowY: 'auto',
                background: '#ffffff', borderRadius: '16px',
                border: '1px solid #e2e8f0', boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                zIndex: 30, animation: 'fadeInUp 0.2s ease',
              }}>
                <div style={{
                  padding: '14px 16px', borderBottom: '1px solid #f1f5f9',
                  fontSize: '13px', fontWeight: '600', color: '#0f172a',
                  fontFamily: "'Inter', sans-serif",
                }}>
                  ⚡ Fast Replies
                </div>
                {activeFastReplies.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                    No fast replies. Add them in the Fast Reply tab.
                  </div>
                ) : (
                  activeFastReplies.map(fr => (
                    <button
                      key={fr.id}
                      onClick={() => handleFastReplySelect(fr.body)}
                      style={{
                        width: '100%', padding: '12px 16px', border: 'none',
                        background: 'transparent', cursor: 'pointer',
                        textAlign: 'left', transition: 'all 0.15s ease',
                        borderBottom: '1px solid #f8fafc',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${accentColor}08`; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <p style={{
                        fontSize: '13px', fontWeight: '600', color: '#0f172a',
                        fontFamily: "'Inter', sans-serif", margin: '0 0 4px',
                      }}>
                        {fr.title}
                      </p>
                      <p style={{
                        fontSize: '12px', color: '#64748b', fontFamily: "'Inter', sans-serif",
                        margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {fr.body}
                      </p>
                    </button>
                  ))
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}25` }}>
              <span className="text-4xl opacity-60">💬</span>
            </div>
            <p className="text-lg font-semibold" style={{ color: '#0f172a' }}>Whatzupp for Business</p>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>Select a chat to start messaging</p>
          </div>
        )}
      </div>

      {/* Add Recipient Modal */}
      {showAddModal && (
        <AddRecipientModal
          onAdd={handleAddContact}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Toast Notification */}
      {latestNotification && (
        <ToastNotification
          phoneNumber={latestNotification.phoneNumber}
          contactName={latestNotification.contactName}
          messagePreview={latestNotification.message.content}
          onDismiss={dismissNotification}
          onClick={handleToastClick}
        />
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
