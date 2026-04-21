'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, Send, CheckCheck, BarChart3, Zap, Shield,
  Users, TrendingUp, Store,
} from 'lucide-react';

/* ─── Floating Glass Stat Card ─── */
function StatBadge({
  icon, value, label, className, delay,
}: {
  icon: React.ReactNode; value: string; label: string; className?: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay ?? 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute z-20 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl px-4 py-3 shadow-lg shadow-black/[0.06] flex items-center gap-3 ${className ?? ''}`}
    >
      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
        {icon}
      </div>
      <div>
        <div className="font-bold text-white text-sm leading-tight">{value}</div>
        <div className="text-[11px] text-white/70">{label}</div>
      </div>
    </motion.div>
  );
}

/* ─── Mini Chat Bubble ─── */
function ChatBubble({
  text, type, delay,
}: {
  text: string; type: 'sent' | 'received'; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`max-w-[82%] ${type === 'sent' ? 'self-end' : 'self-start'}`}
    >
      <div className={`px-3.5 py-2 rounded-2xl text-[12.5px] leading-relaxed shadow-sm ${
        type === 'sent'
          ? 'bg-[#DCF8C6] text-gray-900 rounded-br-sm'
          : 'bg-white text-gray-900 rounded-bl-sm'
      }`}>
        {text}
      </div>
      <div className={`text-[9px] text-gray-500/80 mt-0.5 flex items-center gap-0.5 ${type === 'sent' ? 'justify-end' : ''}`}>
        10:0{Math.floor(Math.random() * 9) + 1}
        {type === 'sent' && <CheckCheck size={10} className="text-blue-500" />}
      </div>
    </motion.div>
  );
}

export default function AuthVisualPanel() {
  return (
    <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-[#25D366] via-[#1db954] to-[#128C7E]">
      {/* Abstract background shapes */}
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-white/[0.06] rounded-full blur-[60px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] bg-black/[0.05] rounded-full blur-[60px]" />
        <div className="absolute top-[40%] left-[20%] w-[200px] h-[200px] bg-white/[0.04] rounded-full blur-[40px]" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 py-16">
        {/* Floating Stats */}
        <StatBadge
          icon={<BarChart3 size={18} />}
          value="98.7%"
          label="Delivery Rate"
          className="top-[12%] left-8"
          delay={1.0}
        />
        <StatBadge
          icon={<Zap size={18} />}
          value="<1.2s"
          label="Avg. Send Time"
          className="top-[8%] right-10"
          delay={1.2}
        />
        <StatBadge
          icon={<Users size={18} />}
          value="50K+"
          label="Businesses"
          className="bottom-[18%] left-10"
          delay={1.4}
        />
        <StatBadge
          icon={<TrendingUp size={18} />}
          value="99.9%"
          label="Uptime"
          className="bottom-[12%] right-12"
          delay={1.6}
        />

        {/* Phone mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="w-[260px] rounded-[32px] border border-white/20 overflow-hidden shadow-2xl shadow-black/20 bg-white"
        >
          {/* Phone header */}
          <div className="bg-[#075E54] px-4 py-2.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#25d366] to-[#128c7e] flex items-center justify-center">
              <Store size={14} className="text-white" />
            </div>
            <div>
              <h4 className="text-[13px] font-semibold text-white">ShopNow Business</h4>
              <p className="text-[10px] text-white/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" /> Online
              </p>
            </div>
          </div>

          {/* Chat body */}
          <div className="min-h-[300px] px-2.5 py-3 flex flex-col gap-2" style={{ background: '#ECE5DD' }}>
            <ChatBubble type="received" text="Hi! Your order #ORD-8821 has been confirmed." delay={0.6} />
            <ChatBubble type="received" text="Total: ₹2,499 | Delivery: Thursday" delay={1.0} />
            <ChatBubble type="sent" text="Thanks! Can I track it?" delay={1.4} />
            <ChatBubble type="received" text="Absolutely! Here's your tracking link:" delay={1.8} />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 2.2 }}
              className="self-start"
            >
              <div className="bg-white rounded-2xl rounded-bl-sm px-3.5 py-2 shadow-sm">
                <span className="bg-[#25d366]/10 border border-[#25d366]/30 text-[#128c7e] px-3 py-1 rounded-full text-[11px] font-medium inline-flex items-center gap-1">
                  <Send size={10} /> Track Order
                </span>
              </div>
            </motion.div>
            <ChatBubble type="received" text="Your order is out for delivery! 🚚" delay={2.6} />
          </div>

          {/* Input bar */}
          <div className="bg-[#f0f0f0] px-3 py-2 flex items-center gap-2 border-t border-gray-200">
            <span className="flex-1 text-[12px] text-gray-400">Type a message…</span>
            <div className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center">
              <Send size={12} className="text-white" />
            </div>
          </div>
        </motion.div>

        {/* Bottom tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-10 text-center"
        >
          <div className="flex items-center gap-2 justify-center mb-3">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <MessageSquare size={16} className="text-white" />
            </div>
            <span className="font-[Syne] font-bold text-lg text-white">WhatZupp</span>
          </div>
          <p className="text-white/70 text-sm max-w-[280px] leading-relaxed">
            Enterprise WhatsApp engagement powered by Salesforce Marketing Cloud
          </p>
          <div className="mt-4 flex items-center justify-center gap-5">
            {[
              { icon: <Shield size={14} />, text: 'SOC 2 Ready' },
              { icon: <CheckCheck size={14} />, text: 'GDPR Compliant' },
            ].map((item, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[11px] text-white/60 font-medium">
                {item.icon} {item.text}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
