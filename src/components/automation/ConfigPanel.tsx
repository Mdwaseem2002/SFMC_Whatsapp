'use client';

import React, { useState, useEffect } from 'react';
import type { FlowNode } from './NativeJourneyBuilder';
import { useWorkspace } from '@/components/workspace/WorkspaceProvider';
import { Settings, Plus, X } from 'lucide-react';

interface Props {
  node: FlowNode | null;
  onUpdateConfig: (nodeId: string, config: Record<string, any>) => void;
}

export default function ConfigPanel({ node, onUpdateConfig }: Props) {
  if (!node) {
    return (
      <div className="w-[300px] bg-white border-l border-slate-200 shrink-0 flex flex-col items-center justify-center text-center p-8">
        <Settings size={32} className="text-slate-200 mb-3" />
        <p className="text-sm font-semibold text-slate-400">Select a node to configure</p>
      </div>
    );
  }

  return (
    <div className="w-[300px] bg-white border-l border-slate-200 shrink-0 overflow-y-auto p-5">
      {node.type === 'contact_created' && <TriggerConfig node={node} onUpdate={onUpdateConfig} />}
      {node.type === 'message_received' && <MessageReceivedConfig />}
      {node.type === 'manual' && <ManualConfig />}
      {node.type === 'send_template' && <TemplateConfig node={node} onUpdate={onUpdateConfig} />}
      {node.type === 'time_delay' && <DelayConfig node={node} onUpdate={onUpdateConfig} />}
      {node.type === 'condition_split' && <ConditionConfig node={node} onUpdate={onUpdateConfig} />}
      {node.type === 'end_journey' && <EndJourneyConfig />}
    </div>
  );
}

// ═══════════════════════════════════
// 5. END JOURNEY CONFIG
// ═══════════════════════════════════
function EndJourneyConfig() {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-800">End Journey</h3>
      <p className="text-xs text-slate-500">This node officially ends the journey for the contact. No further actions will be taken after reaching this point.</p>
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <p className="text-xs text-red-700 font-medium">✓ The journey completes here</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════
// 1. CONTACT CREATED TRIGGER CONFIG
// ═══════════════════════════════════
function TriggerConfig({ node, onUpdate }: { node: FlowNode; onUpdate: (id: string, c: any) => void }) {
  const { state, activeWorkspace } = useWorkspace();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  const filters: any[] = node.config.filters || [];
  const logic: string = node.config.logic || 'AND';
  const selectedWs: string = node.config.workspaceId || '';

  const handleWsChange = async (wsId: string) => {
    onUpdate(node.id, { workspaceId: wsId });
    if (!wsId) { setContacts([]); return; }
    setLoadingContacts(true);
    try {
      const res = await fetch(`/api/user/contacts?workspaceId=${wsId}`);
      const data = await res.json();
      if (data.success) setContacts(data.data);
    } catch { /* ignore */ } finally { setLoadingContacts(false); }
  };

  // Always lock to the active workspace
  useEffect(() => {
    if (activeWorkspace) {
      handleWsChange(activeWorkspace.id);
    }
  }, [activeWorkspace?.id]);

  const addFilter = () => {
    const f = [...filters, { field: 'name', operator: 'equals', value: '' }];
    onUpdate(node.id, { filters: f });
  };
  const removeFilter = (i: number) => {
    const f = [...filters]; f.splice(i, 1);
    onUpdate(node.id, { filters: f });
  };
  const setFilter = (i: number, key: string, val: string) => {
    const f = [...filters]; f[i] = { ...f[i], [key]: val };
    onUpdate(node.id, { filters: f });
  };

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-bold text-slate-800">Contact Created Trigger</h3>

      {/* Workspace (locked to active workspace) */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Workspace</label>
        <div className="w-full border border-slate-200 rounded-lg p-2 text-sm bg-slate-50 text-slate-700 font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#25D366] shrink-0" />
          {activeWorkspace?.name || 'No workspace selected'}
        </div>
      </div>

      {/* Contact preview */}
      {selectedWs && (
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            Contacts Preview {loadingContacts && '(loading…)'}
          </label>
          <div className="max-h-32 overflow-y-auto border border-slate-100 rounded-lg">
            {contacts.length === 0 && !loadingContacts && (
              <p className="text-xs text-slate-400 p-2 text-center">No contacts found</p>
            )}
            {contacts.slice(0, 20).map((c: any) => (
              <div key={c.id} className="flex items-center justify-between px-3 py-1.5 border-b border-slate-50 last:border-0">
                <span className="text-xs font-medium text-slate-700 truncate">{c.name}</span>
                <span className="text-[10px] text-slate-400">{c.phoneNumber}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logic toggle */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Filter Logic</label>
        <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
          <button
            className={`px-4 py-1 text-xs font-bold rounded-md ${logic === 'AND' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
            onClick={() => onUpdate(node.id, { logic: 'AND' })}
          >AND</button>
          <button
            className={`px-4 py-1 text-xs font-bold rounded-md ${logic === 'OR' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
            onClick={() => onUpdate(node.id, { logic: 'OR' })}
          >OR</button>
        </div>
      </div>

      {/* Filter rows */}
      <div className="space-y-2">
        {filters.map((f: any, i: number) => (
          <div key={i} className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg space-y-2 relative">
            <button className="absolute top-1.5 right-1.5 text-slate-400 hover:text-red-500" onClick={() => removeFilter(i)}>
              <X size={12} />
            </button>
            <div className="grid grid-cols-2 gap-2">
              <select className="text-xs border rounded p-1.5 bg-white" value={f.field} onChange={(e) => setFilter(i, 'field', e.target.value)}>
                <option value="name">Name</option>
                <option value="company">Company</option>
                <option value="tags">Tags</option>
                <option value="phoneNumber">Phone</option>
              </select>
              <select className="text-xs border rounded p-1.5 bg-white" value={f.operator} onChange={(e) => setFilter(i, 'operator', e.target.value)}>
                <option value="equals">equals</option>
                <option value="contains">contains</option>
                <option value="starts_with">starts with</option>
              </select>
            </div>
            <input
              type="text" placeholder="Value" className="text-xs border rounded p-1.5 w-full"
              value={f.value || ''} onChange={(e) => setFilter(i, 'value', e.target.value)}
            />
          </div>
        ))}
        <button className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-xs font-bold text-slate-500 flex items-center justify-center gap-1 hover:bg-slate-50" onClick={addFilter}>
          <Plus size={12} /> Add Condition
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════
// 2. SEND TEMPLATE CONFIG
// ═══════════════════════════════════
function TemplateConfig({ node, onUpdate }: { node: FlowNode; onUpdate: (id: string, c: any) => void }) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/templates')
      .then((r) => r.json())
      .then((d) => { if (d.success || d.templates) setTemplates(d.templates || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const selectedName = node.config.templateName || '';
  const selectedTemplate = templates.find((t) => t.name === selectedName);
  const bodyComp = selectedTemplate?.components?.find((c: any) => c.type === 'BODY');

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-800">Select Template</h3>
      {loading ? (
        <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" /></div>
      ) : templates.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">No approved templates found</p>
      ) : (
        <div className="space-y-2 max-h-56 overflow-y-auto">
          {templates.map((t: any) => (
            <button
              key={t.id || t.name}
              onClick={() => onUpdate(node.id, { templateName: t.name, templateId: t.id, language: t.language })}
              className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                t.name === selectedName ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">{t.name}</span>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{t.category}</span>
              </div>
              <span className="text-[10px] text-slate-400">{t.language}</span>
            </button>
          ))}
        </div>
      )}
      {selectedTemplate && bodyComp && (
        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Preview</label>
          <p className="text-xs text-slate-700 whitespace-pre-wrap">{bodyComp.text}</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════
// 3. TIME DELAY CONFIG
// ═══════════════════════════════════
function DelayConfig({ node, onUpdate }: { node: FlowNode; onUpdate: (id: string, c: any) => void }) {
  const amount = node.config.amount || '';
  const unit = node.config.unit || 'Minutes';

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-800">Delay Time</h3>
      <div className="flex gap-2">
        <input
          type="number" min={1} max={999} placeholder="30"
          className="flex-1 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-slate-300"
          value={amount}
          onChange={(e) => onUpdate(node.id, { amount: e.target.value })}
        />
        <select
          className="border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-slate-300"
          value={unit}
          onChange={(e) => onUpdate(node.id, { unit: e.target.value })}
        >
          <option>Minutes</option>
          <option>Hours</option>
          <option>Days</option>
        </select>
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
        <p className="text-xs text-slate-600">
          ⏱ <strong>Wait {amount || '—'} {unit}</strong> before next step
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════
// 4. CONDITION SPLIT CONFIG
// ═══════════════════════════════════
function ConditionConfig({ node, onUpdate }: { node: FlowNode; onUpdate: (id: string, c: any) => void }) {
  const conditionType = node.config.conditionType || 'user_replied';
  const timeout = node.config.timeout || '';
  const timeoutUnit = node.config.timeoutUnit || 'Minutes';

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-800">Condition</h3>
      <div className="space-y-2">
        <button
          onClick={() => onUpdate(node.id, { conditionType: 'user_replied' })}
          className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
            conditionType === 'user_replied' ? 'border-green-500 bg-green-50' : 'border-slate-200'
          }`}
        >
          <span className="text-sm font-semibold text-slate-800">User replied to message</span>
          <span className="block text-[10px] font-bold text-green-600 mt-0.5">→ Path A (YES)</span>
        </button>
        <button
          onClick={() => onUpdate(node.id, { conditionType: 'no_reply' })}
          className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
            conditionType === 'no_reply' ? 'border-red-400 bg-red-50' : 'border-slate-200'
          }`}
        >
          <span className="text-sm font-semibold text-slate-800">No reply received</span>
          <span className="block text-[10px] font-bold text-red-500 mt-0.5">→ Path B (NO)</span>
        </button>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Check after</label>
        <div className="flex gap-2">
          <input
            type="number" min={1} max={999} placeholder="30"
            className="flex-1 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-1"
            value={timeout}
            onChange={(e) => onUpdate(node.id, { timeout: e.target.value })}
          />
          <select
            className="border border-slate-200 rounded-lg p-2.5 text-sm"
            value={timeoutUnit}
            onChange={(e) => onUpdate(node.id, { timeoutUnit: e.target.value })}
          >
            <option>Minutes</option>
            <option>Hours</option>
            <option>Days</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// Minimal configs for nodes that don't need settings
function MessageReceivedConfig() {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-800">Message Received</h3>
      <p className="text-xs text-slate-500">This trigger fires when a contact sends any WhatsApp message to this workspace.</p>
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <p className="text-xs text-green-700 font-medium">✓ No configuration needed — fires automatically</p>
      </div>
    </div>
  );
}

function ManualConfig() {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-800">Manual Trigger</h3>
      <p className="text-xs text-slate-500">This journey must be started manually from the automation list page.</p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-700 font-medium">✓ Use the &quot;Run&quot; button to start this journey</p>
      </div>
    </div>
  );
}
