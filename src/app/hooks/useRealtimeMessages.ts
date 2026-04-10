import { useState, useEffect, useRef } from 'react';
import { Contact, Message } from '@/types';

export function useRealtimeMessages(selectedContact: Contact | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  // Track which contact the current messages belong to
  const currentPhoneRef = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedContact) {
      setMessages([]);
      currentPhoneRef.current = null;
      return;
    }

    const normalizedPhone = selectedContact.phoneNumber.replace(/^\+/, '');

    // CRITICAL: Reset messages immediately when switching contacts
    // This prevents stale messages from being shown under the wrong contact
    if (currentPhoneRef.current !== normalizedPhone) {
      setMessages([]);
      currentPhoneRef.current = normalizedPhone;
    }

    // Initial fetch
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages?phoneNumber=${normalizedPhone}&limit=500`);
        const data = await response.json();
        
        // Only set messages if we're still viewing the same contact
        if (currentPhoneRef.current === normalizedPhone && data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    // Create an EventSource for real-time updates
    const setupEventSource = () => {
      const eventSource = new EventSource(`/api/messages/stream?phoneNumber=${normalizedPhone}`);

      eventSource.onmessage = (event) => {
        const newMessage = JSON.parse(event.data);
        // Only process if still viewing the same contact
        if (currentPhoneRef.current !== normalizedPhone) return;

        setMessages(prevMessages => {
          const index = prevMessages.findIndex(msg => msg.id === newMessage.id);
          if (index !== -1) {
            const updated = [...prevMessages];
            updated[index] = { ...updated[index], ...newMessage };
            return updated;
          }
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

  return { messages, phoneNumber: currentPhoneRef.current };
}