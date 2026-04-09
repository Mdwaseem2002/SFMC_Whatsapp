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

  return (
    <div className="flex-1 overflow-y-auto bg-[#111B21] p-4">
      <div className="max-w-lg mx-auto">
        <h2 className="text-lg font-semibold text-[#e9edef] text-center mb-6">
          WhatsApp Business API Setup
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Access Token */}
          <div>
            <label className="flex items-center gap-1.5 text-[#8696a0] text-xs font-semibold uppercase tracking-wider mb-2">
              <Key size={12} />
              Meta WhatsApp API Access Token
            </label>
            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="w-full p-3 bg-[#1f2c34] border border-[#2a3942] rounded-xl text-[#e9edef] text-sm focus:outline-none focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884]/30 transition-all placeholder:text-[#667781]"
              placeholder="Enter your access token"
            />
            <p className="text-[11px] text-[#667781] mt-1.5">Find this in your Meta Developer dashboard</p>
          </div>

          {/* Phone Number ID */}
          <div>
            <label className="flex items-center gap-1.5 text-[#8696a0] text-xs font-semibold uppercase tracking-wider mb-2">
              <Phone size={12} />
              WhatsApp Business Phone Number ID
            </label>
            <input
              type="text"
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              className="w-full p-3 bg-[#1f2c34] border border-[#2a3942] rounded-xl text-[#e9edef] text-sm focus:outline-none focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884]/30 transition-all placeholder:text-[#667781]"
              placeholder="Enter your phone number ID"
            />
            <p className="text-[11px] text-[#667781] mt-1.5">The ID of your registered WhatsApp Business phone number</p>
          </div>

          {/* Webhook Config */}
          <div className="bg-[#1f2c34] p-4 rounded-xl border border-[#2a3942]">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[#e9edef] mb-1">
              <Webhook size={14} />
              Webhook Configuration
            </h3>
            <p className="text-xs text-[#8696a0] mb-4">Configure a webhook in Meta Developer Dashboard to receive messages.</p>

            {/* Callback URL */}
            <div className="mb-4">
              <label className="block text-[#8696a0] text-xs font-medium mb-1.5">Callback URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={webhookUrl || 'Your-hosted-URL/api/webhook'}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="flex-1 p-2.5 bg-[#0b141a] border border-[#2a3942] rounded-lg text-[#e9edef] text-xs focus:outline-none focus:border-[#00A884] transition-all placeholder:text-[#667781]"
                />
                <button
                  type="button"
                  className="p-2.5 bg-[#2a3942] hover:bg-[#3b4f5a] text-[#8696a0] hover:text-[#e9edef] rounded-lg transition-colors"
                  onClick={() => handleCopy(webhookUrl || 'Your-hosted-URL/api/webhook', 'webhook')}
                >
                  {copiedField === 'webhook' ? <Check size={14} className="text-[#00A884]" /> : <Copy size={14} />}
                </button>
              </div>
              <p className="text-[10px] text-[#667781] mt-1">Replace with your actual hosted URL once deployed</p>
            </div>

            {/* Verification Token */}
            <div>
              <label className="block text-[#8696a0] text-xs font-medium mb-1.5">Verification Token</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={verificationToken}
                  readOnly
                  className="flex-1 p-2.5 bg-[#0b141a] border border-[#2a3942] rounded-lg text-[#8696a0] text-xs"
                />
                <button
                  type="button"
                  className="p-2.5 bg-[#2a3942] hover:bg-[#3b4f5a] text-[#8696a0] hover:text-[#e9edef] rounded-lg transition-colors"
                  onClick={() => handleCopy(verificationToken, 'token')}
                >
                  {copiedField === 'token' ? <Check size={14} className="text-[#00A884]" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center bg-red-500/10 py-2 px-3 rounded-lg">{error}</p>
          )}

          {/* Save Button */}
          <motion.button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-[#00A884] hover:bg-[#06cf9c] text-white font-semibold py-3 px-6 rounded-xl transition-colors text-sm"
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
