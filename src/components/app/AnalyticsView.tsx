'use client';

// src/components/app/AnalyticsView.tsx
// Simple CSS-only analytics charts for the active workspace

import React from 'react';
import { useWorkspace } from '@/components/workspace/WorkspaceProvider';
import { BarChart2, TrendingUp, Flame } from 'lucide-react';

export default function AnalyticsView() {
  const { activeWorkspace, activeContacts } = useWorkspace();
  if (!activeWorkspace) return null;

  // Generate simple demo data per workspace (deterministic)
  const seed = activeWorkspace.name.length;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const messagesData = days.map((d, i) => ({
    day: d,
    count: Math.max(2, ((seed * (i + 1) * 7) % 30) + Math.floor(Math.random() * 5)),
  }));
  const maxMsg = Math.max(...messagesData.map(d => d.count));

  const contactGrowth = [
    { month: 'Jan', count: Math.max(1, seed) },
    { month: 'Feb', count: Math.max(2, seed + 2) },
    { month: 'Mar', count: Math.max(3, seed + 4) },
    { month: 'Apr', count: activeContacts.length },
  ];
  const maxGrowth = Math.max(...contactGrowth.map(d => d.count));

  const topChats = activeContacts.slice(0, 5).map((c, i) => ({
    name: c.name,
    messages: Math.max(3, 20 - i * 4 + (seed % 5)),
  }));
  const maxChat = Math.max(...topChats.map(c => c.messages), 1);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 font-sans p-8">
      <div className="max-w-7xl mx-auto">
        
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-8">
          Analytics &mdash; {activeWorkspace.name}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Messages Over Time */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
            <h3 className="text-[15px] font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <BarChart2 size={18} className="text-blue-500" /> Messages This Week
            </h3>
            
            <div className="flex items-end justify-between gap-2 h-40">
              {messagesData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-600 transition-colors">
                    {d.count}
                  </span>
                  <div 
                    className="w-full max-w-[40px] rounded-t-md transition-all duration-500 group-hover:opacity-80"
                    style={{
                      height: `${Math.max(8, (d.count / maxMsg) * 130)}px`,
                      background: `linear-gradient(180deg, ${activeWorkspace.color}, ${activeWorkspace.color}99)`,
                    }} 
                  />
                  <span className="text-[11px] font-medium text-slate-400">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Growth */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
            <h3 className="text-[15px] font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-500" /> Contact Growth
            </h3>
            
            <div className="flex items-end justify-around gap-4 h-40">
              {contactGrowth.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-600 transition-colors">
                    {d.count}
                  </span>
                  <div 
                    className="w-full max-w-[50px] rounded-t-md transition-all duration-500 bg-gradient-to-b from-emerald-400 to-emerald-500/80 group-hover:opacity-80"
                    style={{
                      height: `${Math.max(12, (d.count / maxGrowth) * 130)}px`,
                    }} 
                  />
                  <span className="text-[11px] font-medium text-slate-400">{d.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Most Active Chats */}
          <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
            <h3 className="text-[15px] font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Flame size={18} className="text-amber-500" /> Most Active Contacts
            </h3>
            
            {topChats.length === 0 ? (
              <p className="text-sm font-medium text-slate-400 py-10 text-center">No contacts yet</p>
            ) : (
              <div className="flex flex-col gap-5">
                {topChats.map((chat, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ background: `${activeWorkspace.color}15`, color: activeWorkspace.color }}
                    >
                      {chat.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-semibold text-slate-900">{chat.name}</span>
                        <span className="text-[13px] font-medium text-slate-500 border border-slate-100 bg-slate-50 px-2.5 py-0.5 rounded-full">
                          {chat.messages} msgs
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${(chat.messages / maxChat) * 100}%`,
                            background: `linear-gradient(90deg, ${activeWorkspace.color}, ${activeWorkspace.color}cc)`,
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
