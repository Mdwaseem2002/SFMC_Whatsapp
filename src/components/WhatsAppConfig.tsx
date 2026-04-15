import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Save, Key, Phone, Webhook } from 'lucide-react';

interface WhatsAppConfigProps {
  onSave: (accessToken: string, phoneNumberId: string) => void;
}

const WhatsAppConfig: React.FC<WhatsAppConfigProps> = ({ onSave }) => {
  const [accessToken, setAccessToken] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [verificationToken, setVerificationToken] = useState('Pentacloud@123');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
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

  const inputStyle = {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    color: '#0f172a',
  };

  return (
    <div className="flex-1 overflow-y-auto p-4" style={{ background: '#ffffff' }}>
      <div className="max-w-lg mx-auto">
        <h2 className="text-lg font-semibold text-center mb-6" style={{ color: '#0f172a' }}>
          WhatsApp Business API Setup
        </h2>

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
      </div>
    </div>
  );
};

export default WhatsAppConfig;
