// src/components/ChatComponent.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { MessageStatus } from '@/types';

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  sender: 'user' | 'contact';
  status: MessageStatus;
  contactPhoneNumber: string;
  conversationId: string;
  originalId?: string;
}

interface ChatComponentProps {
  phoneNumber: string;
}

export default function ChatComponent({ phoneNumber }: ChatComponentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Function to scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Enhanced fetch messages function with improved error handling
  const fetchMessages = useCallback(async () => {
    try {
      setError(null);
      const response = await axios.get(`/api/messages`, {
        params: { 
          phoneNumber, 
          conversationId: phoneNumber 
        },
        // Set a reasonable timeout for the request
        timeout: 8000
      });
      
      if (!response.data.success) {
        console.warn('API returned unsuccessful status:', response.data);
        return;
      }
      
      // Convert and sort all messages chronologically
      const processedMessages = (response.data.messages || []).map((msg: Message) => ({
        ...msg,
        timestamp: new Date(Number(msg.timestamp) * 1000), // Ensure timestamp is converted correctly
      })).sort(
        (a: Message, b: Message) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      // Update messages, ensuring no duplicates
      setMessages(prevMessages => {
        // Create a map of existing message IDs for efficient comparison
        const existingMessageIds = new Set(prevMessages.map(m => m.id));
        
        // Filter out duplicate messages
        const newUniqueMessages = processedMessages.filter(
          (msg: { id: string; }) => !existingMessageIds.has(msg.id)
        );

        // Combine and re-sort if new messages are found
        const combinedMessages = newUniqueMessages.length > 0 
          ? [...prevMessages, ...newUniqueMessages].sort(
              (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            )
          : prevMessages;

        return combinedMessages;
      });
    } catch (error: unknown) { // Use 'unknown' instead of 'any'
  console.error('Error fetching messages:', error);

  // Type guard to check if error is an instance of Error
  if (error instanceof Error) {
    // Don't show error UI for normal polling - only for user-initiated actions
    if (!error.message.includes('timeout') && !error.message.includes('Network Error')) {
      setError('Failed to load messages. Please try refreshing.');
    }
  }
}

  }, [phoneNumber]);

  // Optimized message sending with better error handling
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsLoading(true);
    setError(null);
    
    // Optimistically add message to UI
    const tempId = `temp_${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      content: newMessage,
      timestamp: new Date(),
      sender: 'user',
      status: MessageStatus.PENDING,
      contactPhoneNumber: phoneNumber,
      conversationId: phoneNumber
    };

    setMessages(prev => [...prev, optimisticMessage]);
    const messageText = newMessage;
    setNewMessage('');

    try {
      const response = await axios.post('/api/messages', {
        phoneNumber,
        message: {
          text: { body: messageText },
          from: 'user',
          type: 'text',
          timestamp: Math.floor(Date.now() / 1000),
          id: `user_${Date.now()}`
        }
      }, { timeout: 8000 });

      if (response.data.success) {
        // Replace temp message with confirmed one
        setMessages(prevMessages => {
          return prevMessages.map(msg => 
            msg.id === tempId ? {
              ...msg,
              id: response.data.message.id,
              status: MessageStatus.DELIVERED
            } : msg
          );
        });
      } else {
        throw new Error(response.data.error || 'Failed to send message');
      }
    } catch (error: unknown) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
      
      // Mark the optimistic message as failed
      setMessages(prevMessages => {
        return prevMessages.map(msg => 
          msg.id === tempId ? {
            ...msg,
            status: MessageStatus.FAILED
          } : msg
        );
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and set up polling
  useEffect(() => {
    fetchMessages();
    
    // Poll for new messages every 3 seconds (reduced from 2s to decrease server load)
    const intervalId = setInterval(fetchMessages, 3000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [phoneNumber, fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-screen" style={{ background: '#f8fafc' }}>
      {/* Header */}
      <div className="p-4" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', boxShadow: '0 4px 14px rgba(124,58,237,0.25)' }}>
        <h2 className="font-semibold">Chat with {phoneNumber}</h2>
      </div>
      
      {/* Error display */}
      {error && (
        <div className="px-4 py-2 rounded-none" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
          {error}
          <button 
            className="ml-2 font-bold" 
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}
      
      {/* Messages container with improved scrolling */}
      <div className="flex-grow overflow-y-auto p-4 space-y-3" style={{ background: '#f1f5f9' }}>
        {messages.length === 0 && (
          <div className="text-center py-10" style={{ color: '#94a3b8' }}>
            No messages yet. Start a conversation!
          </div>
        )}
        
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${
              message.sender === 'user' 
                ? 'justify-end' 
                : 'justify-start'
            }`}
          >
            <div 
              className="max-w-[70%] p-3 rounded-2xl"
              style={{
                background: message.sender === 'user' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : '#ffffff',
                color: message.sender === 'user' ? 'white' : '#0f172a',
                boxShadow: message.sender === 'user' ? '0 2px 12px rgba(124,58,237,0.2)' : '0 1px 6px rgba(0,0,0,0.05)',
                border: message.sender === 'user' ? 'none' : '1px solid #f1f5f9',
              }}
            >
              <div>{message.content}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
                {message.sender === 'user' && (
                  <span className="text-xs ml-2">
                    {message.status === MessageStatus.PENDING ? '⏳' : 
                     message.status === MessageStatus.FAILED ? '❌' : 
                     message.status === MessageStatus.DELIVERED ? '✓' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input with improved styling */}
      <div className="flex p-4 border-t" style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>
        <input 
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
          disabled={isLoading}
          className="flex-grow p-3 rounded-l-xl focus:outline-none text-sm"
          style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a' }}
          placeholder="Type a message..."
        />
        <button 
          onClick={sendMessage}
          disabled={isLoading || !newMessage.trim()}
          className="p-3 rounded-r-xl transition-all font-medium text-white text-sm"
          style={{
            background: isLoading || !newMessage.trim() ? '#e2e8f0' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            color: isLoading || !newMessage.trim() ? '#94a3b8' : '#ffffff',
            cursor: isLoading || !newMessage.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );

}