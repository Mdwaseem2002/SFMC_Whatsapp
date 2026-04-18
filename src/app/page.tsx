
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, LogOut } from 'lucide-react';
import Image from 'next/image';
import WhatsAppConfig from '@/components/WhatsAppConfig';
import ChatList from '@/components/ChatList';
import ChatWindow from '@/components/ChatWindow';
import AddRecipientModal from '@/components/AddRecipientModel';
import TemplatesPanel from '@/components/TemplatesPanel';
import BulkSendPanel from '@/components/BulkSendPanel';
import ToastNotification from '@/components/ToastNotification';
import { useRealtimeMessages } from '@/app/hooks/useRealtimeMessages';
import { useGlobalNotifications } from '@/app/hooks/useGlobalNotifications';

import { Contact, Message, MessageStatus } from '@/types';
import { FaCog } from "react-icons/fa";

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

export default function Home() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const { messages: realtimeMessages, phoneNumber: realtimeMessagesPhone } = useRealtimeMessages(selectedContact);
  const [isConfigured, setIsConfigured] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [config, setConfig] = useState({
    accessToken: '',
    phoneNumberId: ''
  });
  const [activeTab, setActiveTab] = useState<SidebarTab>('chats');
  const [preSelectedTemplate, setPreSelectedTemplate] = useState<TemplateForBulk | null>(null);
  const [currentUser, setCurrentUser] = useState<{ name: string } | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // Global notification system
  const selectedPhoneNormalized = selectedContact ? normalizePhone(selectedContact.phoneNumber) : null;
  const {
    unreadCounts,
    clearUnread,
    latestNotification,
    dismissNotification,
    incomingMessageEvent,
  } = useGlobalNotifications(selectedPhoneNormalized);

  // Real-time synchronization for unselected chats and background updates
  useEffect(() => {
    if (incomingMessageEvent) {
      const normPhone = normalizePhone(incomingMessageEvent.phoneNumber);
      setMessages(prev => {
        const contactMessages = prev[normPhone] || [];
        // Prevent duplicate messages
        if (contactMessages.some(m => m.id === incomingMessageEvent.message.id)) {
          // If message exists, just update its status
          return {
            ...prev,
            [normPhone]: contactMessages.map(m => m.id === incomingMessageEvent.message.id ? { ...m, ...incomingMessageEvent.message } : m)
          };
        }
        // Add new message to the state so the ChatList updates instantly
        return {
          ...prev,
          [normPhone]: [...contactMessages, incomingMessageEvent.message]
        };
      });
    }
  }, [incomingMessageEvent]);

  // Fetch current user session
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.authenticated) {
          setCurrentUser({ name: data.user.name });
        }
      })
      .catch(() => {});
  }, []);

  // Logout handler
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  // Load config and hydrate chats from MongoDB on component mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('whatsappConfig');
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      setConfig(parsedConfig);
      setIsConfigured(true);
    } else {
      // Auto-configure from env variables (server-side config)
      // Always show chat view by default — settings only when user clicks gear
      fetch('/api/get-env-variables')
        .then(r => r.json())
        .then(data => {
          if (data.config?.accessToken && data.config?.phoneNumberId) {
            const autoConfig = { accessToken: data.config.accessToken, phoneNumberId: data.config.phoneNumberId };
            setConfig(autoConfig);
            localStorage.setItem('whatsappConfig', JSON.stringify(autoConfig));
            setIsConfigured(true);
          }
        })
        .catch(() => { /* Keep chat view even if env check fails */ });
    }

    const savedContacts = localStorage.getItem('whatsappContacts');
    let localContacts: Contact[] = [];
    if (savedContacts) {
      localContacts = JSON.parse(savedContacts);
      setContacts(localContacts);
    }

    // Hydrate conversations from backend for instant ChatList preview
    fetch('/api/conversations')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.conversations) {
          const initialMessages: Record<string, Message[]> = {};
          let currentContacts = [...localContacts];
          let updatedContacts = false;

          data.conversations.forEach((conv: any) => {
            const normPhone = normalizePhone(conv.phoneNumber);

            // If contact doesn't exist locally, merge it from backend
            if (!currentContacts.find(c => normalizePhone(c.phoneNumber) === normPhone)) {
              currentContacts.push({
                id: conv._id.toString(),
                name: conv.contactName || normPhone,
                phoneNumber: normPhone,
                online: undefined
              });
              updatedContacts = true;
            }

            // Hydrate the last message preview
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

          if (updatedContacts) {
            setContacts(currentContacts); // This will trigger the localStorage save effect automatically
          }

          // Prehydrate the message strings — this resolves the "No messages yet" on page load
          setMessages(prev => {
            const merged = { ...initialMessages };
            // Ensure we don't accidentally overwrite fully loaded chats if React StrictMode fires twice
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

  // Update the messages state when real-time messages change
  // This is the SINGLE source of truth for messages from the DB + SSE stream
  useEffect(() => {
    if (selectedContact && realtimeMessages.length > 0) {
      const key = normalizePhone(selectedContact.phoneNumber);

      // Prevent stale messages from another contact overwriting the new contact's key
      if (realtimeMessagesPhone && realtimeMessagesPhone !== key) {
        return;
      }

      setMessages(prev => ({
        ...prev,
        [key]: realtimeMessages
      }));
    }
  }, [realtimeMessages, realtimeMessagesPhone, selectedContact]);

  // Save contacts to localStorage whenever they change
  useEffect(() => {
    if (contacts.length > 0) {
      localStorage.setItem('whatsappContacts', JSON.stringify(contacts));
    }
  }, [contacts]);

  const handleConfigSave = (accessToken: string, phoneNumberId: string) => {
    const newConfig = { accessToken, phoneNumberId };
    setConfig(newConfig);
    localStorage.setItem('whatsappConfig', JSON.stringify(newConfig));
    setIsConfigured(true);
  };

  const handleAddContact = (contact: Contact) => {
    setContacts(prev => [...prev, contact]);
    setShowAddModal(false);
  };

  const handleEditContact = (updatedContact: Contact) => {
    setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
    // Update selected contact if it's the one being edited
    if (selectedContact?.id === updatedContact.id) {
      setSelectedContact(updatedContact);
    }
  };

  const handleDeleteContact = (contactId: string) => {
    setContacts(prev => prev.filter(c => c.id !== contactId));
    // Deselect if deleted contact was selected
    if (selectedContact?.id === contactId) {
      setSelectedContact(null);
    }
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    // Clear unread count when selecting a contact
    clearUnread(contact.phoneNumber);
  };

  // Handle clicking on a toast notification — navigate to that contact
  const handleToastClick = (phoneNumber: string) => {
    dismissNotification();
    const normalized = normalizePhone(phoneNumber);
    const contact = contacts.find(c => normalizePhone(c.phoneNumber) === normalized);
    if (contact) {
      setSelectedContact(contact);
      clearUnread(phoneNumber);
      setActiveTab('chats');
    }
  };

  const sendMessage = async (content: string) => {
    if (!selectedContact) return;

    const key = normalizePhone(selectedContact.phoneNumber);

    // Create a new message
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      timestamp: new Date().toISOString(),
      sender: 'user',
      status: MessageStatus.PENDING,
      recipientId: key,
      attachments: false
    };

    // Update messages state with the new message
    setMessages(prev => {
      const contactMessages = prev[key] || [];
      const updatedMessages = [...contactMessages, newMessage];

      // Also store message on the server
      fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: key,
          message: {
            id: newMessage.id,
            text: { body: content },
            timestamp: Math.floor(Date.now() / 1000),
            from: 'user'
          }
        })
      }).catch(error => console.error('Failed to store message:', error));

      return {
        ...prev,
        [key]: updatedMessages
      };
    });

    try {
      // Call the API to send the message
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: selectedContact.phoneNumber,
          message: content,
          accessToken: config.accessToken,
          phoneNumberId: config.phoneNumberId
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error('Send message failed. Backend returned:', errData);
        throw new Error(errData.error || 'Failed to send message');
      }

      // Update message status to sent
      setMessages(prev => {
        const contactMessages = (prev[key] || []).map(msg =>
          msg.id === newMessage.id ? { ...msg, status: MessageStatus.SENT } : msg
        );
        return {
          ...prev,
          [key]: contactMessages
        };
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Update message status to failed
      setMessages(prev => {
        const contactMessages = (prev[key] || []).map(msg =>
          msg.id === newMessage.id ? { ...msg, status: MessageStatus.FAILED } : msg
        );
        return {
          ...prev,
          [key]: contactMessages
        };
      });
    }
  };

  // Mock function to simulate receiving a message
  const simulateIncomingMessage = (contact: Contact, content: string) => {
    const key = normalizePhone(contact.phoneNumber);
    const incomingMessage: Message = {
      id: Date.now().toString(),
      content,
      timestamp: new Date().toISOString(),
      sender: 'contact',
      status: MessageStatus.DELIVERED,
      recipientId: 'me',
      attachments: false
    };

    setMessages(prev => {
      const contactMessages = prev[key] || [];
      return {
        ...prev,
        [key]: [...contactMessages, incomingMessage]
      };
    });
  };

  // Handle "Use Template" from TemplatesPanel
  const handleUseTemplate = (template: TemplateForBulk) => {
    setPreSelectedTemplate(template);
    setActiveTab('bulk');
  };

  // Tab icons and labels
  const tabs: { key: SidebarTab; label: string; icon: string }[] = [
    { key: 'chats', label: 'Chats', icon: '💬' },
    { key: 'templates', label: 'Templates', icon: '📋' },
    { key: 'bulk', label: 'Bulk Send', icon: '📢' },
  ];

  // Get messages for a contact using normalized phone key
  const getContactMessages = (phoneNumber: string): Message[] => {
    return messages[normalizePhone(phoneNumber)] || [];
  };

  return (
    <main className="flex h-screen" style={{ background: '#f8fafc' }}>
      {/* Left side - 30% width */}
      <div className="w-3/10 h-full flex flex-col border-r" style={{ borderColor: '#e2e8f0', background: '#ffffff' }}>
        {/* WhatsApp logo and config */}
        <div className="px-4 py-3.5 flex justify-between items-center border-b" style={{ background: 'rgba(255,255,255,0.85)', borderColor: '#e2e8f0', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #c084fc)', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }}>
              <span className="text-white text-base">💬</span>
            </div>
            <h1 className="text-[17px] font-semibold" style={{ color: '#0f172a', letterSpacing: '-0.3px' }}>Whatzupp</h1>
          </div>
          <div className="flex items-center gap-2">
            {currentUser && (
              <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ color: '#64748b', background: 'rgba(139,92,246,0.08)' }}>
                {currentUser.name}
              </span>
            )}
            <button
              id="logout-button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="p-2 rounded-xl transition-all duration-200"
              style={{ color: '#64748b' }}
              title="Logout"
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
            >
              <LogOut size={16} />
            </button>
          <button
            onClick={() => setIsConfigured(prev => !prev)}
            className="p-2 rounded-xl transition-all duration-200"
            style={{ color: isConfigured ? '#64748b' : '#8b5cf6' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; e.currentTarget.style.color = '#8b5cf6'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = isConfigured ? '#64748b' : '#8b5cf6'; }}
          >
            <FaCog size={16} />
          </button>
          </div>
        </div>

        {/* WhatsApp Configuration or Tabbed Content */}
        {!isConfigured ? (
          <WhatsAppConfig onSave={handleConfigSave} />
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="flex border-b" style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all duration-200 relative"
                  style={{ color: activeTab === tab.key ? '#8b5cf6' : '#94a3b8' }}
                >
                  <span className="text-sm">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {/* Active indicator bar */}
                  {activeTab === tab.key && (
                    <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg, #8b5cf6, #c084fc)' }} />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'chats' && (
              <>
                <div className="px-3 pt-3 pb-2" style={{ background: '#ffffff' }}>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="w-full py-2.5 rounded-xl font-medium transition-all duration-200 text-sm flex items-center justify-center gap-2 text-white"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', boxShadow: '0 4px 14px rgba(124,58,237,0.25)' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(124,58,237,0.25)'; }}
                  >
                    <UserPlus size={16} />
                    Add Recipient
                  </button>
                </div>
                <ChatList
                  contacts={contacts}
                  selectedContact={selectedContact}
                  onSelectContact={handleContactSelect}
                  onEditContact={handleEditContact}
                  onDeleteContact={handleDeleteContact}
                  messages={messages}
                  unreadCounts={unreadCounts}
                />
              </>
            )}

            {activeTab === 'templates' && (
              <TemplatesPanel onUseTemplate={handleUseTemplate} />
            )}

            {activeTab === 'bulk' && (
              <BulkSendPanel preSelectedTemplate={preSelectedTemplate} />
            )}
          </>
        )}
      </div>

      {/* Right side - 70% width */}
      <div className="w-7/10 h-full flex flex-col" style={{ background: '#f8fafc' }}>
        {selectedContact ? (
          <ChatWindow
            contact={selectedContact}
            messages={getContactMessages(selectedContact.phoneNumber)}
            onSendMessage={sendMessage}
            onSimulateIncoming={() => simulateIncomingMessage(selectedContact, 'This is a test reply')}
            onCloseChat={() => setSelectedContact(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(192,132,252,0.1))', border: '1px solid rgba(139,92,246,0.15)' }}>
              <span className="text-4xl opacity-60">💬</span>
            </div>
            <p className="text-lg font-semibold" style={{ color: '#0f172a' }}>Whatzupp for Business</p>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>Select a chat to start messaging</p>
            <div className="mt-4 w-16 h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)' }}></div>
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
    </main>
  );
}