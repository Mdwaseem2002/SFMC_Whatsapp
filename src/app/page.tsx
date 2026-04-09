
'use client';

import { useState, useEffect } from 'react';
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

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const realtimeMessages = useRealtimeMessages(selectedContact);
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

    const savedMessages = localStorage.getItem('whatsappMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // Update the messages state when real-time messages change
  useEffect(() => {
    if (selectedContact && realtimeMessages.length > 0) {
      setMessages(prev => ({
        ...prev,
        [selectedContact.phoneNumber]: realtimeMessages
      }));
    }
  }, [realtimeMessages, selectedContact]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (contacts.length > 0) {
      localStorage.setItem('whatsappContacts', JSON.stringify(contacts));
    }
  }, [contacts]);

  useEffect(() => {
    if (Object.keys(messages).length > 0) {
      localStorage.setItem('whatsappMessages', JSON.stringify(messages));
    }
  }, [messages]);

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

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const sendMessage = async (content: string) => {
    if (!selectedContact) return;

    // Create a new message
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      timestamp: new Date().toISOString(),
      sender: 'user',
      status: MessageStatus.PENDING,
      recipientId: selectedContact.phoneNumber,
      attachments: false  // Use boolean value here, not an array
    };

    // Update messages state with the new message
    setMessages(prev => {
      const contactMessages = prev[selectedContact.phoneNumber] || [];
      const updatedMessages = [...contactMessages, newMessage];
      
      // Also store message on the server
      fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: selectedContact.phoneNumber,
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
        [selectedContact.phoneNumber]: updatedMessages
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
        const contactMessages = prev[selectedContact.phoneNumber].map(msg => 
          msg.id === newMessage.id ? { ...msg, status: MessageStatus.SENT } : msg
        );
        return {
          ...prev,
          [selectedContact.phoneNumber]: contactMessages
        };
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Update message status to failed
      setMessages(prev => {
        const contactMessages = prev[selectedContact.phoneNumber].map(msg => 
          msg.id === newMessage.id ? { ...msg, status: MessageStatus.FAILED } : msg
        );
        return {
          ...prev,
          [selectedContact.phoneNumber]: contactMessages
        };
      });
    }
  };

  // Enhanced message fetching with logging
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedContact) return;

      try {
        console.log(`Fetching messages for phone number: ${selectedContact.phoneNumber}`);
        
        const response = await fetch(`/api/messages?phoneNumber=${selectedContact.phoneNumber}`);
        const data = await response.json();
        
        console.log('Fetched Messages:', data);
        
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(prev => ({
            ...prev,
            [selectedContact.phoneNumber]: data.messages
          }));
          
          console.log(`Updated messages for ${selectedContact.phoneNumber}:`, 
            data.messages.length);
        } else {
          console.warn('No messages found or invalid response', data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [selectedContact]);


  // Mock function to simulate receiving a message
  const simulateIncomingMessage = (contact: Contact, content: string) => {
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
      const contactMessages = prev[contact.phoneNumber] || [];
      return {
        ...prev,
        [contact.phoneNumber]: [...contactMessages, incomingMessage]
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

  return (
    <main className="flex h-screen bg-gray-100">
      {/* Left side - 30% width */}
      <div className="w-3/10 h-full flex flex-col border-r border-gray-300 bg-white">
        {/* WhatsApp logo and config */}
        <div className="p-4 flex justify-between items-center bg-[#111B21] text-white">

          <div className="flex items-center">
          <Image 
            src="/image-removebg-preview (21).png" 
            alt="WhatsApp Logo" 
            width={60} 
            height={60} 
            className="mr-2"
          />

            <h1 className="text-xl font-bold">WhatsZapp</h1>
          </div>
          {isConfigured ? (
            <button 
            onClick={() => setIsConfigured(false)}
            className="text-sm bg-green-600 px-2 py-1 rounded text-white flex items-center"
          >
            <FaCog className="text-white text-lg" />
          </button>
          ) : null}
        </div>

        {/* WhatsApp Configuration or Tabbed Content */}
        {!isConfigured ? (
          <WhatsAppConfig onSave={handleConfigSave} />
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="flex bg-[#111B21] border-b border-gray-800">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors relative ${
                    activeTab === tab.key
                      ? 'text-white'
                      : 'text-gray-500 hover:text-gray-300'
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
                <div className="p-4 border-b border-gray-300 bg-[#111B21]">
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="w-full bg-[#075E54] text-white py-2 rounded-md font-medium hover:bg-green-600 transition"
                  >
                    Add Recipient
                  </button>
                </div>
                <ChatList 
                  contacts={contacts} 
                  selectedContact={selectedContact}
                  onSelectContact={handleContactSelect}
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
      <div className="w-7/10 h-full flex flex-col bg-gray-200">
        {selectedContact ? (
          <ChatWindow 
            contact={selectedContact}
            messages={messages[selectedContact.phoneNumber] || []}
            onSendMessage={sendMessage}
            onSimulateIncoming={() => simulateIncomingMessage(selectedContact, 'This is a test reply')} onCloseChat={function (): void {
              throw new Error('Function not implemented.');
            } }          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
      <Image 
        src="/image-removebg-preview (22).png"  // Updated path for public/image.png
        alt="Background Image" 
        width={200} 
        height={200} 
        className="opacity-50 mb-4"
      />
      <p className="text-xl">Select a chat to start messaging</p>
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