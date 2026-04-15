import React, { useState } from 'react';
import { Contact } from '@/types';
import { motion } from 'framer-motion';
import { X, UserPlus } from 'lucide-react';

interface AddRecipientModalProps {
  onAdd: (contact: Contact) => void;
  onClose: () => void;
}

const AddRecipientModal: React.FC<AddRecipientModalProps> = ({ onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phoneNumber.trim()) {
      setError('Both name and phone number are required');
      return;
    }
    if (!/^[+]?\d{10,15}$/.test(phoneNumber)) {
      setError('Please enter a valid phone number');
      return;
    }

    const lastLetter = name.trim().slice(-1).toUpperCase();

    onAdd({
      id: Date.now().toString(),
      name,
      phoneNumber,
      avatar: lastLetter,
      lastSeen: new Date().toISOString(),
      online: undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(8px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="rounded-2xl shadow-2xl p-6 w-full max-w-md relative"
        style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)', border: '1px solid #e2e8f0', boxShadow: '0 20px 60px rgba(139,92,246,0.12)' }}
      >
        <button 
          className="absolute top-4 right-4 p-1.5 rounded-xl transition-all"
          style={{ color: '#94a3b8' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; e.currentTarget.style.color = '#8b5cf6'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
          onClick={onClose}
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl" style={{ background: 'rgba(139,92,246,0.1)' }}>
            <UserPlus size={20} style={{ color: '#8b5cf6' }} />
          </div>
          <h2 className="text-lg font-semibold" style={{ color: '#0f172a' }}>Add New Recipient</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl text-sm focus:outline-none transition-all"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a' }}
              onFocus={e => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Phone Number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full p-3 rounded-xl text-sm focus:outline-none transition-all"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a' }}
              onFocus={e => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
              placeholder="919876543210"
            />
            <p className="text-[10px] mt-1.5" style={{ color: '#94a3b8' }}>Include country code without + (e.g., 91 for India, 1 for US)</p>
          </div>

          {error && (
            <p className="text-xs text-center py-2 px-3 rounded-xl" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-medium text-sm transition-all"
              style={{ background: '#f1f5f9', color: '#64748b' }}
              onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
              onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] py-2.5 rounded-xl text-white font-medium text-sm transition-all flex items-center justify-center gap-1.5"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', boxShadow: '0 4px 14px rgba(124,58,237,0.25)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(124,58,237,0.25)'; }}
            >
              <UserPlus size={15} />
              Add Recipient
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddRecipientModal;
