'use client';

// src/components/app/FastReplyView.tsx
// Quick-reply templates CRUD — stored in localStorage via WorkspaceProvider
// Redesigned: WhatsApp-green theme, clean SaaS cards, hover animations

import React, { useState } from 'react';
import { useWorkspace } from '@/components/workspace/WorkspaceProvider';
import type { FastReplyTemplate } from '@/types/workspace';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Plus, Copy, Edit2, Trash2, X, MessageSquare, Check, Search } from 'lucide-react';

export default function FastReplyView() {
  const { activeFastReplies, addFastReply, updateFastReply, deleteFastReply, activeWorkspace } = useWorkspace();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FastReplyTemplate | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const openNew = () => {
    setEditing(null);
    setTitle('');
    setBody('');
    setShowForm(true);
  };

  const openEdit = (t: FastReplyTemplate) => {
    setEditing(t);
    setTitle(t.title);
    setBody(t.body);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!title.trim() || !body.trim()) return;
    if (editing) {
      updateFastReply(editing.id, { title: title.trim(), body: body.trim() });
    } else {
      addFastReply({ title: title.trim(), body: body.trim() });
    }
    setShowForm(false);
    setEditing(null);
    setTitle('');
    setBody('');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const filteredReplies = activeFastReplies.filter(t =>
    !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      
      {/* ─── Header ─── */}
      <div className="px-8 py-6 bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#25D366]/[0.08] flex items-center justify-center">
                <Zap size={18} className="text-[#25D366]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Fast Replies</h1>
                <p className="text-[13px] text-gray-500 mt-0.5">Quick message templates for instant responses</p>
              </div>
            </div>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold bg-[#25D366] hover:bg-[#1db954] shadow-sm shadow-green-600/15 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <Plus size={18} /> New Template
          </button>
        </div>

        {/* Search */}
        {activeFastReplies.length > 0 && (
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/10 transition-all"
            />
          </div>
        )}
      </div>

      {/* ─── Template List ─── */}
      <div className="p-8 max-w-5xl">
        {activeFastReplies.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border-2 border-dashed border-gray-200 max-w-3xl mx-auto"
          >
            <div className="w-20 h-20 rounded-2xl bg-[#25D366]/[0.06] flex items-center justify-center mb-6">
              <MessageSquare size={36} className="text-[#25D366] opacity-60" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No templates yet</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-[340px] text-center leading-relaxed">
              Create standardized messages to save time and ensure consistent communication across your team.
            </p>
            <button
              onClick={openNew}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-bold bg-[#25D366] hover:bg-[#1db954] shadow-sm shadow-green-600/15 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <Plus size={18} /> Create your first template
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredReplies.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-[#25D366]/20 transition-all group relative"
                >
                  {/* Header row */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#25D366]/[0.08] flex items-center justify-center shrink-0">
                        <Zap size={14} className="text-[#25D366]" />
                      </div>
                      <h4 className="text-[15px] font-bold text-gray-900 leading-tight">{t.title}</h4>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopy(t.id, t.body)}
                        title="Copy to clipboard"
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                          ${copied === t.id 
                            ? 'bg-[#25D366]/10 text-[#25D366]' 
                            : 'bg-gray-100 text-gray-500 hover:bg-[#25D366]/10 hover:text-[#25D366]'}
                        `}
                      >
                        {copied === t.id ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                      <button
                        onClick={() => openEdit(t)}
                        title="Edit"
                        className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete this template?')) deleteFastReply(t.id); }}
                        title="Delete"
                        className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Body preview */}
                  <div className="bg-[#F8FAFC] rounded-xl p-4 border border-gray-100">
                    <p className="text-[13px] text-gray-600 whitespace-pre-wrap leading-relaxed line-clamp-4">
                      {t.body}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      {activeWorkspace?.name || 'Global'}
                    </span>
                    <button
                      onClick={() => handleCopy(t.id, t.body)}
                      className="text-[12px] font-semibold text-[#25D366] hover:underline flex items-center gap-1"
                    >
                      <Copy size={12} /> {copied === t.id ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ─── Add/Edit Modal ─── */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowForm(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                  {editing ? 'Edit Template' : 'New Template'}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 flex items-center justify-center transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-5 space-y-5">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Template Title</label>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Welcome Message"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366] focus:bg-white transition-all"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Message Content</label>
                  <textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder="Type your standardized message..."
                    rows={5}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366] focus:bg-white transition-all resize-y"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!title.trim() || !body.trim()}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold bg-[#25D366] hover:bg-[#1db954] shadow-sm shadow-green-600/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {editing ? 'Save Changes' : 'Create Template'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
