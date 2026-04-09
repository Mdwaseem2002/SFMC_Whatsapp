import React, { useState } from 'react';
import { Contact, Message } from '@/types';
import { formatTimestamp } from '@/utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, X, Check } from 'lucide-react';

interface ChatListProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact) => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (contactId: string) => void;
  messages: Record<string, Message[]>;
}

const ChatList: React.FC<ChatListProps> = ({
  contacts,
  selectedContact,
  onSelectContact,
  onEditContact,
  onDeleteContact,
  messages
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editName, setEditName] = useState('');

  const getLastMessage = (phoneNumber: string): { text: string; time: string } => {
    const normalizedPhone = phoneNumber.replace(/^\+/, '');
    const contactMessages = messages[normalizedPhone] || messages[phoneNumber] || [];
    if (contactMessages.length === 0) {
      return { text: 'No messages yet', time: '' };
    }
    
    const lastMsg = contactMessages[contactMessages.length - 1];
    return {
      text: lastMsg.content.length > 30
        ? lastMsg.content.substring(0, 27) + '...'
        : lastMsg.content,
      time: formatTimestamp(lastMsg.timestamp)
    };
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      '#00A884', '#34B7F1', '#F15C6D', '#A15CDE', '#F1AE5C', '#5CCEF1',
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const handleStartEdit = (e: React.MouseEvent, contact: Contact) => {
    e.stopPropagation();
    setEditingContact(contact);
    setEditName(contact.name);
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingContact && editName.trim()) {
      onEditContact({ ...editingContact, name: editName.trim() });
      setEditingContact(null);
    }
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingContact(null);
  };

  const handleDeleteClick = (e: React.MouseEvent, contactId: string) => {
    e.stopPropagation();
    setDeleteConfirmId(contactId);
  };

  const handleConfirmDelete = (e: React.MouseEvent, contactId: string) => {
    e.stopPropagation();
    onDeleteContact(contactId);
    setDeleteConfirmId(null);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(null);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#111B21]">
      <div className="sticky top-0 bg-[#111B21]/95 backdrop-blur-sm p-3.5 border-b border-[#2a3942] z-10">
        <h2 className="text-[15px] font-semibold text-[#e9edef] tracking-wide">Chats</h2>
      </div>
      
      {contacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center p-6">
          <div className="rounded-full bg-[#1f2c34] p-5 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#8696a0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-[#8696a0] text-sm">No contacts yet.</p>
          <p className="text-[#667781] text-xs mt-1">Add a recipient to start chatting.</p>
        </div>
      ) : (
        <div>
          {contacts.map(contact => {
            const lastMessage = getLastMessage(contact.phoneNumber);
            const isSelected = selectedContact?.id === contact.id;
            const isDeleting = deleteConfirmId === contact.id;
            const isEditing = editingContact?.id === contact.id;
            const initials = contact.name
              .split(' ')
              .map(word => word.charAt(0).toUpperCase())
              .slice(0, 2)
              .join('');
            const avatarColor = getAvatarColor(contact.name);
            
            return (
              <motion.div
                key={contact.id}
                onClick={() => !isDeleting && !isEditing && onSelectContact(contact)}
                className={`group px-3 py-2.5 flex items-center cursor-pointer transition-all duration-150 border-b border-[#222d34] ${
                  isSelected 
                    ? 'bg-[#2a3942]' 
                    : 'hover:bg-[#1a2730]'
                }`}
                layout
              >
                {/* Avatar */}
                <div 
                  className="w-[49px] h-[49px] flex items-center justify-center rounded-full text-white font-semibold text-[15px] mr-3 flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: avatarColor }}
                >
                  {initials}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 flex-1 mr-2" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="flex-1 bg-[#2a3942] text-[#e9edef] text-sm px-2 py-1 rounded border border-[#00A884] focus:outline-none"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveEdit(e as unknown as React.MouseEvent);
                            if (e.key === 'Escape') handleCancelEdit(e as unknown as React.MouseEvent);
                          }}
                        />
                        <button onClick={handleSaveEdit} className="text-[#00A884] hover:text-[#06cf9c] p-0.5">
                          <Check size={16} />
                        </button>
                        <button onClick={handleCancelEdit} className="text-[#8696a0] hover:text-[#e9edef] p-0.5">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <h3 className="text-[15px] font-normal text-[#e9edef] truncate">
                        {contact.name}
                      </h3>
                    )}
                    {!isEditing && lastMessage.time && (
                      <span className="text-[11px] text-[#667781] ml-2 flex-shrink-0">
                        {lastMessage.time}
                      </span>
                    )}
                  </div>

                  {/* Delete confirmation */}
                  <AnimatePresence>
                    {isDeleting ? (
                      <motion.div 
                        className="flex items-center gap-2 mt-1"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <span className="text-xs text-red-400">Delete contact?</span>
                        <button 
                          onClick={(e) => handleConfirmDelete(e, contact.id)}
                          className="text-xs bg-red-600/80 hover:bg-red-600 text-white px-2.5 py-0.5 rounded-full transition-colors"
                        >
                          Yes
                        </button>
                        <button 
                          onClick={handleCancelDelete}
                          className="text-xs bg-[#2a3942] hover:bg-[#3b4f5a] text-[#8696a0] px-2.5 py-0.5 rounded-full transition-colors"
                        >
                          No
                        </button>
                      </motion.div>
                    ) : (
                      <div className="flex items-center mt-0.5 justify-between">
                        <p className="text-[13px] text-[#8696a0] truncate flex-1">
                          {lastMessage.text}
                        </p>
                        {/* Action buttons — visible on hover */}
                        <div className="flex items-center gap-0.5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => handleStartEdit(e, contact)}
                            className="p-1 text-[#667781] hover:text-[#00A884] rounded-full hover:bg-[#1f2c34] transition-colors"
                            title="Edit contact"
                          >
                            <Pencil size={13} />
                          </button>
                          <button 
                            onClick={(e) => handleDeleteClick(e, contact.id)}
                            className="p-1 text-[#667781] hover:text-red-400 rounded-full hover:bg-[#1f2c34] transition-colors"
                            title="Delete contact"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatList;