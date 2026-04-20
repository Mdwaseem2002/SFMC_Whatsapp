'use client';

// src/components/onboarding/WorkspaceSetup.tsx
// Onboarding Step 2: Create workspaces

import React, { useState } from 'react';
import { useWorkspace } from '@/components/workspace/WorkspaceProvider';
import {
  SEED_WORKSPACES,
  SEED_CONTACTS,
  SEED_FAST_REPLIES,
  WORKSPACE_COLORS,
} from '@/types/workspace';
import type { Workspace } from '@/types/workspace';
import { Building2, Briefcase, Globe, Users2, ShoppingBag, Zap, X, Plus, ArrowLeft, Check } from 'lucide-react';

interface DraftWorkspace {
  tempId: string;
  name: string;
  color: string;
  icon: string;
}

const ICON_OPTIONS = ['Building2', 'Briefcase', 'Globe', 'Users2', 'ShoppingBag', 'Zap'];

// Helper to render Lucide icon by string name
const renderIcon = (name: string, props: any = { size: 20 }) => {
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

export default function WorkspaceSetup() {
  const { addWorkspace, addContact, addFastReply, completeOnboarding, setActiveScreen } = useWorkspace();

  const [drafts, setDrafts] = useState<DraftWorkspace[]>([
    {
      tempId: `draft-${Date.now()}`,
      name: '',
      color: WORKSPACE_COLORS[0],
      icon: 'Building2',
    }
  ]);

  const [showIconPicker, setShowIconPicker] = useState<string | null>(null);

  const addDraft = () => {
    setDrafts(prev => [
      ...prev,
      {
        tempId: `draft-${Date.now()}`,
        name: '',
        color: WORKSPACE_COLORS[prev.length % WORKSPACE_COLORS.length],
        icon: 'Briefcase',
      },
    ]);
  };

  const removeDraft = (tempId: string) => {
    if (drafts.length <= 1) return;
    setDrafts(prev => prev.filter(d => d.tempId !== tempId));
  };

  const updateDraft = (tempId: string, updates: Partial<DraftWorkspace>) => {
    setDrafts(prev => prev.map(d => d.tempId === tempId ? { ...d, ...updates } : d));
  };

  const handleFinish = async () => {
    const validDrafts = drafts.filter(d => d.name.trim());
    if (validDrafts.length === 0) return;

    // Create workspaces and map seed contacts
    const createdWorkspaces: Workspace[] = [];
    for (const draft of validDrafts) {
      const ws = await addWorkspace({
        name: draft.name.trim(),
        color: draft.color,
        icon: draft.icon,
      });
      createdWorkspaces.push(ws);
    }

    // Removed seed contacts assignment based on user preference to start fresh

    // Add seed fast reply templates (global)
    for (const template of SEED_FAST_REPLIES) {
      await addFastReply({
        title: template.title,
        body: template.body
      });
    }

    completeOnboarding();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-blue-200">
      <div className="w-full max-w-lg relative z-10">
        <div className="bg-white py-10 px-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 sm:px-12 max-h-[85vh] overflow-y-auto">
          
          {/* Progress Indicator */}
          <div className="flex gap-2 mb-8">
            <div className="h-1 flex-1 rounded-full bg-blue-600 transition-all duration-300"></div>
            <div className="h-1 flex-1 rounded-full bg-blue-600 transition-all duration-300"></div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
              Create your workspaces
            </h1>
            <p className="text-sm text-slate-500">
              Workspaces help you organize contacts and chats by team or brand
            </p>
          </div>

          {/* Workspace Cards */}
          <div className="flex flex-col gap-4 mb-6">
            {drafts.map((draft) => (
              <div
                key={draft.tempId}
                className="bg-white border rounded-xl p-4 relative transition-all"
                style={{ borderColor: draft.color + '40', boxShadow: `0 4px 12px ${draft.color}10` }}
              >
                {/* Remove button */}
                {drafts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDraft(draft.tempId)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}

                <div className="flex gap-4 items-start pt-1">
                  {/* Icon Picker Button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowIconPicker(showIconPicker === draft.tempId ? null : draft.tempId)}
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors border shadow-sm"
                      style={{ backgroundColor: draft.color + '15', color: draft.color, borderColor: draft.color + '30' }}
                    >
                      {renderIcon(draft.icon, { size: 22 })}
                    </button>

                    {showIconPicker === draft.tempId && (
                      <div className="absolute top-14 left-0 z-50 bg-white border border-slate-100 rounded-xl p-2 grid grid-cols-3 gap-2 shadow-xl">
                        {ICON_OPTIONS.map(iconOpt => (
                          <button
                            key={iconOpt}
                            type="button"
                            onClick={() => { updateDraft(draft.tempId, { icon: iconOpt }); setShowIconPicker(null); }}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${draft.icon === iconOpt ? 'bg-slate-100 shadow-inner' : 'hover:bg-slate-50'}`}
                            style={{ color: draft.icon === iconOpt ? draft.color : '#64748b' }}
                          >
                            {renderIcon(iconOpt, { size: 18 })}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Name + Color */}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={draft.name}
                      onChange={e => updateDraft(draft.tempId, { name: e.target.value })}
                      placeholder="Workspace Name"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 bg-slate-50 mb-3"
                      style={{ ':focus': { borderColor: draft.color } } as any}
                    />

                    {/* Color Swatches */}
                    <div className="flex gap-2 flex-wrap">
                      {WORKSPACE_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => updateDraft(draft.tempId, { color })}
                          className="w-6 h-6 rounded-full transition-all"
                          style={{
                            backgroundColor: color,
                            boxShadow: draft.color === color ? `0 0 0 2px white, 0 0 0 4px ${color}` : 'none',
                            transform: draft.color === color ? 'scale(1.1)' : 'scale(1)',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Another */}
          <button
            type="button"
            onClick={addDraft}
            className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-500 rounded-xl text-sm font-medium hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 mb-8"
          >
            <Plus size={16} /> Add Another Workspace
          </button>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setActiveScreen('onboarding-profile')}
              className="px-6 py-3 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              type="button"
              onClick={handleFinish}
              disabled={drafts.filter(d => d.name.trim()).length === 0}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              Finish Setup <Check size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
