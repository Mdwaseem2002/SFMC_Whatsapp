'use client';

// src/components/workspace/WorkspaceSwitcher.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '@/components/workspace/WorkspaceProvider';
import { Building2, Briefcase, Globe, Users2, ShoppingBag, Zap, ChevronDown, Check } from 'lucide-react';

const renderIcon = (name: string, props: any = { size: 16 }) => {
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

export default function WorkspaceSwitcher() {
  const { state, activeWorkspace, setActiveWorkspace } = useWorkspace();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!activeWorkspace) return null;

  return (
    <div ref={ref} className="relative font-sans">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 py-1.5 px-3 pr-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        style={{ ':hover ': { borderColor: activeWorkspace.color } } as any}
      >
        <span 
          className="w-5 h-5 rounded-md flex items-center justify-center text-white"
          style={{ backgroundColor: activeWorkspace.color }}
        >
          {renderIcon(activeWorkspace.icon, { size: 12, strokeWidth: 2.5 })}
        </span>
        <span className="text-sm font-semibold text-slate-900 tracking-tight">
          {activeWorkspace.name}
        </span>
        <ChevronDown 
          size={14} 
          className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+8px)] left-0 min-w-[240px] bg-white border border-slate-100 rounded-xl shadow-[0_12px_40px_rgb(0,0,0,0.12)] z-[100] animate-in fade-in slide-in-from-top-2 py-1.5 focus:outline-none">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Workspaces
          </div>
          <div className="flex flex-col">
            {state.workspaces.map(ws => (
              <button
                key={ws.id}
                onClick={() => { setActiveWorkspace(ws.id); setOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 transition-colors ${ws.id === activeWorkspace.id ? 'bg-slate-50' : 'bg-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  <span 
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: ws.color }}
                  >
                    {renderIcon(ws.icon, { size: 14 })}
                  </span>
                  <span className={`text-sm ${ws.id === activeWorkspace.id ? 'font-semibold text-slate-900' : 'font-medium text-slate-600'}`}>
                    {ws.name}
                  </span>
                </div>
                {ws.id === activeWorkspace.id && (
                  <Check size={16} style={{ color: ws.color }} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
