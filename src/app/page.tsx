'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  MessageSquare, Users, BarChart3, Zap, Shield, Globe, ArrowRight, Play,
  Link2, ClipboardList, Rocket, Cloud, Smartphone, User, ChevronRight,
  ShoppingCart, Truck, Building2, Heart, Lock, Eye, MousePointerClick,
  TrendingUp, CheckCircle2, Workflow, FileText, Bot, CreditCard, Radio,
  Store, Package, Landmark, Activity, Send, Twitter, Linkedin, Youtube, Mail,
} from 'lucide-react';
import ChatMockup from '@/components/landing/ChatMockup';

/* ─── ANIMATED COUNTER ─── */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─── SCROLL REVEAL WRAPPER ─── */
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── TAG PILL ─── */
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 bg-[#E6F9F0] border border-[#25D366]/20 text-[#1EBE5D] font-sans text-[11px] font-semibold tracking-[0.15em] uppercase px-4 py-1.5 rounded-full shadow-sm">
      <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full animate-pulse shadow-[0_0_8px_rgba(37,211,102,0.6)]" />
      {children}
    </span>
  );
}

/* ─── GLASS CARD ─── */
function GlassCard({ children, className = '', hover = true }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <motion.div
      whileHover={hover ? { y: -6, scale: 1.01 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.03)] rounded-3xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ════════════════════════════════════════════
   NAVBAR
   ════════════════════════════════════════════ */
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-3xl bg-white/70 border-b border-[#0F172A]/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
      <div className="max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-10 h-10 rounded-[14px] bg-[#25D366] flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.3)]">
            <MessageSquare size={20} className="text-white" />
          </div>
          <span className="font-sans font-extrabold text-2xl text-[#0F172A] tracking-tight">WhatZupp</span>
        </Link>
        <div className="hidden md:flex items-center gap-10">
          {['Features', 'How It Works', 'Use Cases', 'Analytics'].map((item, i) => (
            <a key={i} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="text-[14px] text-[#64748B] hover:text-[#0F172A] transition-colors no-underline font-medium">
              {item}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="px-5 py-2.5 rounded-full text-[14px] font-semibold text-[#0F172A] bg-transparent hover:bg-black/5 transition-all no-underline">
            Login
          </Link>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/signup" className="px-6 py-3 rounded-full text-[14px] font-bold text-white bg-[#25D366] hover:bg-[#1EBE5D] shadow-[0_4px_20px_rgba(37,211,102,0.3)] transition-all no-underline block">
              Get Started Free
            </Link>
          </motion.div>
        </div>
      </div>
    </nav>
  );
}

/* ════════════════════════════════════════════
   HERO
   ════════════════════════════════════════════ */
function Hero() {
  const headlineWords = ['Turn', 'WhatsApp', 'Into', 'Your', 'Most'];
  const gradientWords = ['Powerful', 'Engagement'];

  return (
    <section className="min-h-screen flex items-center pt-40 pb-20 px-6 relative overflow-hidden bg-[#FFFFFF]">
      {/* ─── Background: Gradient Mesh + Glowing Blobs ─── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 20% 0%, rgba(37,211,102,0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(230,249,240,0.8) 0%, transparent 45%),
            radial-gradient(ellipse at 60% 80%, rgba(37,211,102,0.03) 0%, transparent 50%),
            radial-gradient(ellipse at 10% 60%, rgba(15,23,42,0.02) 0%, transparent 40%),
            linear-gradient(180deg, #FFFFFF 0%, #F7F9FC 40%, #FFFFFF 100%)
          `,
        }}
      />
      {/* Animated glowing blobs */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(37,211,102,0.05) 0%, transparent 65%)', filter: 'blur(80px)' }}
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 30, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(230,249,240,0.9) 0%, transparent 65%)', filter: 'blur(70px)' }}
      />
      <motion.div
        animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute bottom-[-10%] left-[40%] w-[450px] h-[450px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(37,211,102,0.04) 0%, transparent 60%)', filter: 'blur(60px)' }}
      />
      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#0F172A]/[0.05] to-transparent" />

      <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 items-center relative">
        {/* ─── Left: Text Content ─── */}
        <div>
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Tag>WhatsApp × Salesforce Marketing Cloud</Tag>
          </motion.div>

          {/* Headline with staggered word animation */}
          <h1 className="font-sans text-[clamp(44px,6vw,72px)] font-extrabold leading-[1.05] tracking-tight text-gray-900 mt-8 mb-6">
            {headlineWords.map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block mr-[0.3em]"
              >
                {word}
              </motion.span>
            ))}
            <br />
            {gradientWords.map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block mr-[0.3em] bg-gradient-to-r from-[#25D366] via-[#1ebe5d] to-[#0e8c5f] bg-clip-text text-transparent"
              >
                {word}
              </motion.span>
            ))}
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block"
            >
              Channel
            </motion.span>
          </h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg text-gray-500 max-w-[480px] leading-[1.6] tracking-[0.3px] mb-10 font-medium"
          >
            Run campaigns, send transactional messages, and enable real-time conversations — directly from Salesforce Marketing Cloud.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex gap-4 flex-wrap"
          >
            {/* Primary — Gradient Green with Glow */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/signup"
                className="px-9 py-4 rounded-full text-base font-semibold text-white no-underline flex items-center gap-2.5 transition-all"
                style={{
                  background: 'linear-gradient(135deg, #25D366 0%, #1ebe5d 50%, #128C7E 100%)',
                  boxShadow: '0 4px 20px rgba(37,211,102,0.35), 0 1px 4px rgba(37,211,102,0.2)',
                }}
              >
                <Rocket size={18} /> Request Demo
              </Link>
            </motion.div>
            {/* Secondary — Glass Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <a
                href="#how-it-works"
                className="px-9 py-4 rounded-full text-base font-medium text-gray-700 no-underline flex items-center gap-2.5 transition-all hover:text-[#128C7E]"
                style={{
                  background: 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(229,231,235,0.8)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <ArrowRight size={16} /> See How It Works
              </a>
            </motion.div>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12"
          >
            {/* Company logo row */}
            <div className="flex items-center gap-6 mb-5">
              {['Salesforce', 'Meta', 'Shopify', 'HubSpot', 'Stripe'].map((name, i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0.4 }}
                  whileHover={{ opacity: 1, scale: 1.05 }}
                  className="text-[13px] font-bold tracking-normal cursor-default transition-all"
                  style={{ color: '#9ca3af',  }}
                >
                  {name}
                </motion.div>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2.5">
                {['#6366f1', '#f59e0b', '#ef4444', '#10b981', '#3b82f6'].map((c, i) => (
                  <span
                    key={i}
                    className="w-8 h-8 rounded-full border-[2.5px] border-white flex items-center justify-center text-white text-[10px] font-bold shadow-md"
                    style={{ background: c }}
                  >
                    {['A', 'B', 'C', 'D', 'E'][i]}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Trusted by <strong className="text-gray-900">200+ enterprise teams</strong>
              </p>
            </div>
          </motion.div>
        </div>

        {/* ─── Right: Premium Chat Mockup ─── */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateY: -5 }}
          animate={{ opacity: 1, y: 0, rotateY: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center items-center lg:order-last order-first"
          style={{ perspective: '1000px' }}
        >
          <ChatMockup />
        </motion.div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════
   ECOSYSTEM FLOW
   ════════════════════════════════════════════ */
const SalesforceSVG = () => (
  <svg role="img" viewBox="0 0 24 24" width="34" height="34" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11.838 4.354c-1.79 0-3.393.992-4.183 2.502-2.29-.12-4.385 1.636-4.471 3.921-.05 1.341.528 2.628 1.572 3.498-1.127.327-1.921 1.365-1.947 2.544.025 1.493 1.258 2.686 2.753 2.656H16.89c2.327.067 4.269-1.766 4.336-4.094.067-2.327-1.766-4.269-4.093-4.335h-.735c-.092-2.28-1.996-4.062-4.278-4.004-1.042.027-2.031.428-2.827 1.144-.75-1.149-2.039-1.84-3.411-1.854l-.037.022zm0 1.693c.961.012 1.845.548 2.33 1.411l.347.616.657-.28c.642-.271 1.37-.294 2.026-.063.844.296 1.436 1.025 1.536 1.91l.106.91h.971c1.385.035 2.483 1.183 2.449 2.567-.034 1.385-1.182 2.484-2.568 2.449h-11.4c-.58.012-1.06-.448-1.072-1.028-.013-.58.447-1.06 1.027-1.072l.93-.016-.016-.931c0-1.112.901-2.013 2.012-2.013a2.012 2.012 0 0 1 1.82 1.168l.453 1.01.815-.758a2.534 2.534 0 0 1 1.61-.596 2.534 2.534 0 0 1 2.227 1.298l.462.834.79-.508c1.074-.693 1.381-2.124.686-3.197a2.296 2.296 0 0 0-1.072-.88l-.759-.344.252-.792c.453-1.425-.332-2.95-1.758-3.404-.691-.22-1.455-.132-2.073.238l-.634.382-.416-.621c-.55-1.002-1.603-1.624-2.73-1.636z"/></svg>
);
const WhatsAppSVG = () => (
  <svg role="img" viewBox="0 0 24 24" width="34" height="34" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
);

function EcosystemFlow() {
  const sources = [
    { icon: <SalesforceSVG />, name: 'Salesforce', color: '#00A1E0' },
    { icon: <SalesforceSVG />, name: 'SFMC', color: '#FF6D2E' },
    { icon: <Globe size={30} />, name: 'Global CRM', color: '#8B5CF6' },
  ];
  const rightNodes = [
    { icon: <WhatsAppSVG />, name: 'WhatsApp' },
    { icon: <User size={34} />, name: 'Customer' },
  ];

  return (
    <section className="py-14 border-y border-[#0F172A]/[0.05] bg-[#F7F9FC] overflow-hidden">
      <div className="max-w-[1160px] mx-auto px-6">
        <p className="text-center text-xs text-gray-400 tracking-[0.08em] uppercase mb-10 font-medium">Enterprise Ecosystem Flow</p>

        {/* ── Desktop Layout ── */}
        <div className="hidden md:flex items-center justify-center gap-0">

          {/* Left: 3 Sources stacked */}
          <div className="flex flex-col items-end gap-4 mr-2">
            {sources.map((s, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <motion.div
                  whileHover={{ x: 4, scale: 1.04 }}
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-[#0F172A]/[0.06] shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:border-[#25D366]/30 hover:shadow-[0_4px_20px_rgba(37,211,102,0.08)] transition-all cursor-default"
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${s.color}12`, color: s.color }}>
                    {s.icon}
                  </div>
                  <span className="text-sm font-bold text-[#0F172A] whitespace-nowrap">{s.name}</span>
                </motion.div>
              </Reveal>
            ))}
          </div>

          {/* Animated arrows converging */}
          <div className="flex flex-col items-center justify-center gap-4 mx-1 w-20 relative">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
                className="flex items-center w-full"
              >
                <div className="flex-1 h-[2px] bg-gradient-to-r from-[#25d366]/20 to-[#25d366]/60" />
                <ChevronRight size={14} className="text-[#25D366] -ml-1 shrink-0" />
              </motion.div>
            ))}
          </div>

          {/* Center: WhatZupp hub */}
          <Reveal delay={0.35}>
            <motion.div
              whileHover={{ y: -4, scale: 1.05 }}
              className="flex flex-col items-center gap-3 mx-2"
            >
              <div className="w-24 h-24 rounded-2xl border bg-[#E6F9F0] border-[#25D366]/30 text-[#25D366] shadow-[0_8px_32px_rgba(37,211,102,0.18)] flex items-center justify-center relative">
                <MessageSquare size={36} />
                {/* Pulse ring */}
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-2xl border-2 border-[#25D366]/30"
                />
              </div>
              <span className="text-base text-[#0F172A] font-extrabold">WhatZupp</span>
            </motion.div>
          </Reveal>

          {/* Right arrow + nodes */}
          {rightNodes.map((n, i) => (
            <React.Fragment key={i}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
                className="flex items-center mx-1 w-12"
              >
                <div className="flex-1 h-[2px] bg-gradient-to-r from-[#25d366]/30 to-[#25d366]/60" />
                <ChevronRight size={14} className="text-[#25D366] -ml-1 shrink-0" />
              </motion.div>
              <Reveal delay={0.55 + i * 0.15}>
                <motion.div whileHover={{ y: -4, scale: 1.05 }} className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-2xl border bg-white/90 backdrop-blur border-[#0F172A]/[0.06] text-[#64748B] hover:border-[#25D366]/30 hover:text-[#25D366] shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex items-center justify-center transition-all">
                    {n.icon}
                  </div>
                  <span className="text-sm text-[#0F172A] font-bold">{n.name}</span>
                </motion.div>
              </Reveal>
            </React.Fragment>
          ))}
        </div>

        {/* ── Mobile Layout ── */}
        <div className="md:hidden flex flex-col items-center gap-4">
          {/* Sources row */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {sources.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-xl border bg-white border-[#0F172A]/[0.06] flex items-center justify-center shadow-sm"
                  style={{ color: s.color }}>
                  {s.icon}
                </div>
                <span className="text-xs font-bold text-[#0F172A]">{s.name}</span>
              </div>
            ))}
          </div>

          {/* Down arrows */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-[2px] h-6 bg-gradient-to-b from-[#25d366]/20 to-[#25d366]/60" />
            <ChevronRight size={14} className="text-[#25D366] rotate-90" />
          </div>

          {/* WhatZupp */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-2xl bg-[#E6F9F0] border border-[#25D366]/30 text-[#25D366] shadow-[0_6px_24px_rgba(37,211,102,0.15)] flex items-center justify-center">
              <MessageSquare size={32} />
            </div>
            <span className="text-sm text-[#0F172A] font-extrabold">WhatZupp</span>
          </div>

          {/* Down arrows */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-[2px] h-6 bg-gradient-to-b from-[#25d366]/20 to-[#25d366]/60" />
            <ChevronRight size={14} className="text-[#25D366] rotate-90" />
          </div>

          {/* Right nodes */}
          <div className="flex items-center justify-center gap-4">
            {rightNodes.map((n, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-xl border bg-white/90 border-[#0F172A]/[0.06] text-[#64748B] flex items-center justify-center shadow-sm">
                    {n.icon}
                  </div>
                  <span className="text-xs font-bold text-[#0F172A]">{n.name}</span>
                </div>
                {i < rightNodes.length - 1 && (
                  <div className="w-6 h-[2px] bg-gradient-to-r from-[#25d366]/30 to-[#25d366]/60 relative mt-[-20px]">
                    <ChevronRight size={12} className="text-[#25D366] absolute right-[-2px] top-1/2 -translate-y-1/2" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

/* ════════════════════════════════════════════
   STATS BAR
   ════════════════════════════════════════════ */
function StatsBar() {
  const stats = [
    { val: 50, suffix: 'K+', label: 'Businesses', icon: <Building2 size={20} /> },
    { val: 2, suffix: 'B+', label: 'Messages Sent', icon: <Send size={20} /> },
    { val: 99, suffix: '.9%', label: 'Uptime', icon: <Activity size={20} /> },
    { val: 4, suffix: '.8/5', label: 'Rating', icon: <TrendingUp size={20} /> },
  ];
  return (
    <section className="py-16 bg-[#FFFFFF] border-b border-[#0F172A]/[0.05]">
      <div className="max-w-[1160px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <div className="text-center group">
              <div className="w-12 h-12 rounded-2xl bg-[#E6F9F0] flex items-center justify-center mx-auto mb-3 text-[#25D366] group-hover:bg-[#25D366]/20 transition-colors shadow-sm">
                {s.icon}
              </div>
              <span className="font-sans text-4xl font-extrabold text-[#0F172A] tracking-tight">
                <AnimatedCounter target={s.val} suffix={s.suffix} />
              </span>
              <p className="text-sm text-[#64748B] font-semibold tracking-wide uppercase mt-2">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════
   FEATURES
   ════════════════════════════════════════════ */
function Features() {
  const features = [
    { icon: <Link2 size={24} />, color: 'text-[#25D366] bg-[#25D366]/[0.06]', num: '01', title: 'Direct SFMC Integration', desc: 'Seamless WhatsApp campaign execution directly from SFMC journeys. No middleware, no duplication.', pills: ['Journey Builder', 'Automation Studio', 'Email Studio'] },
    { icon: <Eye size={24} />, color: 'text-blue-500 bg-blue-50', num: '02', title: 'Unified Campaign Governance', desc: 'Centralized control for marketing + utility messaging. Full visibility, approval workflows, and audit trails.', pills: ['Approval Workflows', 'Audit Logs', 'Role Controls'] },
    { icon: <Lock size={24} />, color: 'text-indigo-500 bg-indigo-50', num: '03', title: 'No-PII Architecture', desc: 'WhatZupp acts as an orchestration layer — never storing customer PII. Enterprise compliance by design.', pills: ['GDPR Ready', 'Zero Data Copy', 'SOC 2'] },
    { icon: <Building2 size={24} />, color: 'text-pink-500 bg-pink-50', num: '04', title: 'Multi-Brand Scalability', desc: 'Single integration layer supporting multiple business units, brands, and regions at scale.', pills: ['Multi-Tenant', 'Region Isolation', 'Centralized Billing'] },
    { icon: <BarChart3 size={24} />, color: 'text-amber-500 bg-amber-50', num: '05', title: 'Real-Time Analytics', desc: 'Delivery, read, and engagement metrics inside SFMC or your BI tools. Close the loop in real time.', pills: ['Live Dashboards', 'Tableau Ready', 'SFMC Native'] },
    { icon: <MessageSquare size={24} />, color: 'text-emerald-500 bg-emerald-50', num: '06', title: 'Two-Way Messaging', desc: 'Enable real conversations within campaign journeys. Customers respond, ask questions, and get answers.', pills: ['Inbound Handling', 'Bot + Human', 'Session Tracking'] },
  ];

  return (
    <section id="features" className="py-24 px-6 bg-[#FFFFFF]">
      <div className="max-w-[1160px] mx-auto">
        <Reveal className="text-center mb-20">
          <Tag>Core Capabilities</Tag>
          <h2 className="font-sans text-[clamp(36px,4vw,56px)] font-extrabold leading-[1.1] tracking-tight text-[#0F172A] mt-6 mb-5">
            Built for Enterprise-Grade<br />Engagement
          </h2>
          <p className="text-lg text-[#64748B] max-w-[540px] mx-auto leading-relaxed font-medium">
            Every feature designed for scale, compliance, and conversion.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <GlassCard className="p-8 h-full">
                <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center mb-5`}>
                  {f.icon}
                </div>
                <span className="font-sans text-xs font-bold text-[#25D366] tracking-[0.1em] block mb-2">{f.num}</span>
                <h3 className="font-sans text-xl font-bold text-[#0F172A] tracking-tight mb-3">{f.title}</h3>
                <p className="text-[15px] text-[#64748B] leading-relaxed mb-6">{f.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {f.pills.map((p, j) => (
                    <span key={j} className="bg-[#F7F9FC] border border-[#0F172A]/10 text-[#64748B] px-3 py-1 rounded-full text-[11px] font-bold">{p}</span>
                  ))}
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════
   HOW IT WORKS
   ════════════════════════════════════════════ */
function HowItWorks() {
  const steps = [
    { icon: <Link2 size={28} />, num: '1', title: 'Connect SFMC', desc: 'Install the WhatZupp connector. Authenticate with your SFMC credentials. Done in under 10 minutes.' },
    { icon: <ClipboardList size={28} />, num: '2', title: 'Sync Meta Templates', desc: 'Connect Meta Business Manager. Templates auto-import, get validated, and are ready for SFMC journeys.' },
    { icon: <Rocket size={28} />, num: '3', title: 'Launch & Track', desc: 'Fire your first WhatsApp campaign. Track delivery, reads, and engagement inside existing dashboards.' },
  ];
  return (
    <section id="how-it-works" className="pt-24 pb-12 px-6 bg-[#F7F9FC]">
      <div className="max-w-[1160px] mx-auto">
        <Reveal className="text-center mb-16">
          <Tag>Simple Setup</Tag>
          <h2 className="font-sans text-[clamp(36px,4vw,56px)] font-extrabold leading-[1.1] tracking-tight text-[#0F172A] mt-6 mb-5">Up and Running<br />in Three Steps</h2>
          <p className="text-lg text-[#64748B] mx-auto max-w-[480px] font-medium">From integration to first campaign in days, not months.</p>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="hidden md:block absolute top-[55px] left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] h-0.5 bg-gradient-to-r from-[#25D366]/40 via-blue-400/30 to-[#25D366]/40" />
          {steps.map((s, i) => (
            <Reveal key={i} delay={i * 0.15}>
              <GlassCard className="p-9 text-center relative h-full">
                <div className="w-20 h-20 rounded-3xl bg-[#25D366]/[0.06] border border-[#25D366]/15 mx-auto mb-5 flex items-center justify-center text-[#25D366] relative">
                  {s.icon}
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#25D366] text-[11px] font-sans font-bold text-white flex items-center justify-center shadow-md shadow-green-600/20">{s.num}</span>
                </div>
                <h3 className="font-sans text-xl font-semibold text-gray-900 tracking-[0.3px] mb-3">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════
   USE CASES
   ════════════════════════════════════════════ */
function UseCases() {
  const cases = [
    {
      icon: <ShoppingCart size={32} />, iconColor: 'text-[#25D366] bg-[#25D366]/10',
      tag: 'E-Commerce', tagColor: 'bg-[#25D366]/10 text-[#128C7E]', borderColor: 'from-[#25D366] to-emerald-400',
      title: 'From Browse to Buy to Repeat',
      desc: 'Drive purchase completion and loyalty with perfectly timed WhatsApp touchpoints.',
      msgs: [
        { sender: 'ShopNow', text: 'Hey Sarah! You left 2 items in your cart. Get 10% off if you complete your order in 2 hours!' },
        { sender: 'ShopNow', text: 'Order confirmed! Your Nike Air Max will arrive by Thursday. Track → bit.ly/track123' },
      ],
    },
    {
      icon: <Truck size={32} />, iconColor: 'text-orange-500 bg-orange-50',
      tag: 'Logistics', tagColor: 'bg-orange-50 text-orange-600', borderColor: 'from-orange-500 to-amber-400',
      title: 'Real-Time Delivery Intelligence',
      desc: 'Keep customers informed at every milestone — from dispatch to doorstep.',
      msgs: [
        { sender: 'FastShip', text: 'Your package has been dispatched from our Mumbai hub. ETA: Tomorrow, 10 AM – 2 PM' },
        { sender: 'FastShip', text: 'Out for delivery now! Driver is 3 stops away. [Live Track]' },
      ],
    },
    {
      icon: <Landmark size={32} />, iconColor: 'text-indigo-500 bg-indigo-50',
      tag: 'BFSI', tagColor: 'bg-indigo-50 text-indigo-600', borderColor: 'from-indigo-500 to-purple-500',
      title: 'Secure, Compliant Notifications',
      desc: 'OTPs, fraud alerts, transaction confirmations — instantly on WhatsApp.',
      msgs: [
        { sender: 'SecureBank', text: 'Your OTP for login is 847291. Valid for 10 minutes. Never share this.' },
        { sender: 'SecureBank', text: 'New login detected from Delhi. Was this you? [Yes] [No — Secure Account]' },
      ],
    },
    {
      icon: <Heart size={32} />, iconColor: 'text-pink-500 bg-pink-50',
      tag: 'Healthcare', tagColor: 'bg-pink-50 text-pink-600', borderColor: 'from-pink-400 to-rose-500',
      title: 'Care That Shows Up On Time',
      desc: 'Appointment reminders, prescription alerts, lab results, and follow-up care.',
      msgs: [
        { sender: 'CityCare', text: 'Reminder: Your appointment with Dr. Meera is tomorrow at 10:30 AM. [Confirm] [Reschedule]' },
        { sender: 'CityCare', text: 'Your lab reports are ready. View securely → [Secure Link]' },
      ],
    },
  ];

  return (
    <section id="use-cases" className="pt-10 pb-24 px-6 bg-[#FFFFFF]">
      <div className="max-w-[1160px] mx-auto">
        <Reveal className="text-center mb-16">
          <Tag>Industry Stories</Tag>
          <h2 className="font-sans text-[clamp(36px,4vw,56px)] font-extrabold leading-[1.1] tracking-tight text-[#0F172A] mt-6 mb-5">Built for Every<br />Customer Journey</h2>
          <p className="text-lg text-[#64748B] mx-auto max-w-[480px] font-medium">Real use cases across industries. Real results.</p>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cases.map((c, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <GlassCard className="p-8 relative overflow-hidden group h-full">
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${c.borderColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className={`w-14 h-14 rounded-2xl ${c.iconColor} flex items-center justify-center mb-4`}>
                  {c.icon}
                </div>
                <span className={`inline-block text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1 rounded-full mb-3 ${c.tagColor}`}>{c.tag}</span>
                <h3 className="font-sans text-xl font-bold text-[#0F172A] tracking-tight mb-3">{c.title}</h3>
                <p className="text-[15px] text-[#64748B] leading-relaxed mb-6">{c.desc}</p>
                <div className="flex flex-col gap-2">
                  {c.msgs.map((m, j) => (
                    <div key={j} className="bg-[#F7F9FC]/80 backdrop-blur border border-[#0F172A]/[0.04] rounded-xl px-4 py-3 text-[13px] leading-relaxed text-[#0F172A] hover:border-[#25D366]/30 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 size={12} className="text-[#25D366]" />
                        <span className="text-[11px] font-bold text-[#1EBE5D]">{m.sender}</span>
                      </div>
                      {m.text}
                    </div>
                  ))}
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════
   ANALYTICS DASHBOARD
   ════════════════════════════════════════════ */
function AnalyticsDashboard() {
  const kpis = [
    { label: 'Messages Sent', val: '4.8M', delta: '↑ 23% vs last period', color: 'text-gray-900', icon: <Send size={16} /> },
    { label: 'Delivered', val: '4.72M', delta: '98.3% delivery rate', color: 'text-[#25D366]', icon: <CheckCircle2 size={16} /> },
    { label: 'Read', val: '3.45M', delta: '73% read rate', color: 'text-blue-500', icon: <Eye size={16} /> },
    { label: 'CTA Clicks', val: '1.65M', delta: '34.9% engagement', color: 'text-pink-500', icon: <MousePointerClick size={16} /> },
  ];

  return (
    <section id="analytics" className="py-24 px-6 bg-[#F7F9FC]">
      <div className="max-w-[1160px] mx-auto">
        <Reveal className="text-center mb-16">
          <Tag>Data Intelligence</Tag>
          <h2 className="font-sans text-[clamp(36px,4vw,56px)] font-extrabold leading-[1.1] tracking-tight text-[#0F172A] mt-6 mb-5">Measure What Matters</h2>
          <p className="text-lg text-[#64748B] mx-auto max-w-[540px] font-medium">Full visibility into every message, campaign, and interaction — in real time.</p>
        </Reveal>

        <Reveal>
          <div className="bg-white/80 backdrop-blur-3xl border border-white/80 rounded-3xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.06)]">
            {/* Top bar */}
            <div className="bg-[#F7F9FC]/80 backdrop-blur px-6 py-4 border-b border-[#0F172A]/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-[#25D366]" />
                <span className="font-sans font-bold text-base text-[#0F172A]">WhatZupp Analytics Hub</span>
              </div>
              <div className="flex gap-2">
                {['Today', '7 Days', '30 Days', 'Custom'].map((t, i) => (
                  <button key={i} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    i === 0 ? 'bg-[#E6F9F0] text-[#1EBE5D] border border-[#25D366]/20 shadow-sm' : 'bg-white/80 border border-[#0F172A]/10 text-[#64748B] hover:border-[#0F172A]/20 hover:text-[#0F172A]'
                  }`}>{t}</button>
                ))}
              </div>
            </div>
            {/* KPIs */}
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {kpis.map((k, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/60 backdrop-blur border border-gray-100/60 rounded-2xl p-5 hover:border-[#25D366]/20 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[#64748B]">{k.icon}</span>
                      <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">{k.label}</p>
                    </div>
                    <p className={`font-sans text-3xl font-bold ${k.color}`}>{k.val}</p>
                    <p className="text-xs text-[#25D366] mt-1 font-medium">{k.delta}</p>
                  </motion.div>
                ))}
              </div>
              {/* Chart */}
              <div className="bg-white/60 backdrop-blur border border-gray-100/60 rounded-2xl p-5">
                <p className="text-sm font-semibold text-gray-500 mb-4">Message Delivery Trend — Last 7 Days</p>
                <div className="h-[120px] relative overflow-hidden">
                  <svg viewBox="0 0 700 120" preserveAspectRatio="none" className="w-full h-full">
                    <defs>
                      <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#25D366" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#25D366" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,80 L100,70 L200,65 L300,55 L400,45 L500,35 L600,25 L700,20" stroke="#25D366" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
                    <path d="M0,80 L100,70 L200,65 L300,55 L400,45 L500,35 L600,25 L700,20 L700,120 L0,120 Z" fill="url(#lg1)" />
                    <path d="M0,95 L100,85 L200,80 L300,72 L400,65 L500,55 L600,48 L700,42" stroke="#3B82F6" strokeWidth="2" strokeDasharray="5,3" fill="none" />
                    <circle cx="700" cy="20" r="4" fill="#25D366" />
                    <circle cx="700" cy="42" r="3.5" fill="#3B82F6" />
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                      <text key={i} x={i * 100} y={118} fill="#9CA3AF" fontSize="10">{d}</text>
                    ))}
                  </svg>
                </div>
                <div className="flex gap-5 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500"><div className="w-5 h-0.5 bg-[#25D366] rounded" /> Sent</div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500"><div className="w-5 h-0.5 bg-blue-500 rounded" style={{ borderTop: '2px dashed #3B82F6' }} /> Read</div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════
   CTA
   ════════════════════════════════════════════ */
function CTASection() {
  return (
    <section className="py-28 px-6 bg-white">
      <div className="max-w-[1160px] mx-auto">
        <Reveal>
          <div className="text-center bg-gradient-to-br from-[#25D366]/[0.04] to-blue-400/[0.03] border border-[#25D366]/10 rounded-[32px] px-8 md:px-16 py-20 relative overflow-hidden">
            <div className="absolute top-[-40%] left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-[#25D366]/[0.06] rounded-full blur-[120px] pointer-events-none" />
            <Tag>Get Started Today</Tag>
            <h2 className="font-sans text-[clamp(30px,4vw,52px)] font-bold tracking-normal text-gray-900 mt-6 mb-4 relative">Launch WhatsApp Campaigns<br />in Days, Not Months</h2>
            <p className="text-lg text-gray-500 mb-10 max-w-[500px] mx-auto relative">Join hundreds of enterprise teams transforming engagement on the world&apos;s #1 messaging platform.</p>
            <div className="flex gap-4 justify-center flex-wrap relative">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link href="/signup" className="px-9 py-4 rounded-full text-base font-semibold text-white bg-gradient-to-r from-[#25D366] to-[#128C7E] shadow-lg shadow-green-600/25 transition-all no-underline flex items-center gap-2">
                  <Rocket size={18} /> Request a Demo
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <a href="#" className="px-9 py-4 rounded-full text-base font-medium text-gray-700 border border-gray-200 hover:border-[#25D366] hover:text-[#128C7E] transition-all no-underline flex items-center gap-2">
                  <MessageSquare size={16} /> Talk to an Expert
                </a>
              </motion.div>
            </div>
            <div className="mt-10 flex justify-center gap-8 md:gap-12 flex-wrap relative">
              {[
                { val: 200, suffix: '+', label: 'Enterprise Clients' },
                { val: 4, suffix: '.8B+', label: 'Messages Delivered' },
                { val: 98, suffix: '.7%', label: 'Delivery Rate' },
                { val: 99, suffix: '.9%', label: 'Platform Uptime' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="font-sans text-3xl font-bold text-[#25D366]">
                    <AnimatedCounter target={s.val} suffix={s.suffix} />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════
   FOOTER
   ════════════════════════════════════════════ */
function Footer() {
  const socialIcons = [
    { icon: <Twitter size={16} />, href: '#' },
    { icon: <Linkedin size={16} />, href: '#' },
    { icon: <Youtube size={16} />, href: '#' },
    { icon: <Mail size={16} />, href: '#' },
  ];
  return (
    <footer className="bg-gray-50/50 border-t border-gray-100 pt-16 pb-10">
      <div className="max-w-[1160px] mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3 no-underline">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center shadow-sm">
                <MessageSquare size={14} className="text-white" />
              </div>
              <span className="font-sans font-bold text-lg text-gray-900">WhatZupp</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-[280px] mb-5">The enterprise WhatsApp engagement platform built natively for Salesforce Marketing Cloud.</p>
            <div className="flex gap-2">
              {socialIcons.map((s, i) => (
                <a key={i} href={s.href} className="w-9 h-9 rounded-lg bg-white/80 backdrop-blur border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#25D366]/5 hover:text-[#25D366] hover:border-[#25D366]/20 transition-all no-underline">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
          {[
            { title: 'Product', links: ['Features', 'Integrations', 'Pricing', 'Changelog', 'Roadmap'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press', 'Partners'] },
            { title: 'Support', links: ['Documentation', 'API Reference', 'Status', 'Contact', 'Compliance'] },
          ].map((col, i) => (
            <div key={i}>
              <h4 className="font-sans text-xs font-bold tracking-[0.08em] uppercase text-gray-400 mb-4">{col.title}</h4>
              <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
                {col.links.map((l, j) => (
                  <li key={j}><a href="#" className="text-sm text-gray-500 hover:text-[#25D366] transition-colors no-underline">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-7 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-xs text-gray-400">© {new Date().getFullYear()} WhatZupp by Pentacloud. All rights reserved.</span>
          <div className="flex gap-5">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((l, i) => (
              <a key={i} href="#" className="text-xs text-gray-400 hover:text-gray-600 no-underline transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <Hero />
      <EcosystemFlow />
      <StatsBar />
      <Features />
      <HowItWorks />
      <UseCases />
      <AnalyticsDashboard />
      <CTASection />
      <Footer />
    </div>
  );
}