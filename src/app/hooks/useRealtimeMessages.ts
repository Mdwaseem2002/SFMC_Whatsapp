import { useState, useEffect } from 'react';
import { Contact, Message } from '@/types';

export function useRealtimeMessages(selectedContact: Contact | null) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!selectedContact) return;

    // Initial fetch
    const fetchMessages = async () => {
      try {
        const normalizedPhone = selectedContact.phoneNumber.replace(/^\+/, '');
        const response = await fetch(`/api/messages?phoneNumber=${normalizedPhone}`);
        const data = await response.json();
        
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    // Create an EventSource for real-time updates
    const setupEventSource = () => {
      const normalizedPhone = selectedContact.phoneNumber.replace(/^\+/, '');
      const eventSource = new EventSource(`/api/messages/stream?phoneNumber=${normalizedPhone}`);

      eventSource.onmessage = (event) => {
        const newMessage = JSON.parse(event.data);
        setMessages(prevMessages => {
          const index = prevMessages.findIndex(msg => msg.id === newMessage.id);
          if (index !== -1) {
            // Update existing message
            const updated = [...prevMessages];
            updated[index] = { ...updated[index], ...newMessage };
            return updated;
          }
          // Add new message
          return [...prevMessages, newMessage];
        });
      };

      eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
        eventSource.close();
      };

      return () => eventSource.close();
    };

    fetchMessages();
    const cleanup = setupEventSource();

    return () => {
      cleanup();
    };
  }, [selectedContact]);

  return messages;
}