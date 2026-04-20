'use client';

// src/components/app/AppShell.tsx
// Main app layout: top bar (logo + workspace switcher + user), sidebar (desktop) / bottom nav (mobile), content area

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard, MessageSquare, Users2, BarChart3, Zap, Settings, Cloud } from 'lucide-react';
import WorkspaceSwitcher from '@/components/workspace/WorkspaceSwitcher';
import { useWorkspace } from '@/components/workspace/WorkspaceProvider';
import DashboardView from '@/components/app/DashboardView';
import ChatsView from '@/components/app/ChatsView';
import ContactsView from '@/components/app/ContactsView';
import AnalyticsView from '@/components/app/AnalyticsView';
import SettingsView from '@/components/app/SettingsView';
import FastReplyView from '@/components/app/FastReplyView';
import SFMCView from '@/components/app/SFMCView';
import type { AppScreen } from '@/types/workspace';

const NAV_ITEMS: { key: AppScreen; label: string; icon: React.ReactNode }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { key: 'chats', label: 'Chats', icon: <MessageSquare size={20} /> },
  { key: 'contacts', label: 'Contacts', icon: <Users2 size={20} /> },
  { key: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
  { key: 'sfmc', label: 'SFMC', icon: <Cloud size={20} /> },
  { key: 'fast-reply', label: 'Fast Reply', icon: <Zap size={20} /> },
  { key: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

export default function AppShell() {
  const router = useRouter();
  const { state, setActiveScreen, activeWorkspace } = useWorkspace();
  const [currentUser, setCurrentUser] = useState<{ name: string } | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Fetch current user
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => { if (data.authenticated) setCurrentUser({ name: data.user.name }); })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch { setLoggingOut(false); }
  };

  const accentColor = activeWorkspace?.color || '#2563eb';
  const activeScreen = state.activeScreen;

  const renderContent = () => {
    switch (activeScreen) {
      case 'dashboard': return <DashboardView />;
      case 'chats': return <ChatsView />;
      case 'contacts': return <ContactsView />;
      case 'analytics': return <AnalyticsView />;
      case 'settings': return <SettingsView />;
      case 'sfmc': return <SFMCView />;
      case 'fast-reply': return <FastReplyView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans selection:bg-blue-200">
      
      {/* ─── Top Bar ─── */}
      <header className="flex items-center justify-between px-6 h-14 bg-white border-b border-slate-200 shrink-0 z-50">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
             <MessageSquare size={16} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">
            WhatZupp
          </span>
        </div>

        {/* Center: Workspace Switcher */}
        <WorkspaceSwitcher />

        {/* Right: User + Logout */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100"
              >
                {currentUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <span className="text-sm font-medium text-slate-600 hidden md:inline-block">
                {currentUser.name}
              </span>
            </div>
          )}
          <div className="w-px h-5 bg-slate-200 mx-1 hidden md:block"></div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* ─── Body: Sidebar + Content ─── */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Desktop Sidebar */}
        {!isMobile && (
          <nav className="w-[72px] bg-white border-r border-slate-200 flex flex-col items-center py-4 gap-2 shrink-0">
            {NAV_ITEMS.map(item => {
              const isActive = activeScreen === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveScreen(item.key)}
                  title={item.label}
                  className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all relative group
                    ${isActive
                      ? item.key === 'sfmc'
                        ? 'bg-orange-50 text-orange-600'
                        : 'bg-blue-50 text-blue-600'
                      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}
                  `}
                >
                  {isActive && (
                    <div className={`absolute left-[-12px] top-1/2 -translate-y-1/2 w-1 h-6 rounded-r ${item.key === 'sfmc' ? 'bg-orange-500' : 'bg-blue-600'}`} />
                  )}
                  <span>{item.icon}</span>
                  <span className={`text-[9px] ${isActive ? 'font-bold' : 'font-medium'} font-sans`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-hidden flex">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      {isMobile && (
        <nav className="flex bg-white border-t border-slate-200 py-1.5 shrink-0 px-2 pb-safe">
          {NAV_ITEMS.slice(0, 5).map(item => {
            const isActive = activeScreen === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveScreen(item.key)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-1
                  ${isActive ? 'text-blue-600' : 'text-slate-400'}
                `}
              >
                <span>{item.icon}</span>
                <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
