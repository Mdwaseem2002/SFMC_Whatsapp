'use client';

// src/components/app/FastReplyView.tsx
// Quick-reply templates CRUD — stored in localStorage via WorkspaceProvider

import React, { useState } from 'react';
import { useWorkspace } from '@/components/workspace/WorkspaceProvider';
import type { FastReplyTemplate } from '@/types/workspace';
import { Zap, Plus, Copy, Edit2, Trash2 } from 'lucide-react';

export default function FastReplyView() {
  const { activeFastReplies, addFastReply, updateFastReply, deleteFastReply, activeWorkspace } = useWorkspace();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FastReplyTemplate | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const color = activeWorkspace?.color || '#2563eb';

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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 font-sans">
      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-slate-200 sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Fast Replies
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Build a library of quick-reply templates
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium shadow-sm transition-all hover:-translate-y-0.5"
          style={{ backgroundColor: color }}
        >
          <Plus size={18} /> New Template
        </button>
      </div>

      {/* Template List */}
      <div className="p-8 max-w-5xl">
        {activeFastReplies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300 max-w-3xl mx-auto">
            <Zap size={64} className="mb-6 opacity-30 text-slate-400" />
            <h3 className="text-lg font-bold text-slate-700 mb-2">No data yet</h3>
            <p className="text-sm font-medium text-slate-500 mb-6 max-w-[300px] text-center">
              You haven't created any fast reply templates yet. Create standardized messages to save time and ensure consistent communication.
            </p>
            <button
              onClick={openNew}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold shadow-sm transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: color }}
            >
              <Plus size={18} /> Create First Template
            </button>
          </div>

        ) : (
          <div className="flex flex-col gap-4">
            {activeFastReplies.map(t => (
              <div 
                key={t.id} 
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-shadow hover:shadow-md group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-[15px] font-bold text-slate-900">
                    {t.title}
                  </h4>
                  <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(t.body)}
                      title="Copy to clipboard"
                      className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => openEdit(t)}
                      title="Edit Template"
                      className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => { if (confirm('Delete this template?')) deleteFastReply(t.id); }}
                      title="Delete Template"
                      className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/50">
                  <p className="text-[13px] font-medium text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {t.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4" 
          onClick={() => setShowForm(false)}
        >
          <div 
            onClick={e => e.stopPropagation()} 
            className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">
              {editing ? 'Edit Template' : 'New Template'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Template Title</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Welcome Message"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:bg-white transition-all"
                  style={{ ':focus': { ringColor: color, borderColor: color } } as any}
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Message Content</label>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Type your standardized message..."
                  rows={5}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:bg-white transition-all resize-y"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: color }}
                >
                  {editing ? 'Save Changes' : 'Create Template'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
