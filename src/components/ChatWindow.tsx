import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronLeft, MoreVertical, Search, Paperclip, Mic, Phone, Video, Zap, X, FileText, Download, Info, Reply, Copy, Forward, Pin, Star, Trash2, Smile, Cloud, Loader2 } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { Contact, Message, MessageStatus } from '@/types';

interface ChatWindowProps {
  contact: Contact;
  messages: Message[];
  onSendMessage: (content: string, options?: { mediaId?: string; mediaType?: string; mimeType?: string; filename?: string }) => void;
  onSimulateIncoming: () => void;
  onCloseChat: () => void;
}

const formatMessageTime = (timestamp: string | number | Date) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', minute: '2-digit', hour12: true 
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
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // UI-only overrides tracking
  const [localMods, setLocalMods] = useState<Record<string, { deleted?: boolean; pinned?: boolean; starred?: boolean; reaction?: string }>>({});
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // Context Menu State
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ messageId: string; x: number; y: number; isSent: boolean } | null>(null);
  
  // Close context menu on outside click
  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  useEffect(() => { setMounted(true); }, []);

  // Scroll to bottom
  useEffect(() => {
    if (!isLoading && mounted) {
      const timeout = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [messages, isLoading, mounted]);

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
      let finalMessage = newMessage.trim();
      
      if (replyingTo && replyingTo.content) {
        const previewText = replyingTo.content.substring(0, 60).replace(/\n/g, ' ');
        finalMessage = `> Replying to: ${previewText}\n\n${finalMessage}`;
      }
      
      onSendMessage(finalMessage);
      setNewMessage('');
      setShowEmoji(false);
      setReplyingTo(null);
      inputRef.current?.focus();
    }
  };

  const onEmojiClick = (emojiData: any) => {
    setNewMessage(prev => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setShowEmoji(false);

      // Fetch config dynamically since we are client-side without direct process.env
      const envRes = await fetch('/api/get-env-variables');
      const envData = await envRes.json();
      if (!envRes.ok) throw new Error('Could not get tokens for upload');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('accessToken', envData.accessToken);
      formData.append('phoneNumberId', envData.phoneNumberId);

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Upload failed');

      let mediaType = 'document';
      if (file.type.startsWith('image/')) mediaType = 'image';
      else if (file.type.startsWith('video/')) mediaType = 'video';
      else if (file.type.startsWith('audio/')) mediaType = 'audio';

      let caption = newMessage.trim() || '';
      
      onSendMessage(caption, { 
        mediaId: data.id, 
        mediaType, 
        mimeType: file.type, 
        filename: file.name
      });
      
      setNewMessage('');
      setReplyingTo(null);
    } catch (err: any) {
      console.error('File Upload Error:', err);
      alert('Failed to upload file: ' + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };


  const handleAction = (e: React.MouseEvent, action: string, msgId: string, msg: Message) => {
    e.stopPropagation();
    setContextMenu(null);
    
    setLocalMods(prev => {
      const current = prev[msgId] || {};
      
      switch (action) {
        case 'delete': return { ...prev, [msgId]: { ...current, deleted: true } };
        case 'pin': return { ...prev, [msgId]: { ...current, pinned: !current.pinned } };
        case 'star': return { ...prev, [msgId]: { ...current, starred: !current.starred } };
        case 'react': 
          // Extract specific reaction emoji if passed as 'react:👍'
          return prev; 
        default: return prev;
      }
    });

    if (action.startsWith('react:')) {
      const emoji = action.split(':')[1];
      setLocalMods(prev => ({ ...prev, [msgId]: { ...(prev[msgId]||{}), reaction: emoji } }));
    } else if (action === 'reply') {
      setReplyingTo(msg);
      inputRef.current?.focus();
    } else if (action === 'copy') {
      navigator.clipboard.writeText(msg.content || '');
    } else if (action === 'forward') {
      alert('Forward picker modal would open here (UI simulation).');
    } else if (action === 'info') {
      alert('Message details modal would open here.');
    }
  };

  const openContextMenu = (e: React.MouseEvent, msgId: string, isSent: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Position menu: try dropping down, if too low, open upward
    let y = rect.bottom + 5;
    if (y + 350 > windowHeight) {
      y = rect.top - 350;
    }
    
    setContextMenu({ 
      messageId: msgId, 
      x: isSent ? rect.right - 220 : rect.left, 
      y, 
      isSent 
    });
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case MessageStatus.PENDING: return <span style={{ color: 'rgba(255,255,255,0.5)' }}>✓</span>;
      case MessageStatus.SENT:
      case MessageStatus.DELIVERED: return <span style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '-0.15em' }}>✓✓</span>;
      case MessageStatus.READ: return <span style={{ color: '#a5f3fc', letterSpacing: '-0.15em' }}>✓✓</span>;
      case MessageStatus.FAILED: return <span style={{ color: '#fca5a5', fontWeight: 'bold' }}>✗</span>;
      default: return <span style={{ color: 'rgba(255,255,255,0.5)' }}>✓</span>;
    }
  };

  const activePinnedMsg = messages.find(m => localMods[m.id]?.pinned && !localMods[m.id]?.deleted);

  // Filter deleted messages and deduplicate by id
  const visibleMessages = (() => {
    const seen = new Set<string>();
    return messages.filter(m => {
      if (localMods[m.id]?.deleted) return false;
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  })();

  const groupedMessages = visibleMessages.reduce((groups, message) => {
    const timestamp = typeof message.timestamp === 'string' ? new Date(message.timestamp).getTime() : message.timestamp;
    const dateStr = getMessageDate(timestamp);
    if (!groups[dateStr]) groups[dateStr] = [];
    groups[dateStr].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  const avatarColor = (() => {
    const colors = ['#3b82f6', '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
    const hash = contact.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  })();
  const initials = contact.name.split(' ').map(w => w.charAt(0).toUpperCase()).slice(0, 2).join('');

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 relative font-sans">
      
      {/* ─── Chat Header ─── */}
      <div className="flex items-center px-4 py-2.5 border-b border-slate-200 bg-white/90 backdrop-blur-md z-10">
        <button 
          onClick={onCloseChat} 
          className="mr-2 rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft size={22} />
        </button>

        <div className="w-10 h-10 flex items-center justify-center rounded-xl mr-3 shrink-0 text-white font-semibold text-sm shadow-sm" style={{ backgroundColor: avatarColor }}>
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-[15px] font-bold text-slate-900 truncate">{contact.name}</h2>
          <p className="text-[11.5px] font-medium text-slate-500">
            {mounted ? (contact.online ? <span className="text-emerald-500">Online</span> : formatLastSeen(contact.lastSeen)) : null}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {[Video, Phone, Search, MoreVertical].map((Icon, i) => (
            <button key={i} className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
              <Icon size={18} />
            </button>
          ))}
        </div>
      </div>

      {/* Pinned Message Bar */}
      {activePinnedMsg && (
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center gap-3 cursor-pointer shadow-sm z-10">
          <Pin size={14} className="text-slate-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">Pinned Message</p>
            <p className="text-[13px] text-slate-600 truncate">{activePinnedMsg.content}</p>
          </div>
          <button onClick={() => setLocalMods(p => ({ ...p, [activePinnedMsg.id]: { ...p[activePinnedMsg.id], pinned: false } }))} className="p-1 rounded-md hover:bg-slate-200 text-slate-400 pointer-events-auto">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ─── Chat Messages ─── */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-[6%] py-4 bg-slate-100 relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin mb-3"></div>
            <p className="text-xs font-medium text-slate-500">Loading messages...</p>
          </div>
        ) : visibleMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-white/80 backdrop-blur border border-slate-200 px-6 py-4 rounded-2xl shadow-sm text-center">
              <p className="text-sm font-semibold text-slate-900">No messages yet.</p>
              <p className="text-[13px] font-medium text-slate-500 mt-1">Send a message to start chatting.</p>
            </div>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              <div className="flex justify-center my-4">
                <span className="text-[11px] px-4 py-1.5 rounded-full font-bold uppercase tracking-wider bg-white/80 border border-slate-200 text-slate-500 shadow-sm backdrop-blur-sm">
                  {mounted ? date : '...'}
                </span>
              </div>
              
              {dateMessages.map((message, index) => {
                const isSent = message.sender === 'user';
                const isFirstInGroup = index === 0 || dateMessages[index - 1].sender !== message.sender;
                const mods = localMods[message.id] || {};
                const hasQuote = message.content && message.content.startsWith('> Replying to:');
                
                // SFMC detection: messages sent via SFMC Journey Builder are stored
                // with content like "[Template: template_name]" by /api/send-whatsapp
                const isSfmc = isSent && /^\[Template:\s/.test(message.content || '');
                
                let rawText = message.content || '';
                let quoteText = '';
                
                if (hasQuote) {
                  const parts = rawText.split('\n\n');
                  if (parts.length > 1) {
                    quoteText = parts[0].replace('> Replying to:', '').trim();
                    rawText = parts.slice(1).join('\n\n').trim();
                  }
                }

                return (
                  <div key={message.id} className={`flex ${isSent ? 'justify-end' : 'justify-start'} ${isFirstInGroup ? 'mt-3' : 'mt-1'}`}>
                    <div 
                      className={`relative max-w-[70%] group`}
                      onMouseEnter={() => setHoveredMessageId(message.id)}
                      onMouseLeave={() => setHoveredMessageId(null)}
                    >
                      <div className="flex flex-col">
                        
                        {/* The visible bubble */}
                        <div
                          className="relative px-3 pt-2 pb-2 transition-shadow shadow-sm"
                          style={{
                            background: isSent ? '#2563eb' : '#ffffff',
                            borderRadius: '12px',
                            borderTopRightRadius: isSent && isFirstInGroup ? '2px' : '12px',
                            borderTopLeftRadius: !isSent && isFirstInGroup ? '2px' : '12px',
                            border: isSent ? 'none' : '1px solid #e2e8f0',
                          }}
                        >
                          {/* Chevron Context Menu Trigger */}
                          {hoveredMessageId === message.id && (
                            <button 
                              onClick={(e) => openContextMenu(e, message.id, isSent)}
                              className={`absolute top-1 right-2 w-6 h-6 rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10
                                ${isSent ? 'bg-blue-600/80 text-white hover:bg-blue-700' : 'bg-white/80 text-slate-500 hover:bg-slate-100'}
                              `}
                            >
                              <MoreVertical size={14} />
                            </button>
                          )}

                          <div className="break-words relative">
                            
                            {/* Render Embedded Quote */}
                            {hasQuote && quoteText && (
                              <div className="mt-1 mb-2 bg-black/10 rounded-lg p-2 border-l-4 border-blue-300">
                                <p className="text-[11px] font-bold text-blue-100 mb-0.5">{isSent ? 'You' : contact.name}</p>
                                <p className="text-[12px] opacity-90 line-clamp-1" style={{ color: isSent ? '#ffffff' : '#64748b' }}>{quoteText}</p>
                              </div>
                            )}

                            {(!message.mediaType || message.mediaType === 'text') && (
                              <span className="text-[14px] leading-relaxed pr-2" style={{ color: isSent ? '#ffffff' : '#0f172a' }}>
                                {rawText}
                              </span>
                            )}
                            
                            {/* Media Elements */}
                            {(message.mediaType === 'image' || message.mediaType === 'sticker') && message.mediaId && (
                              <img src={`/api/media?mediaId=${message.mediaId}`} alt={message.caption} className="rounded-lg object-cover w-[260px] cursor-pointer bg-slate-100 min-h-[120px]" />
                            )}
                            
                            {/* Meta row at bottom right of bubble */}
                            <div className="inline-flex items-center gap-1.5 float-right mt-1.5 ml-3 pl-1 pb-0.5">
                              {mods.starred && <Star size={10} className={`${isSent ? 'fill-blue-200 text-blue-200' : 'fill-slate-400 text-slate-400'}`} />}
                              <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: isSent ? 'rgba(255,255,255,0.7)' : '#94a3b8' }}>
                                {mounted ? formatMessageTime(message.timestamp) : ''}
                              </span>
                              {isSent && <span className="text-[12px] leading-none mb-0.5">{getStatusIcon(message.status)}</span>}
                            </div>

                            {/* SFMC Badge */}
                            {isSfmc && (
                              <div className="flex justify-end mt-1.5 clear-both" title="This message was sent via Salesforce Marketing Cloud Journey Builder">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-500 border border-orange-200">
                                  <Cloud size={10} /> Via SFMC
                                </span>
                              </div>
                            )}

                          </div>
                        </div>

                        {/* External Reaction Display */}
                        {mods.reaction && (
                          <div className={`absolute -bottom-3 ${isSent ? 'right-4' : 'left-4'} bg-white border border-slate-200 shadow-sm rounded-full px-1.5 py-0.5 text-[14px] z-10`}>
                            {mods.reaction}
                          </div>
                        )}
                        
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} className="h-6" /> {/* Spacer */}
      </div>

      {/* ─── Context Menu (WhatsApp Web Style) ─── */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="fixed bg-slate-800 rounded-xl shadow-2xl py-1.5 z-[100] border border-slate-700 min-w-[180px] overflow-hidden"
            style={{ 
              top: contextMenu.y, 
              left: contextMenu.x,
              transformOrigin: contextMenu.isSent ? 'top right' : 'top left'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Quick Reactions */}
            <div className="px-3 py-2 border-b border-slate-700/50 flex justify-between">
              {['👍','❤️','😂','😮','😢','🙏'].map(emoji => (
                <button 
                  key={emoji}
                  onClick={(e) => handleAction(e, `react:${emoji}`, contextMenu.messageId, messages.find(m=>m.id===contextMenu.messageId)!)}
                  className="text-lg hover:scale-125 transition-transform p-1"
                >{emoji}</button>
              ))}
            </div>
            
            {/* Action List */}
            {([
              { id: 'info', icon: <Info size={14} />, label: 'Message info' },
              { id: 'reply', icon: <Reply size={14} />, label: 'Reply' },
              { id: 'copy', icon: <Copy size={14} />, label: 'Copy' },
              { id: 'react', icon: <Smile size={14} />, label: 'React' },
              { id: 'forward', icon: <Forward size={14} />, label: 'Forward' },
              { id: 'pin', icon: <Pin size={14} />, label: 'Pin' },
              { id: 'star', icon: <Star size={14} />, label: 'Star' },
              { id: 'delete', icon: <Trash2 size={14} className="text-red-400" />, label: 'Delete', danger: true },
            ]).map(row => (
              <button
                key={row.id}
                onClick={e => handleAction(e, row.id, contextMenu.messageId, messages.find(m=>m.id===contextMenu.messageId)!)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors hover:bg-slate-700/50
                  ${'danger' in row && row.danger ? 'text-red-400' : 'text-slate-200'}
                `}
              >
                {row.icon} {row.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Reply Preview Bar ─── */}
      {replyingTo && (
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-[0_-4px_10px_rgb(0,0,0,0.02)] z-10 relative">
          <div className="flex-1 min-w-0 border-l-4 border-blue-500 pl-3">
            <p className="text-[11px] font-bold text-blue-600 mb-0.5">
              Replying to {replyingTo.sender === 'user' ? 'yourself' : contact.name}
            </p>
            <p className="text-[13px] text-slate-500 truncate font-medium">
              {replyingTo.content}
            </p>
          </div>
          <button 
            onClick={() => setReplyingTo(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors shrink-0 m-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ─── Message Input Bar ─── */}
      <div className="px-4 py-3 pb-4 bg-white border-t border-slate-200 flex items-end gap-3 z-20 relative">
        
        {/* Emoji Picker Popover */}
        <AnimatePresence>
          {showEmoji && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-[calc(100%+12px)] left-4 z-[100] shadow-2xl rounded-xl custom-emoji-picker-container"
            >
              <EmojiPicker onEmojiClick={onEmojiClick} autoFocusSearch={false} width={320} height={400} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Left Actions (Emoji, Attach) */}
        <div className="flex bg-slate-50 border border-slate-200 rounded-xl px-1.5 py-1.5 shadow-sm">
          <button onClick={() => setShowEmoji(!showEmoji)} className={`p-2 rounded-lg transition-colors ${showEmoji ? 'text-blue-600 bg-blue-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}>
            <Smile size={20} />
          </button>
          <div className="w-[1px] bg-slate-200 mx-1 my-1"></div>
          <button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            {isUploading ? <Loader2 size={20} className="animate-spin text-blue-500" /> : <Paperclip size={20} />}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload}
            className="hidden" 
          />
        </div>

        {/* Text Input Container (Center) */}
        <form onSubmit={handleSubmit} className="flex-1 flex bg-slate-50 border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[44px]">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-transparent text-[14px] text-slate-900 focus:outline-none placeholder:text-slate-400 font-medium"
          />
        </form>

        {/* Send Button (Right) */}
        <button
          onClick={handleSubmit}
          className={`p-3 rounded-xl transition-all shadow-sm shrink-0 flex items-center justify-center min-h-[44px] min-w-[44px]
            ${newMessage.trim() ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}
          `}
        >
          {newMessage.trim() ? <Send size={18} /> : <Mic size={18} />}
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;