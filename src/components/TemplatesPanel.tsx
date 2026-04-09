'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TemplateComponent {
  type: string;
  text?: string;
  format?: string;
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

  const getCategoryColor = (category: string) => {
    switch (category?.toUpperCase()) {
      case 'UTILITY':
        return 'bg-emerald-600';
      case 'MARKETING':
        return 'bg-teal-600';
      case 'AUTHENTICATION':
        return 'bg-gray-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getBodyText = (template: Template): string => {
    const bodyComponent = template.components?.find(c => c.type === 'BODY');
    if (bodyComponent?.text) {
      return bodyComponent.text.length > 100
        ? bodyComponent.text.substring(0, 97) + '...'
        : bodyComponent.text;
    }
    return 'No body text';
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#111B21]">
      {/* Header */}
      <div className="sticky top-0 bg-[#111B21] p-3 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-100">Templates</h2>
        <motion.button
          onClick={fetchTemplates}
          className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700"
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.3 }}
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </motion.button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400 p-6">
          <div className="relative w-10 h-10 mb-4">
            <div className="absolute inset-0 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-sm">Loading templates...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400 p-6">
          <div className="rounded-full bg-red-900/30 p-4 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-sm text-red-300">{error}</p>
          <button
            onClick={fetchTemplates}
            className="mt-3 text-xs text-teal-400 hover:text-teal-300 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && templates.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400 p-6">
          <div className="rounded-full bg-gray-800 p-4 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm">No approved templates found.</p>
          <p className="text-xs text-gray-500 mt-1">Create templates in Meta Business Manager.</p>
        </div>
      )}

      {/* Template Cards */}
      {!loading && !error && templates.length > 0 && (
        <div className="p-3 space-y-3">
          {templates.map((template) => (
            <motion.div
              key={template.id}
              className="bg-[#1f2c34] rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Template Name */}
              <h3 className="text-sm font-semibold text-gray-100 mb-2 truncate">
                {template.name}
              </h3>

              {/* Badges */}
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full text-white ${getCategoryColor(template.category)}`}>
                  {template.category}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
                  {template.language}
                </span>
              </div>

              {/* Body Preview */}
              <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                {getBodyText(template)}
              </p>

              {/* Use Template Button */}
              <motion.button
                onClick={() => onUseTemplate(template)}
                className="w-full text-sm bg-[#075E54] hover:bg-emerald-700 text-white py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Use Template
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplatesPanel;
