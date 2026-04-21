'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check, Send, Store, BarChart3, Zap, Truck, Clock,
  TrendingUp, MessageSquare, Shield, CheckCheck,
} from 'lucide-react';

interface ChatMessage {
  type: 'sent' | 'received';
  text: string;
  time: string;
  hasButton?: boolean;
  btn?: string;
}

const messages: ChatMessage[] = [
  { type: 'received', text: 'Hi Arjun! 👋 Your order #ORD-8821 has been confirmed.', time: '10:02 AM' },
  { type: 'received', text: 'Total: ₹2,499 | Estimated delivery: Thursday', time: '10:02 AM' },
  { type: 'sent', text: 'Great, thanks! Can I track it?', time: '10:05 AM' },
  { type: 'received', text: 'Absolutely! Here\'s your tracking link:', time: '10:06 AM', hasButton: true, btn: '📦 Track Order' },
  { type: 'received', text: '🚚 Update: Your order is out for delivery! Driver is 3 stops away.', time: '2:30 PM' },
  { type: 'sent', text: 'Perfect, I\'ll be home! 🏠', time: '2:31 PM' },
];

/* ─── Typing Dots ─── */
function TypingDots() {
  return (
    <div className="self-start">
      <div
        className="px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
          border: '1px solid rgba(229,231,235,0.8)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            className="w-[6px] h-[6px] bg-[#25D366] rounded-full"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Floating Stat Card ─── */
function FloatingCard({
  icon,
  iconBg,
  value,
  label,
  className,
  delay = 0,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: string;
  label: string;
  className: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
      transition={{
        opacity: { duration: 0.5, delay: delay + 0.5 },
        scale: { duration: 0.5, delay: delay + 0.5 },
        y: { duration: 4, repeat: Infinity, delay: delay, ease: 'easeInOut' },
      }}
      className={`absolute z-20 flex items-center gap-3 px-4 py-3 rounded-2xl ${className}`}
      style={{
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.5)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
      <div>
        <div className="font-bold text-gray-900 text-sm leading-none">{value}</div>
        <div className="text-[11px] text-gray-500 mt-0.5">{label}</div>
      </div>
    </motion.div>
  );
}

export default function ChatMockup() {
  const [visibleMsgs, setVisibleMsgs] = useState<ChatMessage[]>([]);
  const [showTyping, setShowTyping] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const idxRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function addNext() {
      if (idxRef.current >= messages.length) {
        timerRef.current = setTimeout(() => {
          setVisibleMsgs([]);
          idxRef.current = 0;
          timerRef.current = setTimeout(addNext, 800);
        }, 4000);
        return;
      }

      const msg = messages[idxRef.current];
      if (msg.type === 'received') {
        setShowTyping(true);
        timerRef.current = setTimeout(() => {
          setShowTyping(false);
          setVisibleMsgs(prev => [...prev, msg]);
          idxRef.current++;
          timerRef.current = setTimeout(addNext, 1400);
        }, 1100);
      } else {
        setVisibleMsgs(prev => [...prev, msg]);
        idxRef.current++;
        timerRef.current = setTimeout(addNext, 1400);
      }
    }

    timerRef.current = setTimeout(addNext, 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [visibleMsgs, showTyping]);

  return (
    <div className="relative w-[360px]">
      {/* ─── Floating Stat Cards ─── */}
      <FloatingCard
        icon={<BarChart3 size={18} className="text-[#25D366]" />}
        iconBg="bg-[#25D366]/10"
        value="98.7%"
        label="Delivery Rate"
        className="-left-16 top-[8%]"
        delay={0}
      />
      <FloatingCard
        icon={<Zap size={18} className="text-amber-500" />}
        iconBg="bg-amber-500/10"
        value="<1.2s"
        label="Avg. Response"
        className="-right-14 bottom-[28%]"
        delay={1.5}
      />
      <FloatingCard
        icon={<TrendingUp size={18} className="text-blue-500" />}
        iconBg="bg-blue-500/10"
        value="73%"
        label="Read Rate"
        className="-left-10 bottom-[12%]"
        delay={3}
      />

      {/* ─── Live Badge ─── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute -right-8 top-[6%] z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(37,211,102,0.2)',
          boxShadow: '0 4px 16px rgba(37,211,102,0.12)',
        }}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]" />
        </span>
        <span className="text-[11px] font-bold text-[#25D366]">LIVE</span>
      </motion.div>

      {/* ─── Main Chat Container — Glassmorphism ─── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.35)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
        }}
      >
        {/* ── Chat Header ── */}
        <div
          className="px-5 py-4 flex items-center gap-3 border-b"
          style={{
            background: 'linear-gradient(135deg, rgba(37,211,102,0.06) 0%, rgba(18,140,126,0.04) 100%)',
            borderColor: 'rgba(229,231,235,0.5)',
          }}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center shadow-md shadow-green-500/20">
              <Store size={18} className="text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#25D366] border-2 border-white">
              <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-40" />
            </span>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-gray-900">ShopNow Business</h4>
            <p className="text-[11px] text-[#25D366] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full" /> Online
            </p>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-lg bg-white/60 border border-gray-200/50 flex items-center justify-center text-gray-400 hover:text-[#25D366] transition-colors cursor-pointer">
              <Shield size={14} />
            </div>
            <div className="w-8 h-8 rounded-lg bg-white/60 border border-gray-200/50 flex items-center justify-center text-gray-400 hover:text-[#25D366] transition-colors cursor-pointer">
              <MessageSquare size={14} />
            </div>
          </div>
        </div>

        {/* ── Chat Body ── */}
        <div
          ref={bodyRef}
          className="min-h-[340px] max-h-[340px] overflow-y-auto px-4 py-4 flex flex-col gap-2"
          style={{
            background: `
              radial-gradient(ellipse at 20% 20%, rgba(37,211,102,0.03) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 80%, rgba(18,140,126,0.02) 0%, transparent 60%),
              radial-gradient(#e2e8f0 0.6px, transparent 0.6px)
            `,
            backgroundSize: '100%, 100%, 16px 16px',
            backgroundColor: '#F8FAFC',
          }}
        >
          {visibleMsgs.map((m, i) => (
            <motion.div
              key={`${m.time}-${i}`}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={`max-w-[82%] ${m.type === 'sent' ? 'self-end' : 'self-start'}`}
            >
              <div
                className="px-3.5 py-2.5 text-[13px] leading-relaxed"
                style={{
                  borderRadius: '16px',
                  borderTopRightRadius: m.type === 'sent' ? '4px' : '16px',
                  borderTopLeftRadius: m.type === 'received' ? '4px' : '16px',
                  background: m.type === 'sent'
                    ? 'linear-gradient(135deg, #25D366 0%, #1ebe5d 50%, #17a34a 100%)'
                    : 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
                  color: m.type === 'sent' ? '#ffffff' : '#111827',
                  border: m.type === 'sent' ? 'none' : '1px solid #e5e7eb',
                  boxShadow: m.type === 'sent'
                    ? '0 2px 8px rgba(37,211,102,0.22)'
                    : '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                {m.text}
                {m.hasButton && (
                  <div className="flex gap-1.5 mt-2">
                    <span
                      className="px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      style={{
                        background: 'rgba(255,255,255,0.15)',
                        border: '1px solid rgba(255,255,255,0.25)',
                        color: '#ffffff',
                      }}
                    >
                      <Truck size={11} /> {m.btn}
                    </span>
                  </div>
                )}
              </div>
              <div className={`text-[10px] mt-1 flex items-center gap-1 px-1 ${m.type === 'sent' ? 'justify-end text-gray-400' : 'text-gray-400'}`}>
                {m.time}
                {m.type === 'sent' && (
                  <span className="text-blue-400">
                    <CheckCheck size={12} />
                  </span>
                )}
              </div>
            </motion.div>
          ))}

          {showTyping && <TypingDots />}
        </div>

        {/* ── Input Bar ── */}
        <div
          className="px-4 py-3 flex items-center gap-2.5"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,250,252,0.9) 100%)',
            borderTop: '1px solid rgba(229,231,235,0.5)',
          }}
        >
          <div
            className="flex-1 px-4 py-2.5 rounded-2xl text-[13px] text-gray-400 font-medium"
            style={{
              background: 'linear-gradient(135deg, #F8FAFC 0%, #f1f5f9 100%)',
              border: '1px solid rgba(229,231,235,0.6)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
            }}
          >
            Type a message...
          </div>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #25D366 0%, #1ebe5d 100%)',
              boxShadow: '0 4px 12px rgba(37,211,102,0.3)',
            }}
          >
            <Send size={16} className="text-white ml-0.5" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
