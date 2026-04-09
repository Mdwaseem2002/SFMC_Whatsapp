'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Template {
  id: string;
  name: string;
  language: string;
  category: string;
  status: string;
  components: Array<{
    type: string;
    text?: string;
  }>;
}

interface BulkResult {
  phone: string;
  wamid: string | null;
  success: boolean;
  error?: string;
}

interface BulkSendPanelProps {
  preSelectedTemplate?: Template | null;
}

const BulkSendPanel: React.FC<BulkSendPanelProps> = ({ preSelectedTemplate }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateName, setSelectedTemplateName] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState('');
  const [language, setLanguage] = useState('en_US');
  const [parameters, setParameters] = useState('');
  const [headerImageUrl, setHeaderImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [results, setResults] = useState<{
    total: number;
    success: number;
    failed: number;
    results: BulkResult[];
  } | null>(null);
  const [showFailed, setShowFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch templates for dropdown
  useEffect(() => {
    const fetchTemplates = async () => {
      setTemplatesLoading(true);
      try {
        const response = await fetch('/api/templates');
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.templates)) {
            setTemplates(data.templates);
          }
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
      } finally {
        setTemplatesLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  // Pre-select template when passed as prop
  useEffect(() => {
    if (preSelectedTemplate) {
      setSelectedTemplateName(preSelectedTemplate.name);
      if (preSelectedTemplate.language) {
        setLanguage(preSelectedTemplate.language);
      }
    }
  }, [preSelectedTemplate]);

  const phoneNumberList = phoneNumbers
    .split('\n')
    .map(p => p.trim())
    .filter(p => p.length > 0);

  const phoneCount = phoneNumberList.length;
  const isOverLimit = phoneCount > 50;

  const handleSend = async () => {
    if (!selectedTemplateName || phoneCount === 0) return;
    if (isOverLimit) return;

    setLoading(true);
    setResults(null);
    setError(null);

    const paramArray = parameters
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const contacts = phoneNumberList.map(phone => ({
      phone,
      templateName: selectedTemplateName,
      language,
      parameters: paramArray.length > 0 ? paramArray : undefined,
      headerImageUrl: headerImageUrl.trim() ? headerImageUrl.trim() : undefined,
    }));

    try {
      const response = await fetch('/api/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error('Bulk send error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send messages');
    } finally {
      setLoading(false);
    }
  };

  const failedResults = results?.results.filter(r => !r.success) || [];

  return (
    <div className="flex-1 overflow-y-auto bg-[#111B21]">
      {/* Header */}
      <div className="sticky top-0 bg-[#111B21] p-3 border-b border-gray-800">
        <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
          <span>📢</span> Bulk Send
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Template Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Select Template <span className="text-red-400">*</span>
          </label>
          <select
            value={selectedTemplateName}
            onChange={(e) => setSelectedTemplateName(e.target.value)}
            className="w-full p-2.5 bg-[#2a3942] border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-teal-500 appearance-none cursor-pointer"
            disabled={templatesLoading}
          >
            <option value="">
              {templatesLoading ? 'Loading templates...' : '-- Select a template --'}
            </option>
            {templates.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name} ({t.language})
              </option>
            ))}
          </select>
        </div>

        {/* Phone Numbers Textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Phone Numbers <span className="text-red-400">*</span>
            <span className="text-xs text-gray-500 ml-1">(one per line, max 50)</span>
          </label>
          <textarea
            value={phoneNumbers}
            onChange={(e) => setPhoneNumbers(e.target.value)}
            placeholder={"+971501234567\n+971509876543\n+919876543210"}
            className="w-full p-2.5 bg-[#2a3942] border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-teal-500 placeholder-gray-600 h-32 resize-none font-mono"
          />
          <div className="flex justify-between items-center mt-1">
            <span className={`text-xs ${isOverLimit ? 'text-red-400' : 'text-gray-500'}`}>
              {phoneCount} / 50 numbers entered
            </span>
            {isOverLimit && (
              <span className="text-xs text-red-400 font-medium">
                Maximum 50 numbers per batch
              </span>
            )}
          </div>
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Language
          </label>
          <input
            type="text"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-2.5 bg-[#2a3942] border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-teal-500"
            placeholder="en_US"
          />
        </div>

        {/* Header Image URL */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Header Image URL
            <span className="text-xs text-gray-500 ml-1">(if template has media header)</span>
          </label>
          <input
            type="text"
            value={headerImageUrl}
            onChange={(e) => setHeaderImageUrl(e.target.value)}
            className="w-full p-2.5 bg-[#2a3942] border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-teal-500"
            placeholder="https://example.com/logo.png"
          />
        </div>

        {/* Parameters */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Parameters
            <span className="text-xs text-gray-500 ml-1">(comma separated)</span>
          </label>
          <input
            type="text"
            value={parameters}
            onChange={(e) => setParameters(e.target.value)}
            className="w-full p-2.5 bg-[#2a3942] border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-teal-500"
            placeholder="John, Order123"
          />
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <span>ℹ️</span> These replace {'{{1}}'}, {'{{2}}'} in the template
          </p>
        </div>

        {/* Send Button */}
        <motion.button
          onClick={handleSend}
          disabled={loading || !selectedTemplateName || phoneCount === 0 || isOverLimit}
          className={`w-full py-3 rounded-lg font-medium text-sm text-white flex items-center justify-center gap-2 transition-colors ${
            loading || !selectedTemplateName || phoneCount === 0 || isOverLimit
              ? 'bg-gray-700 cursor-not-allowed opacity-60'
              : 'bg-[#075E54] hover:bg-emerald-700'
          }`}
          whileHover={!loading ? { scale: 1.02 } : {}}
          whileTap={!loading ? { scale: 0.98 } : {}}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Sending...
            </>
          ) : (
            <>
              <span>🚀</span> Send Bulk WhatsApp
            </>
          )}
        </motion.button>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Results */}
        {results && (
          <motion.div
            className="bg-[#1f2c34] rounded-lg p-4 border border-gray-800 space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-sm font-semibold text-gray-100">Results</h3>

            <div className="flex gap-4">
              <div className="flex items-center gap-1 text-sm">
                <span className="text-emerald-400">✅</span>
                <span className="text-gray-200">{results.success} sent successfully</span>
              </div>
              {results.failed > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-red-400">❌</span>
                  <span className="text-gray-200">{results.failed} failed</span>
                </div>
              )}
            </div>

            {/* Show/Hide Failed */}
            {failedResults.length > 0 && (
              <div>
                <button
                  onClick={() => setShowFailed(!showFailed)}
                  className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1"
                >
                  <span className={`transform transition-transform ${showFailed ? 'rotate-90' : ''}`}>▶</span>
                  {showFailed ? 'Hide' : 'Show'} failed numbers
                </button>

                {showFailed && (
                  <div className="mt-2 space-y-1">
                    {failedResults.map((r, i) => (
                      <div key={i} className="text-xs text-gray-400 flex items-center gap-2 pl-3">
                        <span className="text-red-400 font-mono">{r.phone}</span>
                        <span className="text-gray-600">—</span>
                        <span>{r.error || 'Unknown error'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BulkSendPanel;
