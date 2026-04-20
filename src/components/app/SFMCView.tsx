'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Cloud, Download, Settings, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Filter, Calendar, ArrowUpDown, MessageSquare, CircleDot, ExternalLink, Loader2, AlertTriangle, Search, Send, Inbox } from 'lucide-react';

// ─── Types ───
interface SfmcMessage {
  id: string;
  direction: 'sent' | 'received';
  body: string;
  timestamp: string;
  contactKey: string;
  journeyName: string;
  templateName: string;
  status: string;
  source: 'sfmc';
  phone?: string;
  contactName?: string;
  messageType?: string;
  wamid?: string;
  language?: string;
  parameters?: string;
}

// ─── CSS-only Donut Chart ───
function DonutChart({ percentage, color, size = 120, strokeWidth = 12 }: { percentage: number; color: string; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
      />
    </svg>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const map: Record<string, { bg: string; text: string; border: string }> = {
    sent: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    read: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
    failed: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    received: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  };
  const style = map[s] || map.sent;
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${style.bg} ${style.text} ${style.border} capitalize`}>{status}</span>;
}

// ─── CSV Export ───
function exportCSV(rows: SfmcMessage[], filename: string) {
  const headers = ['Contact Key', 'Phone', 'Direction', 'Body', 'Journey', 'Template', 'Status', 'Timestamp'];
  const csv = [headers.join(','), ...rows.map(r =>
    [r.contactKey, r.phone || '', r.direction, `"${(r.body || '').replace(/"/g, '""')}"`, r.journeyName, r.templateName, r.status, r.timestamp].join(',')
  )].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── Main ───
export default function SFMCView() {
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
  const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('7');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allMessages, setAllMessages] = useState<SfmcMessage[]>([]);
  const perPage = 25;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/sfmc/messages');
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch');
      setAllMessages(data.messages || []);
    } catch (err: any) {
      console.error('[SFMC View]', err);
      setError(err.message || 'Unable to load SFMC messages. Check your SFMC connection in Settings.');
      setAllMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Filter logic
  const cutoff = Date.now() - parseInt(dateRange) * 86400000;
  const filtered = useMemo(() => {
    return allMessages.filter(m => {
      if (m.direction !== activeTab) return false;
      if (new Date(m.timestamp).getTime() < cutoff) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (m.contactKey || '').toLowerCase().includes(q) ||
               (m.phone || '').includes(q) ||
               (m.body || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [allMessages, activeTab, cutoff, searchQuery]);

  const sorted = useMemo(() =>
    [...filtered].sort((a, b) => sortAsc
      ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ), [filtered, sortAsc]);

  const paged = sorted.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));

  // Stats from ALL messages (not filtered by tab)
  const sentAll = allMessages.filter(m => m.direction === 'sent');
  const recvAll = allMessages.filter(m => m.direction === 'received');
  const sentInRange = sentAll.filter(m => new Date(m.timestamp).getTime() >= cutoff);
  const recvInRange = recvAll.filter(m => new Date(m.timestamp).getTime() >= cutoff);
  const totalInRange = sentInRange.length + recvInRange.length;
  const delivered = sentInRange.filter(m => ['delivered', 'read'].includes(m.status.toLowerCase())).length;
  const deliveryRate = sentInRange.length > 0 ? Math.round((delivered / sentInRange.length) * 100) : 0;
  const uniqueContacts = new Set([...sentInRange, ...recvInRange].map(m => m.phone || m.contactKey)).size;
  const uniqueTemplates = new Set(sentInRange.map(m => m.templateName).filter(Boolean)).size;

  // Bar chart
  const days = Math.min(parseInt(dateRange), 14);
  const barData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(now); d.setDate(d.getDate() - (days - 1 - i));
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEnd = dayStart + 86400000;
      const msgs = allMessages.filter(m => { const t = new Date(m.timestamp).getTime(); return t >= dayStart && t < dayEnd; });
      return { label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), sent: msgs.filter(m => m.direction === 'sent').length, recv: msgs.filter(m => m.direction === 'received').length };
    });
  }, [allMessages, days]);
  const barMax = Math.max(...barData.map(d => d.sent + d.recv), 1);

  // ─── Error State ───
  if (error && !loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 gap-4 p-8">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">SFMC Connection Error</h3>
        <p className="text-[14px] text-slate-500 max-w-md text-center">{error}</p>
        <button onClick={fetchData} className="px-4 py-2 rounded-lg bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  // ─── Loading ───
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 size={32} className="text-orange-500 animate-spin" />
        <p className="text-sm font-bold text-slate-900">Loading SFMC Data Extensions...</p>
        <p className="text-xs text-slate-500">Fetching WhatsApp_Sent_Messages and WhatsApp_Received_Messages</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 font-sans">
      <div className="max-w-[1280px] mx-auto px-6 py-8">

        {/* ─── Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Cloud size={20} className="text-orange-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">SFMC Journey Analytics</h1>
              <p className="text-[13px] text-slate-500 font-medium">
                {sentAll.length} Sent · {recvAll.length} Received · Last {dateRange} Days
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(['7', '30', '90'] as const).map(r => (
              <button key={r} onClick={() => { setDateRange(r); setPage(0); }}
                className={`px-3.5 py-2 text-[13px] font-bold rounded-lg border transition-all
                  ${dateRange === r ? 'bg-orange-50 text-orange-700 border-orange-200 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
              >{r}D</button>
            ))}
          </div>
        </div>

        {allMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300 max-w-4xl mx-auto mb-8">
            <Cloud size={64} className="mb-6 opacity-30 text-slate-400" />
            <h3 className="text-lg font-bold text-slate-700 mb-2">No data yet</h3>
            <p className="text-sm font-medium text-slate-500 mb-6 max-w-[400px] text-center">
              There are no messages from SFMC Data Extensions yet. We'll automatically pull in new Journey Builder messages once they arrive.
            </p>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold shadow-sm transition-all hover:-translate-y-0.5 bg-orange-500 hover:bg-orange-600"
            >
              <Cloud size={18} /> Refresh Data Extensions
            </button>
          </div>
        ) : (
          <>
            {/* ─── Analytics Panels ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* Panel 1: Delivery Rate */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-5">Delivery Rate</h3>
            <div className="flex items-center gap-6">
              <div className="relative">
                <DonutChart percentage={deliveryRate} color="#10b981" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900">{deliveryRate}%</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-[13px] text-slate-600 font-medium">Delivered <span className="font-bold text-slate-900">{delivered}</span></span></div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /><span className="text-[13px] text-slate-600 font-medium">Sent <span className="font-bold text-slate-900">{sentInRange.length}</span></span></div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-purple-500" /><span className="text-[13px] text-slate-600 font-medium">Replies <span className="font-bold text-slate-900">{recvInRange.length}</span></span></div>
              </div>
            </div>
          </div>

          {/* Panel 2: Reach */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-5">Reach & Templates</h3>
            <div className="flex items-center gap-6">
              <div className="relative">
                <DonutChart percentage={Math.min(uniqueContacts > 0 ? Math.round((uniqueContacts / totalInRange) * 100) : 0, 100)} color="#3b82f6" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900">{uniqueContacts}</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /><span className="text-[13px] text-slate-600 font-medium">Contacts <span className="font-bold text-slate-900">{uniqueContacts}</span></span></div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-orange-500" /><span className="text-[13px] text-slate-600 font-medium">Templates <span className="font-bold text-slate-900">{uniqueTemplates}</span></span></div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-slate-400" /><span className="text-[13px] text-slate-600 font-medium">Total <span className="font-bold text-slate-900">{totalInRange}</span></span></div>
              </div>
            </div>
          </div>

          {/* Panel 3: Activity Bar Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-1">Message Activity</h3>
            <p className="text-[11px] text-slate-400 font-medium mb-4 flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" /> Sent</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400 inline-block" /> Received</span>
            </p>
            <div className="flex items-end gap-[3px] h-[90px]">
              {barData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0 group relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {d.sent}↑ {d.recv}↓
                  </div>
                  <div className="w-full rounded-t-sm bg-purple-400 min-h-0" style={{ height: `${Math.max((d.recv / barMax) * 40, 0)}px` }} />
                  <div className="w-full bg-orange-400 min-h-[1px] rounded-b-sm" style={{ height: `${Math.max((d.sent / barMax) * 40, 1)}px` }} />
                  <span className="text-[7px] text-slate-400 font-medium mt-0.5 truncate max-w-full">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Sub-tabs: Sent / Received ─── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          {/* Tab bar + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              <button onClick={() => { setActiveTab('sent'); setPage(0); }}
                className={`flex items-center gap-2 px-4 py-2 text-[13px] font-bold rounded-md transition-all ${activeTab === 'sent' ? 'bg-white text-orange-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <Send size={14} /> Sent Messages <span className="text-[11px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-bold ml-1">{sentInRange.length}</span>
              </button>
              <button onClick={() => { setActiveTab('received'); setPage(0); }}
                className={`flex items-center gap-2 px-4 py-2 text-[13px] font-bold rounded-md transition-all ${activeTab === 'received' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <Inbox size={14} /> Received Messages <span className="text-[11px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full font-bold ml-1">{recvInRange.length}</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search contact or phone..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage(0); }}
                  className="pl-9 pr-3 py-2 text-[13px] rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 w-56 font-medium" />
              </div>
              <button onClick={() => exportCSV(sorted, `sfmc_${activeTab}_messages.csv`)} className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors" title="Export CSV">
                <Download size={16} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Message Body</th>
                  {activeTab === 'sent' && <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Journey / Template</th>}
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <button onClick={() => setSortAsc(!sortAsc)} className="flex items-center gap-1 hover:text-slate-700"><ArrowUpDown size={12} /> Time</button>
                  </th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr><td colSpan={activeTab === 'sent' ? 6 : 5} className="px-6 py-12 text-center text-slate-400 text-sm font-medium">No {activeTab} messages found in this date range.</td></tr>
                ) : paged.map((rec, idx) => (
                  <React.Fragment key={rec.id + '-' + idx}>
                    <tr className={`border-b border-slate-100 transition-colors cursor-pointer ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-blue-50/40`}
                      onClick={() => setExpandedRow(expandedRow === rec.id ? null : rec.id)}>
                      <td className="px-4 py-3.5">
                        <p className="text-[13px] font-semibold text-slate-900">{rec.contactKey || rec.phone}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{rec.phone}</p>
                      </td>
                      <td className="px-4 py-3.5 text-[13px] text-slate-600 font-medium max-w-[250px] truncate" title={rec.body}>{rec.body || '—'}</td>
                      {activeTab === 'sent' && (
                        <td className="px-4 py-3.5">
                          {rec.templateName && <span className="text-[11px] font-mono bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-100 mr-1">{rec.templateName}</span>}
                          {rec.journeyName && <span className="text-[11px] text-slate-400 font-medium">{rec.journeyName}</span>}
                        </td>
                      )}
                      <td className="px-4 py-3.5"><StatusBadge status={rec.status} /></td>
                      <td className="px-4 py-3.5 text-[12px] text-slate-500 font-medium whitespace-nowrap">
                        {new Date(rec.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-2">{expandedRow === rec.id ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}</td>
                    </tr>
                    {expandedRow === rec.id && (
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <td colSpan={activeTab === 'sent' ? 6 : 5} className="px-6 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[12px]">
                            <div><span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Full Message</span><span className="text-slate-700">{rec.body}</span></div>
                            <div><span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">WA Message ID</span><span className="text-slate-700 font-mono break-all text-[11px]">{rec.wamid || rec.id}</span></div>
                            {rec.journeyName && <div><span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Journey</span><span className="text-slate-700">{rec.journeyName}</span></div>}
                            <div><span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Full Timestamp</span><span className="text-slate-700">{new Date(rec.timestamp).toLocaleString()}</span></div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/50">
            <span className="text-[12px] text-slate-500 font-medium">
              {sorted.length > 0 ? `${page * perPage + 1}–${Math.min((page + 1) * perPage, sorted.length)} of ${sorted.length}` : '0'} records
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={14} /> Previous
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ─── Pipeline Visualizer ─── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
          <h3 className="text-[14px] font-bold text-slate-900 mb-1">SFMC → WhatsApp Pipeline</h3>
          <p className="text-[12px] text-slate-500 font-medium mb-6">Data Extension message flow</p>
          <div className="flex items-center gap-0 overflow-x-auto py-4 px-2">
            {[
              { bg: 'orange', icon: <Cloud size={16} className="text-orange-600" />, title: 'SFMC Journey', sub: 'Journey Builder', val: `${sentAll.length} sent` },
              { bg: 'blue', icon: <MessageSquare size={16} className="text-blue-600" />, title: 'WhatsApp API', sub: 'Meta Graph v25.0', val: `${delivered} delivered` },
              { bg: 'purple', icon: <Inbox size={16} className="text-purple-600" />, title: 'Replies', sub: 'Received_Messages DE', val: `${recvAll.length} replies` },
              { bg: 'emerald', icon: <CircleDot size={16} className="text-emerald-600" />, title: 'MongoDB', sub: 'Messages collection', val: `${allMessages.length} total` },
            ].map((node, i, arr) => (
              <React.Fragment key={node.title}>
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-40 bg-${node.bg}-50 border-2 border-${node.bg}-200 rounded-xl p-4 text-center`}
                    style={{ backgroundColor: `var(--${node.bg}, ${node.bg === 'orange' ? '#fff7ed' : node.bg === 'blue' ? '#eff6ff' : node.bg === 'purple' ? '#faf5ff' : '#ecfdf5'})`, borderColor: node.bg === 'orange' ? '#fed7aa' : node.bg === 'blue' ? '#bfdbfe' : node.bg === 'purple' ? '#e9d5ff' : '#a7f3d0' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: node.bg === 'orange' ? '#ffedd5' : node.bg === 'blue' ? '#dbeafe' : node.bg === 'purple' ? '#f3e8ff' : '#d1fae5' }}>
                      {node.icon}
                    </div>
                    <p className="text-[12px] font-bold text-slate-900">{node.title}</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{node.sub}</p>
                    <p className="text-[11px] font-bold mt-1" style={{ color: node.bg === 'orange' ? '#c2410c' : node.bg === 'blue' ? '#1d4ed8' : node.bg === 'purple' ? '#7e22ce' : '#047857' }}>{node.val}</p>
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <div className="flex items-center px-2 shrink-0">
                    <div className="w-10 h-0.5 bg-slate-300" />
                    <div className="w-0 h-0 border-t-4 border-b-4 border-l-[6px] border-l-slate-300 border-t-transparent border-b-transparent" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
