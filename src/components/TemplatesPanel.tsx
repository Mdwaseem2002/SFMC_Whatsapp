'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Send, RefreshCw, FileText, ExternalLink } from 'lucide-react';

interface TemplateComponent {
  type: string;
  text?: string;
  format?: string;
  buttons?: Array<{ type: string; text: string; url?: string }>;
}

interface Template {
  id: string;
  name: string;
  language: string;
  category: string;
  status: string;
  components: TemplateComponent[];
}

interface TemplatesPanelProps {
  onUseTemplate: (template: Template) => void;
}

const TemplatesPanel: React.FC<TemplatesPanelProps> = ({ onUseTemplate }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/templates');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.templates)) {
        setTemplates(data.templates);
      } else {
        setTemplates([]);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Could not load templates. Check WABA_ID configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const getCategoryStyle = (category: string): React.CSSProperties => {
    switch (category?.toUpperCase()) {
      case 'UTILITY':
        return { background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' };
      case 'MARKETING':
        return { background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' };
      case 'AUTHENTICATION':
        return { background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' };
      default:
        return { background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' };
    }
  };

  const getComponentText = (template: Template, type: string): string | undefined => {
    return template.components?.find(c => c.type === type)?.text;
  };

  const getButtons = (template: Template): Array<{ type: string; text: string; url?: string }> => {
    const buttonsComponent = template.components?.find(c => c.type === 'BUTTONS');
    return (buttonsComponent as unknown as { buttons?: Array<{ type: string; text: string; url?: string }> })?.buttons || [];
  };

  const getBodyPreview = (template: Template): string => {
    const body = getComponentText(template, 'BODY');
    if (body) {
      return body.length > 90 ? body.substring(0, 87) + '...' : body;
    }
    return 'No body text';
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto" style={{ background: '#ffffff' }}>
        {/* Header */}
        <div className="sticky top-0 p-3.5 border-b flex items-center justify-between z-10" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderColor: '#e2e8f0' }}>
          <h2 className="text-[15px] font-semibold tracking-wide" style={{ color: '#0f172a' }}>Templates</h2>
          <motion.button
            onClick={fetchTemplates}
            className="p-2 rounded-xl transition-all"
            style={{ color: '#94a3b8' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; e.currentTarget.style.color = '#8b5cf6'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
            whileHover={{ rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.3 }}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </motion.button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6">
            <div className="relative w-10 h-10 mb-4">
              <div className="absolute inset-0 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#8b5cf6', borderTopColor: 'transparent' }}></div>
            </div>
            <p className="text-sm" style={{ color: '#64748b' }}>Loading templates...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6">
            <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(239,68,68,0.08)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="#ef4444">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
            <button onClick={fetchTemplates} className="mt-3 text-xs underline" style={{ color: '#8b5cf6' }}>
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && templates.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6">
            <div className="rounded-2xl p-5 mb-4" style={{ background: 'rgba(139,92,246,0.08)' }}>
              <FileText size={24} style={{ color: '#8b5cf6' }} />
            </div>
            <p className="text-sm" style={{ color: '#64748b' }}>No approved templates found.</p>
            <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Create templates in Meta Business Manager.</p>
          </div>
        )}

        {/* Template Cards */}
        {!loading && !error && templates.length > 0 && (
          <div className="p-3 space-y-2.5">
            {templates.map((template) => (
              <motion.div
                key={template.id}
                className="rounded-xl p-4 transition-all duration-200 group"
                style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(139,92,246,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.03)'; }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-sm font-medium mb-2 truncate" style={{ color: '#0f172a' }}>
                  {template.name}
                </h3>

                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full" style={getCategoryStyle(template.category)}>
                    {template.category}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: '#f1f5f9', color: '#64748b' }}>
                    {template.language}
                  </span>
                </div>

                <p className="text-xs mb-3 leading-relaxed" style={{ color: '#94a3b8' }}>
                  {getBodyPreview(template)}
                </p>

                <div className="flex gap-2">
                  <motion.button
                    onClick={() => setPreviewTemplate(template)}
                    className="flex-1 text-xs py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5"
                    style={{ background: '#f1f5f9', color: '#64748b' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; e.currentTarget.style.color = '#8b5cf6'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Eye size={13} />
                    Preview
                  </motion.button>
                  <motion.button
                    onClick={() => onUseTemplate(template)}
                    className="flex-1 text-xs text-white py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', boxShadow: '0 2px 8px rgba(124,58,237,0.2)' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Send size={13} />
                    Use Template
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Template Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              className="absolute inset-0"
              style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(8px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewTemplate(null)}
            />

            <motion.div
              className="relative rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)', border: '1px solid #e2e8f0', boxShadow: '0 20px 60px rgba(139,92,246,0.12)' }}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#e2e8f0' }}>
                <div>
                  <h3 className="text-base font-semibold" style={{ color: '#0f172a' }}>{previewTemplate.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full" style={getCategoryStyle(previewTemplate.category)}>
                      {previewTemplate.category}
                    </span>
                    <span className="text-[10px]" style={{ color: '#94a3b8' }}>{previewTemplate.language}</span>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="p-1.5 rounded-xl transition-all"
                  style={{ color: '#94a3b8' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; e.currentTarget.style.color = '#8b5cf6'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 max-h-[400px] overflow-y-auto" style={{ background: '#f1f5f9' }}>
                <div className="rounded-2xl max-w-[85%] shadow-md overflow-hidden" style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
                  {getComponentText(previewTemplate, 'HEADER') && (
                    <div className="px-3 pt-3 pb-1">
                      <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>
                        {getComponentText(previewTemplate, 'HEADER')}
                      </p>
                    </div>
                  )}

                  {getComponentText(previewTemplate, 'BODY') && (
                    <div className="px-3 py-2">
                      <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: '#334155' }}>
                        {getComponentText(previewTemplate, 'BODY')}
                      </p>
                    </div>
                  )}

                  {getComponentText(previewTemplate, 'FOOTER') && (
                    <div className="px-3 pb-2">
                      <p className="text-[11px] italic" style={{ color: '#94a3b8' }}>
                        {getComponentText(previewTemplate, 'FOOTER')}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end px-3 pb-2">
                    <span className="text-[10px]" style={{ color: '#94a3b8' }}>
                      {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                  </div>

                  {getButtons(previewTemplate).length > 0 && (
                    <div style={{ borderTop: '1px solid #e2e8f0' }}>
                      {getButtons(previewTemplate).map((btn, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-center gap-1.5 py-2.5 text-sm cursor-pointer transition-colors"
                          style={{ color: '#8b5cf6', borderBottom: idx < getButtons(previewTemplate).length - 1 ? '1px solid #e2e8f0' : 'none' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.04)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          {btn.url && <ExternalLink size={13} />}
                          {btn.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t flex gap-3" style={{ borderColor: '#e2e8f0' }}>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="flex-1 text-sm py-2.5 rounded-xl font-medium transition-all"
                  style={{ background: '#f1f5f9', color: '#64748b' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onUseTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  className="flex-1 text-sm text-white py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-1.5"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', boxShadow: '0 4px 14px rgba(124,58,237,0.25)' }}
                >
                  <Send size={14} />
                  Send Template
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TemplatesPanel;
