
'use client';

import { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import Image from 'next/image';
import WhatsAppConfig from '@/components/WhatsAppConfig';
import ChatList from '@/components/ChatList';
import ChatWindow from '@/components/ChatWindow';
import AddRecipientModal from '@/components/AddRecipientModel';
import TemplatesPanel from '@/components/TemplatesPanel';
import BulkSendPanel from '@/components/BulkSendPanel';
import { useRealtimeMessages } from '@/app/hooks/useRealtimeMessages';

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
function normalizePhone(phone: string): string {
  return phone.replace(/^\+/, '');
}

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const { messages: realtimeMessages, phoneNumber: realtimeMessagesPhone } = useRealtimeMessages(selectedContact);
  const [isConfigured, setIsConfigured] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [config, setConfig] = useState({
    accessToken: '',
    phoneNumberId: ''
  });
  const [activeTab, setActiveTab] = useState<SidebarTab>('chats');
  const [preSelectedTemplate, setPreSelectedTemplate] = useState<TemplateForBulk | null>(null);
  
  // Load config from localStorage on component mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('whatsappConfig');
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      setConfig(parsedConfig);
      setIsConfigured(true);
    }

    const savedContacts = localStorage.getItem('whatsappContacts');
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }

    // Note: We no longer load messages from localStorage — MongoDB is the source of truth
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
    <main className="flex h-screen bg-[#0b141a]">
      {/* Left side - 30% width */}
      <div className="w-3/10 h-full flex flex-col border-r border-[#2a3942] bg-[#111B21]">
        {/* WhatsApp logo and config */}
        <div className="px-4 py-3 flex justify-between items-center bg-[#1f2c34] border-b border-[#2a3942]">
          <div className="flex items-center">
            <Image 
              src="/image-removebg-preview (21).png" 
              alt="WhatsApp Logo" 
              width={40} 
              height={40} 
              className="mr-2.5"
            />
            <h1 className="text-[17px] font-semibold text-[#e9edef]">WhatsZapp</h1>
          </div>
          {isConfigured ? (
            <button 
              onClick={() => setIsConfigured(false)}
              className="text-[#8696a0] hover:text-[#e9edef] p-2 rounded-full hover:bg-[#2a3942] transition-colors"
            >
              <FaCog size={16} />
            </button>
          ) : null}
        </div>

        {/* WhatsApp Configuration or Tabbed Content */}
        {!isConfigured ? (
          <WhatsAppConfig onSave={handleConfigSave} />
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="flex bg-[#1f2c34] border-b border-[#2a3942]">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors relative ${
                    activeTab === tab.key
                      ? 'text-[#e9edef]'
                      : 'text-[#8696a0] hover:text-[#e9edef]'
                  }`}
                >
                  <span className="text-sm">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {/* Active indicator bar */}
                  {activeTab === tab.key && (
                    <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[#00A884] rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'chats' && (
              <>
                <div className="px-3 pt-3 pb-2 bg-[#111B21]">
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="w-full bg-[#00A884] hover:bg-[#06cf9c] text-white py-2.5 rounded-xl font-medium transition-colors text-sm flex items-center justify-center gap-2"
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
      <div className="w-7/10 h-full flex flex-col bg-[#0b141a]">
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
            <Image 
              src="/image-removebg-preview (22).png"
              alt="WhatsZapp" 
              width={180} 
              height={180} 
              className="opacity-30 mb-5"
            />
            <p className="text-[#e9edef] text-lg font-light">WhatsZapp for Business</p>
            <p className="text-[#8696a0] text-sm mt-1">Select a chat to start messaging</p>
            <div className="mt-4 w-16 h-[1px] bg-[#2a3942]"></div>
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
    </main>
  );
}