import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Save, Key, Phone, Webhook, Zap, Pencil, Trash2, Plus, X } from 'lucide-react';

interface FastReply {
  id: string;
  shortcut: string;
  message: string;
}

interface WhatsAppConfigProps {
  onSave: (accessToken: string, phoneNumberId: string) => void;
}

const WhatsAppConfig: React.FC<WhatsAppConfigProps> = ({ onSave }) => {
  // Tabs State
  const [activeTab, setActiveTab] = useState<'meta' | 'fast-replies'>('meta');

  // Meta Settings State
  const [accessToken, setAccessToken] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [verificationToken, setVerificationToken] = useState('Pentacloud@123');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Fast Replies State
  const [fastReplies, setFastReplies] = useState<FastReply[]>([]);
  const [isEditingReply, setIsEditingReply] = useState(false);
  const [replyForm, setReplyForm] = useState<FastReply>({ id: '', shortcut: '', message: '' });

  useEffect(() => {
    // Load Fast Replies from LocalStorage
    const savedReplies = localStorage.getItem('fastReplies');
    if (savedReplies) {
      try {
        setFastReplies(JSON.parse(savedReplies));
      } catch (e) {
        console.error('Failed to parse fast replies', e);
      }
    }

    // Load Env Variables
    const loadEnvVariables = async () => {
      try {
        const response = await fetch('/api/get-env-variables');
        if (response.ok) {
          const data = await response.json();
          if (data.accessToken) setAccessToken(data.accessToken);
          if (data.phoneNumberId) setPhoneNumberId(data.phoneNumberId);
          if (data.verificationToken) setVerificationToken(data.verificationToken);
        }
      } catch (err) {
        console.error('Error loading environment variables', err);
      }
    };

    loadEnvVariables();
  }, []);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken.trim() || !phoneNumberId.trim()) {
      setError('Both WhatsApp API access token and phone number ID are required');
      return;
    }
    onSave(accessToken, phoneNumberId);
  };

  const handleSaveReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyForm.message) return;
    
    // Auto format the shortcut to prefix with '/'
    const shortcutInput = replyForm.shortcut.trim();
    const formattedShortcut = shortcutInput.startsWith('/') 
      ? shortcutInput 
      : (shortcutInput ? `/${shortcutInput}` : '/reply');

    let updatedReplies = [...fastReplies];
    
    if (replyForm.id) {
      updatedReplies = updatedReplies.map(r => r.id === replyForm.id ? { ...replyForm, shortcut: formattedShortcut } : r);
    } else {
      updatedReplies.push({
        id: Date.now().toString(),
        shortcut: formattedShortcut,
        message: replyForm.message
      });
    }

    setFastReplies(updatedReplies);
    localStorage.setItem('fastReplies', JSON.stringify(updatedReplies));
    setIsEditingReply(false);
    setReplyForm({ id: '', shortcut: '', message: '' });
  };

  const handleDeleteReply = (id: string) => {
    const updatedReplies = fastReplies.filter(r => r.id !== id);
    setFastReplies(updatedReplies);
    localStorage.setItem('fastReplies', JSON.stringify(updatedReplies));
  };

  const openAddReply = () => {
    setReplyForm({ id: '', shortcut: '/', message: '' });
    setIsEditingReply(true);
  };

  const openEditReply = (reply: FastReply) => {
    setReplyForm(reply);
    setIsEditingReply(true);
  };

  const inputStyle = {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    color: '#0f172a',
  };

  return (
    <div className="flex-1 overflow-y-auto p-4" style={{ background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col">
        <h2 className="text-lg font-semibold text-center mb-4" style={{ color: '#0f172a' }}>
          Settings
        </h2>

        {/* Custom Tab Navigation */}
        <div className="flex rounded-xl p-1 mb-6" style={{ background: '#f1f5f9' }}>
          <button
            onClick={() => setActiveTab('meta')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'meta' ? 'bg-white shadow-sm' : ''}`}
            style={{ color: activeTab === 'meta' ? '#8b5cf6' : '#64748b' }}
          >
            Meta Details
          </button>
          <button
            onClick={() => setActiveTab('fast-replies')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'fast-replies' ? 'bg-white shadow-sm' : ''}`}
            style={{ color: activeTab === 'fast-replies' ? '#8b5cf6' : '#64748b' }}
          >
            <Zap size={14} />
            Fast Replies
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'meta' && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Access Token */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#64748b' }}>
                <Key size={12} />
                Meta WhatsApp API Access Token
              </label>
              <input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                className="w-full p-3 rounded-xl text-sm focus:outline-none transition-all"
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                placeholder="Enter your access token"
              />
              <p className="text-[11px] mt-1.5" style={{ color: '#94a3b8' }}>Find this in your Meta Developer dashboard</p>
            </div>

            {/* Phone Number ID */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#64748b' }}>
                <Phone size={12} />
                WhatsApp Business Phone Number ID
              </label>
              <input
                type="text"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                className="w-full p-3 rounded-xl text-sm focus:outline-none transition-all"
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                placeholder="Enter your phone number ID"
              />
              <p className="text-[11px] mt-1.5" style={{ color: '#94a3b8' }}>The ID of your registered WhatsApp Business phone number</p>
            </div>

            {/* Webhook Config */}
            <div className="p-4 rounded-xl" style={{ background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.12)' }}>
              <h3 className="flex items-center gap-1.5 text-sm font-semibold mb-1" style={{ color: '#0f172a' }}>
                <Webhook size={14} style={{ color: '#8b5cf6' }} />
                Webhook Configuration
              </h3>
              <p className="text-xs mb-4" style={{ color: '#64748b' }}>Configure a webhook in Meta Developer Dashboard to receive messages.</p>

              {/* Callback URL */}
              <div className="mb-4">
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#64748b' }}>Callback URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={webhookUrl || 'Your-hosted-URL/api/webhook'}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="flex-1 p-2.5 rounded-lg text-xs focus:outline-none transition-all"
                    style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#8b5cf6'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  />
                  <button
                    type="button"
                    className="p-2.5 rounded-lg transition-all"
                    style={{ background: '#f1f5f9', color: '#64748b' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; e.currentTarget.style.color = '#8b5cf6'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
                    onClick={() => handleCopy(webhookUrl || 'Your-hosted-URL/api/webhook', 'webhook')}
                  >
                    {copiedField === 'webhook' ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                  </button>
                </div>
                <p className="text-[10px] mt-1" style={{ color: '#94a3b8' }}>Replace with your actual hosted URL once deployed</p>
              </div>

              {/* Verification Token */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#64748b' }}>Verification Token</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={verificationToken}
                    readOnly
                    className="flex-1 p-2.5 rounded-lg text-xs"
                    style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#64748b' }}
                  />
                  <button
                    type="button"
                    className="p-2.5 rounded-lg transition-all"
                    style={{ background: '#f1f5f9', color: '#64748b' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; e.currentTarget.style.color = '#8b5cf6'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
                    onClick={() => handleCopy(verificationToken, 'token')}
                  >
                    {copiedField === 'token' ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-xs text-center py-2 px-3 rounded-xl" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)' }}>{error}</p>
            )}

            {/* Save Button */}
            <motion.button
              type="submit"
              className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3 px-6 rounded-xl transition-all text-sm"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', boxShadow: '0 4px 14px rgba(124,58,237,0.25)' }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Save size={16} />
              Save Configuration
            </motion.button>
          </form>
        )}

        {/* Fast Replies Tab Content */}
        {activeTab === 'fast-replies' && (
          <div className="flex flex-col flex-1">
            <AnimatePresence mode="wait">
              {isEditingReply ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleSaveReply} 
                  className="bg-white rounded-xl p-4 shadow-sm border space-y-4"
                  style={{ borderColor: '#e2e8f0' }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold text-slate-800">{replyForm.id ? 'Edit Fast Reply' : 'New Fast Reply'}</h3>
                    <button type="button" onClick={() => setIsEditingReply(false)} className="text-slate-400 hover:text-slate-600">
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Shortcut</label>
                    <input 
                      type="text" 
                      value={replyForm.shortcut}
                      onChange={(e) => setReplyForm({ ...replyForm, shortcut: e.target.value })}
                      autoFocus
                      placeholder="/thanks"
                      className="w-full p-2.5 rounded-lg text-sm border focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Message</label>
                    <textarea 
                      value={replyForm.message}
                      onChange={(e) => setReplyForm({ ...replyForm, message: e.target.value })}
                      required
                      rows={4}
                      placeholder="Thank you for reaching out! Is there anything else I can help you with?"
                      className="w-full p-2.5 rounded-lg text-sm border focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 resize-none"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => setIsEditingReply(false)}
                      className="flex-1 py-2 rounded-lg text-sm font-medium border bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 py-2 rounded-lg text-sm font-medium bg-violet-500 text-white hover:bg-violet-600 transition-colors shadow-sm"
                    >
                      Save
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <button
                    onClick={openAddReply}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all mb-4"
                    style={{ background: 'rgba(139,92,246,0.08)', color: '#8b5cf6', border: '1px dashed rgba(139,92,246,0.3)' }}
                  >
                    <Plus size={16} />
                    Add Fast Reply
                  </button>

                  <div className="space-y-2">
                    {fastReplies.length === 0 ? (
                      <p className="text-center text-sm text-slate-400 py-8">No fast replies created yet.</p>
                    ) : (
                      fastReplies.map(reply => (
                        <div key={reply.id} className="p-3 bg-white rounded-xl border border-slate-200 group hover:border-violet-200 transition-all">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 pr-4">
                              <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 mb-1">
                                {reply.shortcut}
                              </span>
                              <p className="text-sm text-slate-700 line-clamp-2">{reply.message}</p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => openEditReply(reply)}
                                className="p-1.5 text-slate-400 hover:text-violet-500 hover:bg-violet-50 rounded text-xs"
                                title="Edit"
                              >
                                <Pencil size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteReply(reply.id)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded text-xs"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
};

export default WhatsAppConfig;
