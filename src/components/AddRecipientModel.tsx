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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-[#1f2c34] rounded-2xl shadow-2xl p-6 w-full max-w-md relative border border-[#2a3942]"
      >
        <button 
          className="absolute top-4 right-4 text-[#8696a0] hover:text-[#e9edef] p-1 rounded-full hover:bg-[#2a3942] transition-colors"
          onClick={onClose}
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-[#00A884]/20 rounded-full">
            <UserPlus size={20} className="text-[#00A884]" />
          </div>
          <h2 className="text-lg font-semibold text-[#e9edef]">Add New Recipient</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#8696a0] text-xs font-semibold mb-1.5 uppercase tracking-wider">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-[#0b141a] border border-[#2a3942] rounded-xl text-[#e9edef] text-sm focus:outline-none focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884]/30 transition-all placeholder:text-[#667781]"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-[#8696a0] text-xs font-semibold mb-1.5 uppercase tracking-wider">Phone Number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full p-3 bg-[#0b141a] border border-[#2a3942] rounded-xl text-[#e9edef] text-sm focus:outline-none focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884]/30 transition-all placeholder:text-[#667781]"
              placeholder="919876543210"
            />
            <p className="text-[10px] text-[#667781] mt-1.5">Include country code without + (e.g., 91 for India, 1 for US)</p>
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center bg-red-500/10 py-2 px-3 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-[#2a3942] hover:bg-[#3b4f5a] text-[#e9edef] font-medium text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] py-2.5 rounded-xl bg-[#00A884] hover:bg-[#06cf9c] text-white font-medium text-sm transition-colors flex items-center justify-center gap-1.5"
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
