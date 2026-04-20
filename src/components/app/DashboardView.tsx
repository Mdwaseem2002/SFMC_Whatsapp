'use client';

// src/components/app/DashboardView.tsx
// Dashboard tab: workspace banner + stats cards + recent activity

import React from 'react';
import { useWorkspace } from '@/components/workspace/WorkspaceProvider';
import { Users2, MessageSquare, Send, Unlock, UserPlus, ClipboardList, Mail, Building2, Globe, Briefcase, ShoppingBag, Zap } from 'lucide-react';

const renderIcon = (name: string, props: any = { size: 24 }) => {
  switch (name) {
    case 'Building2': return <Building2 {...props} />;
    case 'Briefcase': return <Briefcase {...props} />;
    case 'Globe': return <Globe {...props} />;
    case 'Users2': return <Users2 {...props} />;
    case 'ShoppingBag': return <ShoppingBag {...props} />;
    case 'Zap': return <Zap {...props} />;
    default: return <Building2 {...props} />;
  }
};

export default function DashboardView() {
  const { activeWorkspace, activeContacts } = useWorkspace();
  if (!activeWorkspace) return null;

  const totalContacts = activeContacts.length;
  // Simplified stats 
  const totalChats = activeContacts.length;
  const messagesSentToday = Math.floor(Math.random() * 12) + 3; 
  const openConversations = Math.min(totalContacts, 5);

  const stats = [
    { label: 'Total Contacts', value: totalContacts, icon: <Users2 size={20} />, colorClass: 'text-blue-600', bgClass: 'bg-blue-50' },
    { label: 'Total Chats', value: totalChats, icon: <MessageSquare size={20} />, colorClass: 'text-indigo-600', bgClass: 'bg-indigo-50' },
    { label: 'Sent Today', value: messagesSentToday, icon: <Send size={20} />, colorClass: 'text-emerald-600', bgClass: 'bg-emerald-50' },
    { label: 'Open Chats', value: openConversations, icon: <Unlock size={20} />, colorClass: 'text-amber-600', bgClass: 'bg-amber-50' },
  ];

  const recentActivities = [
    { text: `New contact added to ${activeWorkspace.name}`, time: '2 min ago', icon: <UserPlus size={16} /> },
    { text: 'Template message sent', time: '15 min ago', icon: <ClipboardList size={16} /> },
    { text: 'Incoming message received', time: '1 hour ago', icon: <Mail size={16} /> },
    { text: `${activeWorkspace.name} workspace created`, time: 'Today', icon: renderIcon(activeWorkspace.icon, { size: 16 }) },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 font-sans">
      
      {/* Workspace Banner */}
      <div 
        className="px-8 py-8 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${activeWorkspace.color}, ${activeWorkspace.color}dd)`,
        }}
      >
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative z-10 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm shadow-sm">
               {renderIcon(activeWorkspace.icon, { size: 28, strokeWidth: 2.5 })}
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              {activeWorkspace.name}
            </h2>
          </div>
          <p className="text-[15px] text-white/80 font-medium ml-[52px]">
            Dashboard overview & engagement metrics
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-8">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[13px] font-semibold text-slate-500 uppercase tracking-wide">
                  {stat.label}
                </span>
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bgClass} ${stat.colorClass} shadow-sm`}>
                  {stat.icon}
                </span>
              </div>
              <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="px-8 pb-12">
          <h3 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">
            Recent Activity
          </h3>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden">
            {recentActivities.map((item, i) => (
              <div 
                key={i} 
                className={`flex items-center gap-4 px-6 py-4 hover:bg-slate-50/80 transition-colors ${i < recentActivities.length - 1 ? 'border-b border-slate-50' : ''}`}
              >
                <span className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 shadow-sm border border-slate-200/50">
                  {item.icon}
                </span>
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-slate-700">{item.text}</p>
                </div>
                <span className="text-[13px] font-medium text-slate-400 shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
