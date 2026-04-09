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

  const getCategoryStyle = (category: string) => {
    switch (category?.toUpperCase()) {
      case 'UTILITY':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'MARKETING':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'AUTHENTICATION':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      default:
        return 'bg-[#2a3942] text-[#8696a0] border border-[#3b4f5a]';
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
      <div className="flex-1 overflow-y-auto bg-[#111B21]">
        {/* Header */}
        <div className="sticky top-0 bg-[#111B21]/95 backdrop-blur-sm p-3.5 border-b border-[#2a3942] flex items-center justify-between z-10">
          <h2 className="text-[15px] font-semibold text-[#e9edef] tracking-wide">Templates</h2>
          <motion.button
            onClick={fetchTemplates}
            className="text-[#8696a0] hover:text-[#e9edef] p-2 rounded-full hover:bg-[#2a3942] transition-colors"
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
              <div className="absolute inset-0 border-2 border-[#00A884] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-sm text-[#8696a0]">Loading templates...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6">
            <div className="rounded-full bg-red-500/10 p-4 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-sm text-red-400">{error}</p>
            <button onClick={fetchTemplates} className="mt-3 text-xs text-[#00A884] hover:text-[#06cf9c] underline">
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && templates.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6">
            <div className="rounded-full bg-[#1f2c34] p-5 mb-4">
              <FileText size={24} className="text-[#8696a0]" />
            </div>
            <p className="text-sm text-[#8696a0]">No approved templates found.</p>
            <p className="text-xs text-[#667781] mt-1">Create templates in Meta Business Manager.</p>
          </div>
        )}

        {/* Template Cards */}
        {!loading && !error && templates.length > 0 && (
          <div className="p-3 space-y-2.5">
            {templates.map((template) => (
              <motion.div
                key={template.id}
                className="bg-[#1f2c34] rounded-xl p-4 border border-[#2a3942] hover:border-[#3b4f5a] transition-all duration-200 group"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Template Name */}
                <h3 className="text-sm font-medium text-[#e9edef] mb-2 truncate">
                  {template.name}
                </h3>

                {/* Badges */}
                <div className="flex items-center gap-2 mb-2.5">
                  <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${getCategoryStyle(template.category)}`}>
                    {template.category}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#2a3942] text-[#8696a0] border border-[#3b4f5a]">
                    {template.language}
                  </span>
                </div>

                {/* Body Preview */}
                <p className="text-xs text-[#8696a0] mb-3 leading-relaxed">
                  {getBodyPreview(template)}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => setPreviewTemplate(template)}
                    className="flex-1 text-xs bg-[#2a3942] hover:bg-[#3b4f5a] text-[#e9edef] py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Eye size={13} />
                    Preview
                  </motion.button>
                  <motion.button
                    onClick={() => onUseTemplate(template)}
                    className="flex-1 text-xs bg-[#00A884] hover:bg-[#06cf9c] text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5"
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
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewTemplate(null)}
            />

            {/* Modal */}
            <motion.div
              className="relative bg-[#1f2c34] rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-[#2a3942]"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#2a3942]">
                <div>
                  <h3 className="text-base font-semibold text-[#e9edef]">{previewTemplate.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${getCategoryStyle(previewTemplate.category)}`}>
                      {previewTemplate.category}
                    </span>
                    <span className="text-[10px] text-[#667781]">{previewTemplate.language}</span>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="text-[#8696a0] hover:text-[#e9edef] p-1.5 rounded-full hover:bg-[#2a3942] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body — WhatsApp message bubble preview */}
              <div className="p-4 bg-[#0b141a] max-h-[400px] overflow-y-auto">
                <div className="bg-[#1f2c34] rounded-lg max-w-[85%] shadow-md overflow-hidden">
                  {/* Header */}
                  {getComponentText(previewTemplate, 'HEADER') && (
                    <div className="px-3 pt-3 pb-1">
                      <p className="text-sm font-semibold text-[#e9edef]">
                        {getComponentText(previewTemplate, 'HEADER')}
                      </p>
                    </div>
                  )}

                  {/* Body */}
                  {getComponentText(previewTemplate, 'BODY') && (
                    <div className="px-3 py-2">
                      <p className="text-[13px] text-[#d1d7db] leading-relaxed whitespace-pre-wrap">
                        {getComponentText(previewTemplate, 'BODY')}
                      </p>
                    </div>
                  )}

                  {/* Footer */}
                  {getComponentText(previewTemplate, 'FOOTER') && (
                    <div className="px-3 pb-2">
                      <p className="text-[11px] text-[#667781] italic">
                        {getComponentText(previewTemplate, 'FOOTER')}
                      </p>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="flex justify-end px-3 pb-2">
                    <span className="text-[10px] text-[#667781]">
                      {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                  </div>

                  {/* Buttons */}
                  {getButtons(previewTemplate).length > 0 && (
                    <div className="border-t border-[#2a3942]">
                      {getButtons(previewTemplate).map((btn, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-center gap-1.5 py-2.5 text-[#53bdeb] text-sm border-b border-[#2a3942] last:border-b-0 hover:bg-[#2a3942]/50 cursor-pointer transition-colors"
                        >
                          {btn.url && <ExternalLink size={13} />}
                          {btn.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-[#2a3942] flex gap-3">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="flex-1 text-sm bg-[#2a3942] hover:bg-[#3b4f5a] text-[#e9edef] py-2.5 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onUseTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  className="flex-1 text-sm bg-[#00A884] hover:bg-[#06cf9c] text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5"
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
