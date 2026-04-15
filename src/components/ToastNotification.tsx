// src/components/ToastNotification.tsx
// Animated toast notification for incoming WhatsApp messages.

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle } from 'lucide-react';

interface ToastNotificationProps {
  phoneNumber: string;
  contactName?: string;
  messagePreview: string;
  onDismiss: () => void;
  onClick: (phoneNumber: string) => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  phoneNumber,
  contactName,
  messagePreview,
  onDismiss,
  onClick,
}) => {
  const displayName = contactName || phoneNumber;
  const initials = displayName
    .split(' ')
    .map((w: string) => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  const getAvatarColor = (name: string) => {
    const colors = ['#8b5cf6', '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
    const hash = name.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const avatarColor = getAvatarColor(displayName);
  const preview = messagePreview.length > 60
    ? messagePreview.substring(0, 57) + '...'
    : messagePreview;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -60, x: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
        exit={{ opacity: 0, y: -40, x: 40, scale: 0.85 }}
        transition={{ 
          type: 'spring', 
          stiffness: 400, 
          damping: 30,
          mass: 0.8 
        }}
        className="toast-notification"
        onClick={() => onClick(phoneNumber)}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          width: '360px',
          maxWidth: 'calc(100vw - 40px)',
          cursor: 'pointer',
        }}
      >
        {/* Glass card */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(139, 92, 246, 0.15)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(139, 92, 246, 0.08), 0 8px 24px rgba(139, 92, 246, 0.08)',
            padding: '14px 16px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Left accent bar */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '4px',
              background: 'linear-gradient(180deg, #8b5cf6, #c084fc)',
              borderRadius: '16px 0 0 16px',
            }}
          />

          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div
              className="flex-shrink-0 flex items-center justify-center"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: avatarColor,
                boxShadow: `0 4px 12px ${avatarColor}40`,
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              {initials}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5">
                  <MessageCircle size={12} style={{ color: '#8b5cf6' }} />
                  <span
                    className="text-[13px] font-semibold truncate"
                    style={{ color: '#0f172a', maxWidth: '180px', display: 'block' }}
                  >
                    {displayName}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss();
                  }}
                  className="p-0.5 rounded-full transition-colors"
                  style={{ color: '#94a3b8' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#64748b';
                    e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#94a3b8';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Message preview */}
              <p
                className="text-[12.5px] leading-[17px]"
                style={{ color: '#64748b', margin: 0 }}
              >
                {preview}
              </p>

              {/* Tiny "now" label */}
              <span
                className="text-[10px] mt-1 inline-block"
                style={{ color: '#94a3b8' }}
              >
                just now
              </span>
            </div>
          </div>

          {/* Progress bar — auto-dismiss indicator */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 5, ease: 'linear' }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #8b5cf6, #c084fc)',
              transformOrigin: 'left',
              borderRadius: '0 0 16px 16px',
            }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ToastNotification;
