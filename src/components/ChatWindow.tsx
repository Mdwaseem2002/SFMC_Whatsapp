import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, ChevronLeft, MoreVertical, Search, Paperclip, Mic, Phone, Video } from 'lucide-react';
import { Contact, Message, MessageStatus } from '@/types';

interface ChatWindowProps {
  contact: Contact;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onSimulateIncoming: () => void;
  onCloseChat: () => void;
}

const formatMessageTime = (timestamp: string | number | Date) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

const formatLastSeen = (timestamp: string | number | Date | undefined) => {
  if (!timestamp) return 'Offline';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Offline';
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  if (diffMinutes < 1) return 'Online';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getMessageDate = (timestamp: string | number | Date) => {
  if (!timestamp) return 'Unknown';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Unknown';
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { 
    month: 'short', day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  });
};

const ChatWindow: React.FC<ChatWindowProps> = ({
  contact,
  messages,
  onSendMessage,
  onSimulateIncoming,
  onCloseChat,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (!isLoading && mounted) {
      const timeout = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [messages, isLoading, mounted]);

  // Simulate loading state and instant scroll on chat open
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (mounted) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'instant', block: 'end' });
        }, 50);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [contact.id, mounted]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
      setShowEmoji(false);
      inputRef.current?.focus();
    }
  };

  const handleFileInputClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) console.log('Selected file:', file.name);
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case MessageStatus.PENDING:
        return <span style={{ color: 'rgba(255,255,255,0.5)' }}>✓</span>;
      case MessageStatus.SENT:
        return <span style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '-0.15em' }}>✓✓</span>;
      case MessageStatus.DELIVERED:
        return <span style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '-0.15em' }}>✓✓</span>;
      case MessageStatus.READ:
        return <span style={{ color: '#a5f3fc', letterSpacing: '-0.15em' }}>✓✓</span>; 
      case MessageStatus.FAILED:
        return <span style={{ color: '#fca5a5', fontWeight: 'bold' }}>✗</span>;
      default:
        return <span style={{ color: 'rgba(255,255,255,0.5)' }}>✓</span>;
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const timestamp = typeof message.timestamp === 'string' 
      ? new Date(message.timestamp).getTime() 
      : message.timestamp;
    const messageDate = getMessageDate(timestamp);
    if (!groups[messageDate]) groups[messageDate] = [];
    groups[messageDate].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  const avatarColor = (() => {
    const colors = ['#8b5cf6', '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
    const hash = contact.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  })();

  const initials = contact.name.split(' ').map(w => w.charAt(0).toUpperCase()).slice(0, 2).join('');

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#f8fafc' }}>
      {/* ─── Chat Header ─── */}
      <div className="flex items-center px-4 py-2.5 border-b" style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderColor: '#e2e8f0' }}>
        <motion.button 
          onClick={onCloseChat} 
          className="mr-2 rounded-xl p-1.5 transition-colors"
          style={{ color: '#64748b' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; e.currentTarget.style.color = '#8b5cf6'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft size={22} />
        </motion.button>

        <div 
          className="w-10 h-10 flex items-center justify-center rounded-xl mr-3 flex-shrink-0 text-white font-semibold text-sm"
          style={{ backgroundColor: avatarColor, boxShadow: `0 4px 12px ${avatarColor}33` }}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-[15px] font-semibold truncate" style={{ color: '#0f172a' }}>{contact.name}</h2>
          <p className="text-[11px]" style={{ color: '#64748b' }}>
            {mounted ? (
              contact.online ? (
                <span style={{ color: '#10b981' }}>Online</span>
              ) : (
                formatLastSeen(contact.lastSeen)
              )
            ) : null}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {[Video, Phone, Search, MoreVertical].map((Icon, i) => (
            <button key={i} className="p-2 rounded-xl transition-colors" style={{ color: '#94a3b8' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; e.currentTarget.style.color = '#8b5cf6'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>
      </div>

      {/* ─── Chat Messages ─── */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-[6%] py-3"
        style={{ background: '#f1f5f9' }}
      >
        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#8b5cf6', borderTopColor: 'transparent' }}></div>
            </div>
            <p className="text-xs mt-3" style={{ color: '#94a3b8' }}>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="rounded-2xl px-6 py-4 text-center max-w-xs border" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', borderColor: '#e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              <p className="text-sm font-medium" style={{ color: '#0f172a' }}>
                No messages yet.
              </p>
              <p className="text-xs mt-1" style={{ color: '#64748b' }}>
                Send a message to start chatting with {contact.name}
              </p>
            </div>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex justify-center my-3">
                <span className="text-[11px] px-4 py-1.5 rounded-full font-medium" style={{ background: 'rgba(255,255,255,0.85)', color: '#64748b', border: '1px solid #e2e8f0', backdropFilter: 'blur(4px)' }}>
                  {mounted ? date : '...'}
                </span>
              </div>
              
              {dateMessages.map((message, index) => {
                const isSent = message.sender === 'user';
                const prevMessage = index > 0 ? dateMessages[index - 1] : null;
                const isFirstInGroup = !prevMessage || prevMessage.sender !== message.sender;

                return (
                  <div
                    key={message.id}
                    className={`flex ${isSent ? 'justify-end' : 'justify-start'} ${isFirstInGroup ? 'mt-2' : 'mt-[3px]'}`}
                  >
                    <div
                      className="relative max-w-[65%] px-3 pt-2 pb-2"
                      style={{
                        background: isSent ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : '#ffffff',
                        borderRadius: '16px',
                        borderTopRightRadius: isSent && isFirstInGroup ? '4px' : '16px',
                        borderTopLeftRadius: !isSent && isFirstInGroup ? '4px' : '16px',
                        boxShadow: isSent ? '0 2px 12px rgba(124,58,237,0.2)' : '0 1px 6px rgba(0,0,0,0.05)',
                        border: isSent ? 'none' : '1px solid #f1f5f9',
                      }}
                    >
                      {/* Message content */}
                      <div className="break-words">
                        <span className="text-[13.5px] leading-[19px]" style={{ color: isSent ? '#ffffff' : '#0f172a' }}>
                          {message.content}
                        </span>
                        <span className="inline-flex items-end ml-1 float-right mt-[3px] pl-1 gap-[3px]">
                          <span className="text-[11px] leading-none" style={{ color: isSent ? 'rgba(255,255,255,0.6)' : '#94a3b8' }}>
                            {mounted ? formatMessageTime(message.timestamp) : ''}
                          </span>
                          {isSent && (
                            <span className="text-[13px] leading-none mb-[-1px]">
                              {getStatusIcon(message.status)}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ─── Emoji Picker ─── */}
      {showEmoji && (
        <motion.div 
          className="p-2 grid grid-cols-9 gap-1 max-h-40 overflow-y-auto border-t"
          style={{ background: '#ffffff', borderColor: '#e2e8f0' }}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "10rem" }}
        >
          {["😊","😂","🤣","❤️","👍","🔥","🎉","😍","😘","🥰","😁","👋","🤔","🙏","👏","🎂","🌹","💯","😎","🤝","💪","🙌","😢","🤗","😇","🥺","😤","🤩"].map(emoji => (
            <button
              key={emoji}
              className="text-xl rounded-lg p-1.5 transition-colors"
              style={{ }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              onClick={() => setNewMessage(current => current + emoji)}
            >
              {emoji}
            </button>
          ))}
        </motion.div>
      )}

      {/* ─── Message Input ─── */}
      <div className="px-3 py-2.5 flex items-center gap-2 border-t" style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>
        <div className="flex-1 flex items-center rounded-xl px-2 min-h-[44px]" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <button 
            className="p-1.5 transition-colors rounded-full"
            style={{ color: '#94a3b8' }}
            onClick={() => setShowEmoji(!showEmoji)}
          >
            <span className="text-lg">😊</span>
          </button>
          
          <button 
            className="p-1.5 transition-colors rounded-full"
            style={{ color: '#94a3b8' }}
            onClick={handleFileInputClick}
          >
            <Paperclip size={18} />
          </button>
          
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          
          <form onSubmit={handleSubmit} className="flex-1 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message"
              className="flex-1 py-2 px-3 bg-transparent text-[14px] focus:outline-none"
              style={{ color: '#0f172a' }}
            />
          </form>
          
          <button className="p-1.5 transition-colors rounded-full" style={{ color: '#94a3b8' }}>
            <Mic size={18} />
          </button>
        </div>
        
        <motion.button
          onClick={handleSubmit}
          className="p-2.5 rounded-xl transition-all"
          style={{
            background: newMessage.trim() ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : '#f1f5f9',
            color: newMessage.trim() ? '#ffffff' : '#94a3b8',
            boxShadow: newMessage.trim() ? '0 4px 12px rgba(124,58,237,0.25)' : 'none',
          }}
          whileTap={{ scale: 0.9 }}
        >
          {newMessage.trim() ? <Send size={18} /> : <Mic size={18} />}
        </motion.button>
      </div>
    </div>
  );
};

export default ChatWindow;