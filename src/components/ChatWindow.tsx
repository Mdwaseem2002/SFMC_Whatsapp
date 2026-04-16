import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronLeft, MoreVertical, Search, Paperclip, Mic, Phone, Video, Zap, X, FileText, Download } from 'lucide-react';
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
  const [showFastReplies, setShowFastReplies] = useState(false);
  const [fastReplies, setFastReplies] = useState<{ id: string; shortcut: string; message: string }[]>([]);

  const handleToggleFastReplies = () => {
    if (!showFastReplies) {
      const saved = localStorage.getItem('fastReplies');
      if (saved) {
        try {
          setFastReplies(JSON.parse(saved));
        } catch (e) {
          console.error('Error parsing fast replies', e);
        }
      } else {
        setFastReplies([]);
      }
    }
    setShowFastReplies(!showFastReplies);
  };

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
                        {(!message.mediaType || message.mediaType === 'text') && (
                          <span className="text-[13.5px] leading-[19px]" style={{ color: isSent ? '#ffffff' : '#0f172a' }}>
                            {message.content}
                          </span>
                        )}
                        {(message.mediaType === 'image' || message.mediaType === 'sticker') && message.mediaId && (
                          <div className="flex flex-col gap-1 max-w-[280px]">
                            <img 
                              src={`/api/media?mediaId=${message.mediaId}`} 
                              alt={message.caption || "Image"} 
                              className="rounded-lg object-cover w-full cursor-pointer hover:opacity-95 transition-opacity bg-slate-100" 
                              style={{ minHeight: '120px' }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                            <div className="items-center justify-center rounded-lg p-4" style={{ display: 'none', background: isSent ? 'rgba(255,255,255,0.1)' : '#f1f5f9', minHeight: '80px' }}>
                              <span className="text-xs" style={{ color: isSent ? 'rgba(255,255,255,0.7)' : '#64748b' }}>📷 Media unavailable</span>
                            </div>
                            {message.caption && <span className="text-[13.5px] leading-[19px] mt-1" style={{ color: isSent ? '#ffffff' : '#0f172a' }}>{message.caption}</span>}
                          </div>
                        )}
                        {message.mediaType === 'video' && message.mediaId && (
                          <div className="flex flex-col gap-1 max-w-[280px]">
                            <video src={`/api/media?mediaId=${message.mediaId}`} controls className="rounded-lg w-full bg-slate-900" style={{ minHeight: '120px' }} />
                            {message.caption && <span className="text-[13.5px] leading-[19px] mt-1" style={{ color: isSent ? '#ffffff' : '#0f172a' }}>{message.caption}</span>}
                          </div>
                        )}
                        {message.mediaType === 'audio' && message.mediaId && (
                          <div className="flex flex-col gap-1 w-[240px] mt-1">
                            <audio src={`/api/media?mediaId=${message.mediaId}`} controls className="w-full h-10" />
                          </div>
                        )}
                        {message.mediaType === 'document' && message.mediaId && (
                          <div className="flex flex-col gap-1 max-w-[280px]">
                            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: isSent ? 'rgba(255,255,255,0.1)' : '#f8fafc', border: isSent ? '1px solid rgba(255,255,255,0.2)' : '1px solid #e2e8f0' }}>
                              <div className="p-2 rounded-full" style={{ background: isSent ? 'rgba(255,255,255,0.2)' : '#e2e8f0' }}>
                                <FileText size={18} style={{ color: isSent ? '#ffffff' : '#475569' }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold truncate" style={{ color: isSent ? '#ffffff' : '#0f172a' }}>{message.filename || 'Document'}</p>
                                <p className="text-[10px] truncate" style={{ color: isSent ? 'rgba(255,255,255,0.7)' : '#64748b' }}>{message.mimeType || 'file'}</p>
                              </div>
                              <a 
                                href={`/api/media?mediaId=${message.mediaId}&download=true`} 
                                download 
                                className="p-1.5 rounded-full transition-colors flex-shrink-0"
                                style={{ background: isSent ? 'rgba(255,255,255,0.2)' : '#e0e7ff', color: isSent ? '#ffffff' : '#6366f1' }}
                                aria-label="Download Document"
                              >
                                <Download size={14} />
                              </a>
                            </div>
                            {message.caption && <span className="text-[13.5px] leading-[19px] mt-1" style={{ color: isSent ? '#ffffff' : '#0f172a' }}>{message.caption}</span>}
                          </div>
                        )}
                        {/* Debug fallback: show media type if not rendered by any block above */}
                        {message.mediaType && message.mediaType !== 'text' && !message.mediaId && (
                          <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: isSent ? 'rgba(255,255,255,0.1)' : '#fef3c7', border: '1px solid #fcd34d' }}>
                            <span className="text-xs" style={{ color: '#92400e' }}>⚠️ [{message.mediaType}] — mediaId missing</span>
                          </div>
                        )}
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
      <div className="px-3 py-2.5 flex items-center gap-2 border-t relative" style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>

        {/* --- Fast Replies Popover --- */}
        <AnimatePresence>
          {showFastReplies && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-[calc(100%+8px)] right-16 mb-1 w-64 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border overflow-hidden z-50 flex flex-col"
              style={{ borderColor: '#e2e8f0', maxHeight: '300px' }}
            >
              <div className="px-3 py-2 border-b bg-slate-50 border-slate-100 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Fast Replies</span>
                <button 
                  onClick={() => setShowFastReplies(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="overflow-y-auto flex-1">
                {fastReplies.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-xs text-slate-500">No fast replies yet.</p>
                    <p className="text-[10px] text-slate-400 mt-1">Add them in Settings</p>
                  </div>
                ) : (
                  fastReplies.map(reply => (
                    <button
                      key={reply.id}
                      className="w-full text-left p-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors"
                      onClick={() => {
                        setNewMessage(reply.message);
                        setShowFastReplies(false);
                        inputRef.current?.focus();
                      }}
                    >
                      <span className="block text-[11px] font-bold text-violet-500 mb-0.5">{reply.shortcut}</span>
                      <span className="block text-xs text-slate-600 line-clamp-2 leading-relaxed">{reply.message}</span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
          
          <button 
            type="button"
            className="p-1.5 transition-colors rounded-full relative group" 
            style={{ color: showFastReplies ? '#8b5cf6' : '#94a3b8' }}
            onClick={handleToggleFastReplies}
          >
            <Zap size={18} className={showFastReplies ? "fill-violet-100" : ""} />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">Fast Replies</span>
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