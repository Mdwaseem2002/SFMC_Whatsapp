'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useWorkspace } from '@/components/workspace/WorkspaceProvider';
import {
  ChevronLeft, Save, X, Zap, MessageSquare, Clock,
  SplitSquareHorizontal, Radio, Mail, User2, Play, Pause, Users,
  CircleStop, ChevronDown, ChevronUp
} from 'lucide-react';
import ConfigPanel from './ConfigPanel';

// ─── Types ───
export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  config: Record<string, any>;
}
export interface FlowEdge {
  from: string;
  to: string;
}

const NODE_W = 240;
const NODE_H_BASE = 80;

// ─── Seed demo flow ───
const DEMO_NODES: FlowNode[] = [
  { id: 'n1', type: 'contact_created', position: { x: 300, y: 40 }, config: { workspaceId: '', filters: [], logic: 'AND' } },
  { id: 'n2', type: 'send_template', position: { x: 300, y: 180 }, config: { templateName: 'Hello_World' } },
  { id: 'n3', type: 'time_delay', position: { x: 300, y: 320 }, config: { amount: 2, unit: 'Hours' } },
  { id: 'n4', type: 'condition_split', position: { x: 300, y: 460 }, config: { conditionType: 'user_replied', timeout: 30, timeoutUnit: 'Minutes' } },
];
const DEMO_EDGES: FlowEdge[] = [
  { from: 'n1', to: 'n2' },
  { from: 'n2', to: 'n3' },
  { from: 'n3', to: 'n4' },
];

const NODE_META: Record<string, { label: string; color: string; icon: any; category: string }> = {
  contact_created: { label: 'Contact Created', color: '#25D366', icon: User2, category: 'trigger' },
  message_received: { label: 'Message Received', color: '#25D366', icon: Mail, category: 'trigger' },
  manual: { label: 'Manual', color: '#25D366', icon: Radio, category: 'trigger' },
  send_template: { label: 'Send Template', color: '#3b82f6', icon: MessageSquare, category: 'action' },
  time_delay: { label: 'Time Delay', color: '#f59e0b', icon: Clock, category: 'logic' },
  condition_split: { label: 'Condition Split', color: '#8b5cf6', icon: SplitSquareHorizontal, category: 'logic' },
  end_journey: { label: 'End', color: '#ef4444', icon: CircleStop, category: 'logic' },
};

// ─── Helpers ───
function nodeHeight(node: FlowNode) {
  return NODE_H_BASE + (node.type === 'condition_split' ? 20 : 0);
}

function getNodeSummary(node: FlowNode): string {
  const c = node.config;
  switch (node.type) {
    case 'contact_created': {
      const n = c.filters?.length || 0;
      return n > 0 ? `${n} filter${n > 1 ? 's' : ''} (${c.logic || 'AND'})` : 'All contacts';
    }
    case 'send_template': return c.templateName ? `Template: ${c.templateName}` : 'Select template…';
    case 'time_delay': return `Wait ${c.amount || '-'} ${c.unit || 'Minutes'}`;
    case 'condition_split': return c.conditionType === 'no_reply' ? 'No reply?' : 'User replied?';
    case 'end_journey': return 'Journey completes here';
    case 'message_received': return 'On incoming message';
    case 'manual': return 'Triggered manually';
    default: return '';
  }
}

let _idCounter = 100;
function newId() { return `n_${Date.now()}_${_idCounter++}`; }

// ════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════
export default function NativeJourneyBuilder({
  journeyId,
  onClose,
}: {
  journeyId: string | null;
  onClose: () => void;
}) {
  const { activeWorkspace } = useWorkspace();
  const canvasRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState('New Journey');
  const [status, setStatus] = useState<'draft' | 'active'>('draft');
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);
  const [executions, setExecutions] = useState<any[]>([]);
  const [showStatusPanel, setShowStatusPanel] = useState(true);
  const [savedJourneyId, setSavedJourneyId] = useState<string | null>(journeyId);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Dragging state
  const dragRef = useRef<{ nodeId: string; offsetX: number; offsetY: number } | null>(null);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  // ─── Load existing journey or seed demo ───
  useEffect(() => {
    if (journeyId) {
      fetch(`/api/automation/${journeyId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) {
            setName(d.data.name);
            setStatus(d.data.status);
            setNodes(d.data.nodes || []);
            setEdges(d.data.edges || []);
            setTimeout(() => setHasUnsavedChanges(false), 100);
          }
        })
        .catch(console.error);
    } else {
      setNodes(DEMO_NODES);
      setEdges(DEMO_EDGES);
      setName('New Journey');
      setStatus('draft');
    }
  }, [journeyId]);

  // ─── Save ───
  const handleSave = async (): Promise<string | null> => {
    setSaving(true);
    try {
      const payload = { workspaceId: activeWorkspace?.id || '', name, status, nodes, edges };
      const currentId = savedJourneyId;
      const url = currentId ? `/api/automation/${currentId}` : '/api/automation';
      const method = currentId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.success && data.data?.id && !currentId) setSavedJourneyId(data.data.id);
      setHasUnsavedChanges(false);
      return currentId || data.data?.id || null;
    } catch (e) { console.error(e); return null; } finally { setSaving(false); }
  };

  // ─── Activate / Deactivate ───
  const handleActivate = async () => {
    setActivating(true);
    try {
      const jId = await handleSave();
      if (!jId) return;
      const res = await fetch(`/api/automation/${jId}/activate`, { method: 'POST' });
      const data = await res.json();
      if (data.success) { setStatus('active'); alert(`Journey activated! ${data.contactsEnrolled} contacts enrolled.`); }
    } catch (e) { console.error(e); } finally { setActivating(false); }
  };

  const handleDeactivate = async () => {
    const jId = savedJourneyId;
    if (!jId) return;
    try {
      await fetch(`/api/automation/${jId}/deactivate`, { method: 'POST' });
      setStatus('draft');
      setExecutions([]);
    } catch (e) { console.error(e); }
  };

  // ─── Poll executions when active ───
  useEffect(() => {
    const jId = savedJourneyId;
    if (status !== 'active' || !jId) return;
    const poll = () => fetch(`/api/automation/${jId}/executions`).then(r => r.json()).then(d => { if (d.success) setExecutions(d.data); }).catch(() => {});
    poll();
    const iv = setInterval(poll, 30000);
    return () => clearInterval(iv);
  }, [status, savedJourneyId]);

  // ─── Trigger execution processing ───
  useEffect(() => {
    if (status !== 'active') return;
    const iv = setInterval(() => fetch('/api/automation/execute').catch(() => {}), 60000);
    fetch('/api/automation/execute').catch(() => {});
    return () => clearInterval(iv);
  }, [status]);

  // ─── Drop from sidebar ───
  const handleCanvasDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (status === 'active' && !window.confirm('Adding nodes to an active journey will require deactivating it. Continue?')) {
        return;
      }
      const type = e.dataTransfer.getData('node-type');
      if (!type || !NODE_META[type]) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left - NODE_W / 2 + (canvasRef.current?.scrollLeft || 0);
      const y = e.clientY - rect.top - 40 + (canvasRef.current?.scrollTop || 0);
      const newNode: FlowNode = { id: newId(), type, position: { x: Math.max(0, x), y: Math.max(0, y) }, config: {} };
      if (type === 'end_journey') newNode.config = { isEnd: true };
      setNodes((prev) => [...prev, newNode]);
      setHasUnsavedChanges(true);
      if (status === 'active') setStatus('draft');
      setSelectedNodeId(newNode.id);
    },
    [status]
  );

  // ─── Node dragging on canvas ───
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = {
      nodeId,
      offsetX: e.clientX - rect.left + (canvasRef.current?.scrollLeft || 0) - node.position.x,
      offsetY: e.clientY - rect.top + (canvasRef.current?.scrollTop || 0) - node.position.y,
    };
    const onMove = (ev: MouseEvent) => {
      const currentDrag = dragRef.current;
      if (!currentDrag || !canvasRef.current) return;
      const r = canvasRef.current.getBoundingClientRect();
      const nx = ev.clientX - r.left + canvasRef.current.scrollLeft - currentDrag.offsetX;
      const ny = ev.clientY - r.top + canvasRef.current.scrollTop - currentDrag.offsetY;
      setNodes((prev) =>
        prev.map((n) => (n.id === currentDrag.nodeId ? { ...n, position: { x: Math.max(0, nx), y: Math.max(0, ny) } } : n))
      );
      setHasUnsavedChanges(true);
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // ─── Connect nodes ───
  const handleConnectorClick = (nodeId: string) => {
    if (!connecting) {
      setConnecting(nodeId);
    } else {
      if (connecting !== nodeId && !edges.find((e) => e.from === connecting && e.to === nodeId)) {
        setEdges((prev) => [...prev, { from: connecting, to: nodeId }]);
        setHasUnsavedChanges(true);
      }
      setConnecting(null);
    }
  };

  // ─── Delete node ───
  const deleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((e) => e.from !== nodeId && e.to !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
    setHasUnsavedChanges(true);
  };

  // ─── Update node config ───
  const updateNodeConfig = useCallback((nodeId: string, config: Record<string, any>) => {
    setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, config: { ...n.config, ...config } } : n)));
    setHasUnsavedChanges(true);
  }, []);

  // ─── SVG edge paths ───
  const renderEdges = () => {
    return edges.map((edge, i) => {
      const fromNode = nodes.find((n) => n.id === edge.from);
      const toNode = nodes.find((n) => n.id === edge.to);
      if (!fromNode || !toNode) return null;
      const x1 = fromNode.position.x + NODE_W / 2;
      const y1 = fromNode.position.y + nodeHeight(fromNode);
      const x2 = toNode.position.x + NODE_W / 2;
      const y2 = toNode.position.y;
      const cy1 = y1 + Math.abs(y2 - y1) * 0.4;
      const cy2 = y2 - Math.abs(y2 - y1) * 0.4;
      return (
        <path
          key={i}
          d={`M ${x1} ${y1} C ${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${y2}`}
          stroke="#94a3b8"
          strokeWidth={2}
          fill="none"
          strokeDasharray={connecting ? '6 4' : undefined}
        />
      );
    });
  };

  // ─── Handle Close ───
  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm('You have unsaved changes. Leave without saving?')) return;
    }
    onClose();
  };

  // ═══════════════════════════
  // RENDER
  // ═══════════════════════════
  return (
    <div className="flex flex-col w-full h-full bg-white overflow-hidden" style={{ fontFamily: "'DM Sans','Inter',sans-serif" }}>
      {/* ─── Top bar ─── */}
      <header className="h-[56px] bg-white border-b border-slate-200 flex items-center justify-between px-5 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={handleClose} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setHasUnsavedChanges(true); }}
            className="text-base font-bold text-slate-800 bg-transparent border-none focus:outline-none w-48"
          />
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-widest ${status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
            {status === 'active' ? 'ACTIVE' : 'DRAFT V1'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold shadow hover:bg-slate-800 transition-colors disabled:opacity-50">
            <Save size={15} /> {saving ? 'Saving…' : 'Save Workflow'}
          </button>
          {status === 'active' ? (
            <button onClick={handleDeactivate} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold shadow hover:bg-red-700 transition-colors">
              <Pause size={15} /> Deactivate
            </button>
          ) : (
            <button onClick={handleActivate} disabled={activating} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold shadow hover:bg-green-700 transition-colors disabled:opacity-50">
              <Play size={15} /> {activating ? 'Activating…' : 'Activate Journey'}
            </button>
          )}
          <div className="w-px h-6 bg-slate-200 mx-1"></div>
          <button onClick={handleClose} title="Exit Builder" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ═══ LEFT PANEL ═══ */}
        <div className="w-[260px] bg-white border-r border-slate-200 p-4 overflow-y-auto shrink-0">
          {/* TRIGGERS */}
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3">Triggers</h4>
          {(['contact_created', 'message_received', 'manual'] as const).map((t) => {
            const m = NODE_META[t];
            const Icon = m.icon;
            return (
              <div
                key={t}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('node-type', t)}
                className="flex items-center gap-3 p-3 mb-2 bg-white border border-slate-200 rounded-xl cursor-grab hover:bg-slate-50 transition-colors shadow-sm"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: m.color + '18' }}>
                  <Icon size={16} style={{ color: m.color }} />
                </div>
                <span className="text-sm font-medium text-slate-700">{m.label}</span>
              </div>
            );
          })}

          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-5 mb-3">Messaging</h4>
          {(['send_template'] as const).map((t) => {
            const m = NODE_META[t];
            const Icon = m.icon;
            return (
              <div
                key={t}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('node-type', t)}
                className="flex items-center gap-3 p-3 mb-2 bg-white border border-slate-200 rounded-xl cursor-grab hover:bg-slate-50 transition-colors shadow-sm"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: m.color + '18' }}>
                  <Icon size={16} style={{ color: m.color }} />
                </div>
                <span className="text-sm font-medium text-slate-700">{m.label}</span>
              </div>
            );
          })}

          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-5 mb-3">Logic</h4>
          {(['time_delay', 'condition_split'] as const).map((t) => {
            const m = NODE_META[t];
            const Icon = m.icon;
            return (
              <div
                key={t}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('node-type', t)}
                className="flex items-center gap-3 p-3 mb-2 bg-white border border-slate-200 rounded-xl cursor-grab hover:bg-slate-50 transition-colors shadow-sm"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: m.color + '18' }}>
                  <Icon size={16} style={{ color: m.color }} />
                </div>
                <span className="text-sm font-medium text-slate-700">{m.label}</span>
              </div>
            );
          })}

          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-5 mb-3">Flow</h4>
          {(['end_journey'] as const).map((t) => {
            const m = NODE_META[t];
            const Icon = m.icon;
            return (
              <div
                key={t}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('node-type', t)}
                className="flex items-center gap-3 p-3 mb-2 bg-white border border-slate-200 rounded-xl cursor-grab hover:bg-slate-50 transition-colors shadow-sm"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: m.color + '18' }}>
                  <Icon size={16} style={{ color: m.color }} />
                </div>
                <span className="text-sm font-medium text-slate-700">{m.label}</span>
              </div>
            );
          })}
        </div>

        {/* ═══ CENTER CANVAS ═══ */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-auto"
          style={{
            backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleCanvasDrop}
          onClick={() => { setSelectedNodeId(null); setConnecting(null); }}
        >
          {/* SVG edge layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: 2000, minHeight: 2000 }}>
            {renderEdges()}
          </svg>

          {/* Node cards */}
          {nodes.map((node) => {
            const meta = NODE_META[node.type] || { label: node.type, color: '#64748b', icon: Zap, category: '' };
            const Icon = meta.icon;
            const isSelected = selectedNodeId === node.id;
            const isConnecting = connecting === node.id;
            return (
              <div
                key={node.id}
                className={`absolute select-none rounded-xl border-2 shadow-md bg-white overflow-hidden transition-shadow cursor-pointer ${
                  isSelected ? 'border-slate-900 shadow-lg' : (node.type === 'end_journey' ? 'border-red-400 hover:shadow-lg' : 'border-slate-200 hover:shadow-lg')
                }`}
                style={{ left: node.position.x, top: node.position.y, width: NODE_W }}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                onClick={(e) => { e.stopPropagation(); setSelectedNodeId(node.id); }}
              >
                {/* Header */}
                <div className="px-3 py-2 flex items-center justify-between" style={{ backgroundColor: meta.color + '14' }}>
                  <div className="flex items-center gap-2">
                    <Icon size={14} style={{ color: meta.color }} />
                    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: meta.color }}>
                      {meta.label}
                    </span>
                  </div>
                  <button
                    className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50"
                    onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                  >
                    <X size={12} />
                  </button>
                </div>
                {/* Body */}
                <div className="px-3 py-2.5">
                  <div className="flex-1 min-w-0 pr-4">
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 truncate">
                      {node.type === 'end_journey' ? 'END' : meta.label}
                    </h5>
                    <p className="text-[11px] text-slate-500 font-medium truncate">{getNodeSummary(node)}</p>
                  </div>
                </div>
                {/* Bottom connector dot */}
                <div className="flex justify-center pb-2">
                  <button
                    className={`w-4 h-4 rounded-full border-2 transition-colors ${
                      isConnecting ? 'bg-green-500 border-green-600' : 'bg-slate-200 border-slate-300 hover:bg-slate-400'
                    }`}
                    onClick={(e) => { e.stopPropagation(); handleConnectorClick(node.id); }}
                    title="Connect to next node"
                  />
                </div>
              </div>
            );
          })}

          {connecting && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg z-50">
              Click another node to connect • Press Escape to cancel
            </div>
          )}
        </div>

        {/* ═══ RIGHT PANEL ═══ */}
        <ConfigPanel
          node={selectedNode}
          onUpdateConfig={updateNodeConfig}
        />
      </div>

      {/* ═══ EXECUTION STATUS PANEL ═══ */}
      {status === 'active' && (
        <div className="shrink-0 border-t border-slate-200 bg-white">
          <div 
            className="px-5 py-2 flex items-center justify-between border-b border-slate-100 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
            onClick={() => setShowStatusPanel(!showStatusPanel)}
          >
            <div className="flex items-center gap-2">
              <Users size={14} className="text-slate-500" />
              <span className="text-xs font-bold text-slate-600">Enrolled Contacts: {executions.length}</span>
            </div>
            <div className="text-slate-400">
              {showStatusPanel ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </div>
          </div>
          
          {showStatusPanel && (
            <div className="max-h-[200px] overflow-y-auto">
              {executions.length === 0 ? (
                <p className="text-xs text-slate-400 p-4 text-center">No contacts currently enrolled in this active journey.</p>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead><tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-4 py-1.5 font-bold text-slate-400">Contact</th>
                    <th className="px-4 py-1.5 font-bold text-slate-400">Phone</th>
                    <th className="px-4 py-1.5 font-bold text-slate-400">Current Step</th>
                    <th className="px-4 py-1.5 font-bold text-slate-400">Status</th>
                    <th className="px-4 py-1.5 font-bold text-slate-400">Last Executed</th>
                  </tr></thead>
                  <tbody>
                    {executions.map((ex: any) => {
                      const lastLog = ex.executionLog?.[ex.executionLog.length - 1];
                      const nodeLabel = nodes.find(n => n.id === ex.currentNodeId);
                      return (
                        <tr key={ex.id} className="border-b border-slate-50">
                          <td className="px-4 py-1.5 font-medium text-slate-700">{ex.contactName || '—'}</td>
                          <td className="px-4 py-1.5 text-slate-500">{ex.contactPhone}</td>
                          <td className="px-4 py-1.5 text-slate-500">{nodeLabel ? (NODE_META[nodeLabel.type]?.label || nodeLabel.type) : ex.currentNodeId}</td>
                          <td className="px-4 py-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              ex.status === 'completed' ? 'bg-green-100 text-green-700' :
                              ex.status === 'running' ? 'bg-blue-100 text-blue-700' :
                              ex.status === 'failed' ? 'bg-red-100 text-red-700' :
                              'bg-slate-100 text-slate-500'
                            }`}>{ex.status}</span>
                          </td>
                          <td className="px-4 py-1.5 text-slate-400">{lastLog ? new Date(lastLog.executedAt).toLocaleTimeString() : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
