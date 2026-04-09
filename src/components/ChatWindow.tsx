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

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate loading state
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, [contact.id]);

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
        return <span className="text-[#667781]">✓</span>;
      case MessageStatus.SENT:
        return <span className="text-[#667781] tracking-[-0.15em]">✓✓</span>;
      case MessageStatus.DELIVERED:
        return <span className="text-[#667781] tracking-[-0.15em]">✓✓</span>;
      case MessageStatus.READ:
        return <span className="text-[#53bdeb] tracking-[-0.15em]">✓✓</span>; 
      case MessageStatus.FAILED:
        return <span className="text-red-400 font-bold">✗</span>;
      default:
        return <span className="text-[#667781]">✓</span>;
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
    const colors = ['#00A884', '#34B7F1', '#F15C6D', '#A15CDE', '#F1AE5C', '#5CCEF1'];
    const hash = contact.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  })();

  const initials = contact.name.split(' ').map(w => w.charAt(0).toUpperCase()).slice(0, 2).join('');

  return (
    <div className="flex flex-col h-full bg-[#0b141a] overflow-hidden">
      {/* ─── Chat Header ─── */}
      <div className="flex items-center px-4 py-2.5 bg-[#1f2c34] border-b border-[#2a3942]">
        <motion.button 
          onClick={onCloseChat} 
          className="mr-2 text-[#8696a0] hover:text-[#e9edef] rounded-full p-1.5 hover:bg-[#2a3942] transition-colors"
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft size={22} />
        </motion.button>

        <div 
          className="w-10 h-10 flex items-center justify-center rounded-full mr-3 flex-shrink-0 text-white font-semibold text-sm"
          style={{ backgroundColor: avatarColor }}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-[15px] font-medium text-[#e9edef] truncate">{contact.name}</h2>
          <p className="text-[11px] text-[#8696a0]">
            {contact.online ? (
              <span className="text-[#00A884]">Online</span>
            ) : (
              formatLastSeen(contact.lastSeen)
            )}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button className="text-[#8696a0] hover:text-[#e9edef] p-2 rounded-full hover:bg-[#2a3942] transition-colors">
            <Video size={18} />
          </button>
          <button className="text-[#8696a0] hover:text-[#e9edef] p-2 rounded-full hover:bg-[#2a3942] transition-colors">
            <Phone size={18} />
          </button>
          <button className="text-[#8696a0] hover:text-[#e9edef] p-2 rounded-full hover:bg-[#2a3942] transition-colors">
            <Search size={18} />
          </button>
          <button className="text-[#8696a0] hover:text-[#e9edef] p-2 rounded-full hover:bg-[#2a3942] transition-colors">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* ─── Chat Messages ─── */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-[6%] py-3"
        style={{ backgroundColor: '#0b141a' }}
      >
        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 border-2 border-[#00A884] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-[#667781] text-xs mt-3">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-[#1f2c34] rounded-xl px-6 py-4 text-center max-w-xs shadow-lg border border-[#2a3942]">
              <p className="text-[#e9edef] text-sm">
                No messages yet.
              </p>
              <p className="text-[#8696a0] text-xs mt-1">
                Send a message to start chatting with {contact.name}
              </p>
            </div>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex justify-center my-3">
                <span className="bg-[#1f2c34] text-[#8696a0] text-[11px] px-3 py-1.5 rounded-lg shadow-sm border border-[#2a3942]">
                  {date}
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
                      className={`relative max-w-[65%] px-[9px] pt-[6px] pb-[7px] shadow-sm ${
                        isSent 
                          ? 'bg-[#005c4b] rounded-lg' 
                          : 'bg-[#1f2c34] rounded-lg'
                      } ${
                        isSent && isFirstInGroup ? 'rounded-tr-none' : ''
                      } ${
                        !isSent && isFirstInGroup ? 'rounded-tl-none' : ''
                      }`}
                    >
                      {/* Tail for first message in group */}
                      {isFirstInGroup && isSent && (
                        <div className="absolute -right-[8px] top-0 w-[8px] h-[13px] overflow-hidden">
                          <div className="absolute top-0 right-0 w-[12px] h-[12px] bg-[#005c4b] transform rotate-[35deg] origin-top-left"></div>
                        </div>
                      )}
                      {isFirstInGroup && !isSent && (
                        <div className="absolute -left-[8px] top-0 w-[8px] h-[13px] overflow-hidden">
                          <div className="absolute top-0 left-0 w-[12px] h-[12px] bg-[#1f2c34] transform -rotate-[35deg] origin-top-right"></div>
                        </div>
                      )}

                      {/* Message content */}
                      <div className="break-words">
                        <span className={`text-[13.5px] leading-[19px] ${
                          isSent ? 'text-[#e9edef]' : 'text-[#e9edef]'
                        }`}>
                          {message.content}
                        </span>
                        <span className="inline-flex items-end ml-1 float-right mt-[3px] pl-1 gap-[3px]">
                          <span className={`text-[11px] leading-none ${
                            isSent ? 'text-[#ffffff80]' : 'text-[#667781]'
                          }`}>
                            {formatMessageTime(message.timestamp)}
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
          className="bg-[#1f2c34] border-t border-[#2a3942] p-2 grid grid-cols-9 gap-1 max-h-40 overflow-y-auto"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "10rem" }}
        >
          {["😊","😂","🤣","❤️","👍","🔥","🎉","😍","😘","🥰","😁","👋","🤔","🙏","👏","🎂","🌹","💯","😎","🤝","💪","🙌","😢","🤗","😇","🥺","😤","🤩"].map(emoji => (
            <button
              key={emoji}
              className="text-xl hover:bg-[#2a3942] rounded-lg p-1.5 transition-colors"
              onClick={() => setNewMessage(current => current + emoji)}
            >
              {emoji}
            </button>
          ))}
        </motion.div>
      )}

      {/* ─── Message Input ─── */}
      <div className="px-3 py-2 bg-[#1f2c34] flex items-center gap-2 border-t border-[#2a3942]">
        <div className="flex-1 flex items-center bg-[#2a3942] rounded-lg px-2 min-h-[42px]">
          <button 
            className="p-1.5 text-[#8696a0] hover:text-[#e9edef] transition-colors rounded-full"
            onClick={() => setShowEmoji(!showEmoji)}
          >
            <span className="text-lg">😊</span>
          </button>
          
          <button 
            className="p-1.5 text-[#8696a0] hover:text-[#e9edef] transition-colors rounded-full"
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
              className="flex-1 py-2 px-3 bg-transparent text-[#e9edef] text-[14px] focus:outline-none placeholder:text-[#8696a0]"
            />
          </form>
          
          <button className="p-1.5 text-[#8696a0] hover:text-[#e9edef] transition-colors rounded-full">
            <Mic size={18} />
          </button>
        </div>
        
        <motion.button
          onClick={handleSubmit}
          className={`p-2.5 rounded-full transition-colors ${
            newMessage.trim() 
              ? 'bg-[#00A884] hover:bg-[#06cf9c] text-white' 
              : 'bg-[#2a3942] text-[#8696a0]'
          }`}
          whileTap={{ scale: 0.9 }}
        >
          {newMessage.trim() ? <Send size={18} /> : <Mic size={18} />}
        </motion.button>
      </div>
    </div>
  );
};

export default ChatWindow;