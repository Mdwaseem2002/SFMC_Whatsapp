'use client';

// src/components/app/SettingsView.tsx
// Settings: profile edit, workspace management, api config, theme toggle

import React, { useState } from 'react';
import { useWorkspace } from '@/components/workspace/WorkspaceProvider';
import { WORKSPACE_COLORS } from '@/types/workspace';
import { User, Building2, Smartphone, Palette, Check, Plus, Trash2, Globe, Briefcase, Users2, ShoppingBag, Zap, ChevronDown, Loader2 } from 'lucide-react';

const ICON_OPTIONS = ['Building2', 'Briefcase', 'Globe', 'Users2', 'ShoppingBag', 'Zap'];

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

export default function SettingsView() {
  const [activeSection, setActiveSection] = useState<'profile' | 'workspaces' | 'whatsapp' | 'theme'>('profile');

  const sections = [
    { key: 'profile' as const, label: 'Profile', icon: <User size={18} /> },
    { key: 'workspaces' as const, label: 'Workspaces', icon: <Building2 size={18} /> },
    { key: 'whatsapp' as const, label: 'WhatsApp API', icon: <Smartphone size={18} /> },
    { key: 'theme' as const, label: 'Appearance', icon: <Palette size={18} /> },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 font-sans flex flex-col md:flex-row">
      {/* Settings Sidebar */}
      <div className="w-full md:w-64 bg-white border-r border-slate-200 p-6 shrink-0 md:min-h-full">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-6 pl-2">
          Settings
        </h2>
        <nav className="flex flex-col gap-1">
          {sections.map(s => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${activeSection === s.key ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
              `}
            >
              <span className={activeSection === s.key ? 'text-blue-600' : 'text-slate-400'}>
                {s.icon}
              </span> 
              {s.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 max-w-3xl">
        {activeSection === 'profile' && <ProfileSection />}
        {activeSection === 'workspaces' && <WorkspacesSection />}
        {activeSection === 'whatsapp' && <WhatsAppConfigSection />}
        {activeSection === 'theme' && <ThemeSection />}
      </div>
    </div>
  );
}

// ─── Profile Section ───
function ProfileSection() {
  const { state, setProfile } = useWorkspace();
  const p = state.profile;
  const [name, setName] = useState(p?.name || '');
  const [phone, setPhone] = useState(p?.phone || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!p) return;
    setProfile({ ...p, name: name.trim(), phone: phone.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">
        Edit Profile
      </h3>
      <div className="space-y-5 max-w-md">
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Full Name</label>
          <input 
            value={name} onChange={e => setName(e.target.value)} 
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Email</label>
          <input 
            value={p?.email || ''} disabled 
            className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Phone</label>
          <input 
            value={phone} onChange={e => setPhone(e.target.value)} 
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="pt-2">
          <button
            onClick={handleSave}
            className={`px-6 py-2.5 rounded-lg text-white font-medium transition-all shadow-sm flex items-center gap-2
              ${saved ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700'}
            `}
          >
            {saved ? <><Check size={18} /> Saved!</> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Workspaces Section ───
function WorkspacesSection() {
  const { state, addWorkspace, deleteWorkspace } = useWorkspace();
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(WORKSPACE_COLORS[0]);
  const [newIcon, setNewIcon] = useState('Building2');
  const [showIconPicker, setShowIconPicker] = useState(false);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addWorkspace({ name: newName.trim(), color: newColor, icon: newIcon });
    setNewName('');
  };

  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">
        Manage Workspaces
      </h3>

      {/* Existing workspaces */}
      <div className="space-y-3 mb-8">
        {state.workspaces.map(ws => (
          <div key={ws.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="flex items-center gap-3">
              <span 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: ws.color }}
              >
                {renderIcon(ws.icon, { size: 18 })}
              </span>
              <span className="text-sm font-semibold text-slate-900">
                {ws.name}
              </span>
            </div>
            {state.workspaces.length > 1 && (
              <button
                onClick={() => { if (confirm(`Delete workspace "${ws.name}"?`)) deleteWorkspace(ws.id); }}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-200 flex items-center justify-center transition-colors"
                title="Delete Workspace"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add new workspace */}
      <div className="pt-6 border-t border-slate-100">
        <h4 className="text-[14px] font-semibold text-slate-900 mb-4">Create New Workspace</h4>
        <div className="flex flex-col md:flex-row gap-4 items-start">
          
          <div className="relative">
            <button
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 transition-transform hover:scale-105 shadow-sm"
              style={{ backgroundColor: newColor }}
            >
              {renderIcon(newIcon, { size: 20 })}
            </button>
            {showIconPicker && (
              <div className="absolute top-14 left-0 z-50 bg-white border border-slate-200 rounded-xl p-2 grid grid-cols-3 gap-2 shadow-xl animate-in fade-in zoom-in-95">
                {ICON_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => { setNewIcon(opt); setShowIconPicker(false); }}
                    className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    {renderIcon(opt, { size: 18 })}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3 w-full">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Workspace Name"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all max-w-xs"
            />
            <div className="flex gap-2 flex-wrap pb-2">
              {WORKSPACE_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setNewColor(color)}
                  className="w-6 h-6 rounded-full transition-all"
                  style={{
                    backgroundColor: color,
                    boxShadow: newColor === color ? `0 0 0 2px white, 0 0 0 4px ${color}` : 'none',
                    transform: newColor === color ? 'scale(1.1)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>
          
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

function WhatsAppConfigSection() {
  const [token, setToken] = useState('Loading...');
  const [phoneNumberId, setPhoneNumberId] = useState('Loading...');
  const [businessAccountId, setBusinessAccountId] = useState('Loading...');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    fetch('/api/get-env-variables')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setToken(data.env.accessToken || '');
          setPhoneNumberId(data.env.phoneNumberId || '');
          setBusinessAccountId(data.env.verificationToken || ''); // Just mapped to show it's loaded
        }
      })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/save-env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token })
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all";

  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">
        WhatsApp API Configuration
      </h3>
      <p className="text-sm text-slate-500 mb-6">
        Update your Meta developer credentials to send and receive messages.
      </p>

      <div className="space-y-5">
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5 flex justify-between">
            Temporary Access Token
            <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-blue-600 font-medium hover:underline">Get Token</a>
          </label>
          <textarea 
            value={token} onChange={e => setToken(e.target.value)} rows={3} 
            className={`${inputClass} resize-none`}
          />
          <p className="text-xs text-amber-600 mt-1.5 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Expires in approx. 24 hours. Needs manual refresh.
          </p>
        </div>
        
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Phone Number ID</label>
          <input 
            value={phoneNumberId} onChange={e => setPhoneNumberId(e.target.value)} 
            className={inputClass}
          />
        </div>
        
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">WhatsApp Business Account ID</label>
          <input 
            value={businessAccountId} onChange={e => setBusinessAccountId(e.target.value)} 
            className={inputClass}
          />
        </div>

        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2.5 rounded-lg text-white font-medium transition-all shadow-sm flex items-center gap-2
              ${saved ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-900 hover:bg-slate-800'}
            `}
          >
            {saving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : saved ? <><Check size={18} /> Credentials Saved!</> : 'Save API Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Theme Section ───
function ThemeSection() {
  const { state: { theme }, setTheme } = useWorkspace();

  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">
        Appearance
      </h3>
      <div className="flex gap-4">
        <button
          onClick={() => setTheme('light')}
          className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3
            ${theme === 'light' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-300'}
          `}
        >
          <div className="w-full h-24 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex flex-col">
            <div className="h-4 bg-white border-b border-slate-200"></div>
            <div className="flex-1 flex px-2 pt-2 gap-2">
              <div className="w-4 bg-slate-200 rounded-sm"></div>
              <div className="flex-1 bg-white rounded-sm shadow-sm"></div>
            </div>
          </div>
          <span className="text-sm font-semibold text-slate-700">Light Mode</span>
        </button>
        
        <button
          onClick={() => setTheme('dark')}
          className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3
            ${theme === 'dark' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-300'}
          `}
        >
          <div className="w-full h-24 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex flex-col">
            <div className="h-4 bg-slate-900 border-b border-slate-700"></div>
            <div className="flex-1 flex px-2 pt-2 gap-2">
              <div className="w-4 bg-slate-700 rounded-sm"></div>
              <div className="flex-1 bg-slate-600 rounded-sm shadow-sm"></div>
            </div>
          </div>
          <span className="text-sm font-semibold text-slate-700">Dark Mode</span>
        </button>
      </div>
      <p className="text-[13px] text-slate-500 mt-6 text-center">
        Dark mode is currently simulated for preview purposes.
      </p>
    </div>
  );
}
