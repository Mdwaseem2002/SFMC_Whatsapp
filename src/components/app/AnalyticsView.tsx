'use client';

// src/components/app/AnalyticsView.tsx
// Premium analytics dashboard with Recharts — Delivery gauge, Read rate bars, Engagement funnel,
// Campaign data table, and engagement metric cards. Light WhatsApp-green theme.

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/components/workspace/WorkspaceProvider';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, Filter, Calendar, ChevronDown, RefreshCw,
  ArrowUpRight, ArrowDownRight, Eye, MousePointerClick, DollarSign
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

// ─── Demo Data ───
const CAMPAIGNS = [
  { name: 'Campaign Rate', deliveryRate: '98,350', readRate: '65%', engagement: '22.5%' },
  { name: 'Spring Sale', deliveryRate: '98,350', readRate: '66%', engagement: '22.5%' },
  { name: 'Atphonostio', deliveryRate: '98,350', readRate: '35%', engagement: '22.5%' },
  { name: 'Festival Offer', deliveryRate: '76,200', readRate: '72%', engagement: '31.2%' },
  { name: 'Welcome Flow', deliveryRate: '45,100', readRate: '81%', engagement: '28.7%' },
];

const READ_RATE_DATA = [
  { month: 'Jan', readRate: 72, benchmark: 55 },
  { month: 'Feb', readRate: 85, benchmark: 58 },
  { month: 'Mar', readRate: 90, benchmark: 60 },
  { month: 'Apr', readRate: 65, benchmark: 57 },
  { month: 'May', readRate: 78, benchmark: 62 },
];

const FUNNEL_DATA = [
  { name: 'Sent', value: 100, percent: '68.2%', drop: '35.5%' },
  { name: 'Delivered', value: 82, percent: '18.3%', drop: '20.3%' },
  { name: 'Read', value: 58, percent: '13.1%', drop: '13.0%' },
  { name: 'Engaged', value: 35, percent: '22%', drop: '4.0%' },
];

const ENGAGEMENT_METRICS = [
  { label: 'Read rate', value: '206.97', icon: Eye, trend: '+12.3%', up: true },
  { label: 'Engagement rate', value: '205.95', icon: MousePointerClick, trend: '+8.1%', up: true },
  { label: 'Revenue impact', value: '27.00', icon: DollarSign, trend: '-2.4%', up: false },
];

const FUNNEL_COLORS = ['#25D366', '#3DDC84', '#7AE8A5', '#B0F0C8'];

// ─── Gauge Chart (Custom SVG) ───
function GaugeChart({ value }: { value: number }) {
  const radius = 80;
  const strokeWidth = 14;
  const center = 100;
  // Semi-circle: 180 to 360 degrees
  const startAngle = 180;
  const endAngle = 360;
  const totalAngle = endAngle - startAngle;
  const valueAngle = startAngle + (value / 100) * totalAngle;

  const polarToCartesian = (angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad),
    };
  };

  const describeArc = (start: number, end: number) => {
    const s = polarToCartesian(start);
    const e = polarToCartesian(end);
    const largeArcFlag = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${e.x} ${e.y}`;
  };

  // Needle position
  const needleAngle = startAngle + (value / 100) * totalAngle;
  const needleEnd = polarToCartesian(needleAngle);
  const needleLength = radius - 20;
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleTip = {
    x: center + needleLength * Math.cos(needleRad),
    y: center + needleLength * Math.sin(needleRad),
  };

  return (
    <svg viewBox="0 0 200 130" className="w-full max-w-[220px] mx-auto">
      {/* Background track */}
      <path
        d={describeArc(startAngle, endAngle)}
        fill="none"
        stroke="#E5E7EB"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Value arc */}
      <path
        d={describeArc(startAngle, Math.min(valueAngle, endAngle - 0.5))}
        fill="none"
        stroke="url(#gaugeGradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className="transition-all duration-1000"
      />
      {/* Gradient */}
      <defs>
        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="30%" stopColor="#f59e0b" />
          <stop offset="60%" stopColor="#25D366" />
          <stop offset="100%" stopColor="#128C7E" />
        </linearGradient>
      </defs>
      {/* Needle */}
      <line
        x1={center}
        y1={center}
        x2={needleTip.x}
        y2={needleTip.y}
        stroke="#1f2937"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx={center} cy={center} r="5" fill="#1f2937" />
      {/* Labels */}
      <text x="25" y="115" className="text-[11px] fill-gray-400" textAnchor="middle">0</text>
      <text x="100" y="30" className="text-[10px] fill-gray-400" textAnchor="middle"></text>
      <text x="175" y="115" className="text-[11px] fill-gray-400" textAnchor="middle">100%</text>
    </svg>
  );
}

// ─── Custom Funnel (CSS) ───
function FunnelChart({ data }: { data: typeof FUNNEL_DATA }) {
  const maxVal = data[0].value;
  return (
    <div className="flex flex-col gap-2">
      {data.map((step, i) => {
        const widthPercent = Math.max(30, (step.value / maxVal) * 100);
        return (
          <div key={step.name} className="flex items-center gap-3 group">
            <div className="flex-1 flex justify-center">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${widthPercent}%` }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
                className="h-10 rounded-lg flex items-center justify-center text-white text-[13px] font-bold relative overflow-hidden"
                style={{ background: FUNNEL_COLORS[i] }}
              >
                <span className="relative z-10">{step.percent}</span>
              </motion.div>
            </div>
            <div className="w-16 text-right shrink-0">
              <span className="text-[12px] font-semibold text-gray-500">{step.drop}</span>
            </div>
          </div>
        );
      })}
      <div className="flex items-center gap-3 mt-1 px-2">
        {data.map((step, i) => (
          <div key={step.name} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: FUNNEL_COLORS[i] }} />
            <span className="text-[10px] text-gray-500 font-medium">{step.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Custom Tooltip ───
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3">
        <p className="text-[12px] font-bold text-gray-900 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-[12px] text-gray-600">
            <span className="inline-block w-2 h-2 rounded-sm mr-1.5" style={{ background: p.color }} />
            {p.name}: <span className="font-bold text-gray-900">{p.value}%</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Main Component ───
export default function AnalyticsView() {
  const { activeWorkspace } = useWorkspace();
  const [mounted, setMounted] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState('All campaigns');

  useEffect(() => { setMounted(true); }, []);

  if (!activeWorkspace) return null;

  const fadeIn = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-6 lg:p-8" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <div className="max-w-[1400px] mx-auto">

        {/* ─── Header ─── */}
        <motion.div {...fadeIn} className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-7 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Live Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Real-time campaign analytics for <span className="font-semibold text-[#25D366]">{activeWorkspace.name}</span></p>
          </div>
          <div className="flex items-center gap-3">
            {/* Campaign Filter */}
            <div className="relative">
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-9 text-[13px] font-medium text-gray-700 focus:outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/10 cursor-pointer"
              >
                <option>All campaigns</option>
                {CAMPAIGNS.map(c => <option key={c.name}>{c.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {/* Date */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] font-medium text-gray-700">
              <Calendar size={14} className="text-gray-400" />
              <span>All time</span>
            </div>
          </div>
        </motion.div>

        {/* ─── Top Row: 3 Metric Cards ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

          {/* A. Delivery Rate Gauge */}
          <motion.div
            {...fadeIn}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-[15px] font-bold text-gray-900 mb-4">Delivery rate</h3>
            {mounted && <GaugeChart value={98} />}
            <div className="text-center mt-2">
              <span className="text-3xl font-extrabold text-gray-900">98%</span>
              <p className="text-[13px] text-gray-500 font-medium mt-1">Delivery Rate</p>
            </div>
          </motion.div>

          {/* B. Read Rate Bar Chart */}
          <motion.div
            {...fadeIn}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-[15px] font-bold text-gray-900 mb-4">Read rate</h3>
            {mounted && (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={READ_RATE_DATA} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    domain={[0, 100]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="readRate" name="Read Rate" fill="#25D366" radius={[6, 6, 0, 0]} barSize={24} />
                  <Bar dataKey="benchmark" name="Benchmark" fill="#D1FAE5" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
            <div className="flex items-center gap-4 mt-2 justify-center">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#25D366]" /> Read Rate
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#D1FAE5]" /> Benchmark
              </span>
            </div>
          </motion.div>

          {/* C. Engagement Funnel */}
          <motion.div
            {...fadeIn}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-[15px] font-bold text-gray-900 mb-4">Engagement funnel</h3>
            {mounted && <FunnelChart data={FUNNEL_DATA} />}
          </motion.div>
        </div>

        {/* ─── Bottom Row: Table + Engagement Metrics ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Campaign Data Table (3 cols) */}
          <motion.div
            {...fadeIn}
            transition={{ delay: 0.4 }}
            className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-[15px] font-bold text-gray-900">Campaign Data</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="text-left px-6 py-3 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Delivery Rate</th>
                    <th className="text-left px-6 py-3 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Read Rate</th>
                    <th className="text-left px-6 py-3 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Engagement</th>
                  </tr>
                </thead>
                <tbody>
                  {CAMPAIGNS.map((campaign, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-50 last:border-0 hover:bg-[#25D366]/[0.02] transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <span className="text-[14px] font-semibold text-gray-900 group-hover:text-[#25D366] transition-colors">
                          {campaign.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[14px] text-gray-700 font-medium">{campaign.deliveryRate}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#25D366] transition-all duration-700"
                              style={{ width: campaign.readRate }}
                            />
                          </div>
                          <span className="text-[13px] font-semibold text-gray-700">{campaign.readRate}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[13px] font-bold text-[#25D366] bg-[#25D366]/[0.06] px-2.5 py-1 rounded-lg">
                          {campaign.engagement}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Engagement Metrics (2 cols) */}
          <motion.div
            {...fadeIn}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 space-y-4"
          >
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-[15px] font-bold text-gray-900 mb-4">Engagement Rate</h3>
              <div className="space-y-4">
                {ENGAGEMENT_METRICS.map((metric, i) => {
                  const Icon = metric.icon;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/80 border border-gray-100 hover:border-[#25D366]/20 hover:bg-[#25D366]/[0.02] transition-all cursor-default group"
                    >
                      <div className="w-11 h-11 rounded-xl bg-[#25D366]/[0.08] flex items-center justify-center shrink-0 group-hover:bg-[#25D366]/[0.12] transition-colors">
                        <Icon size={20} className="text-[#25D366]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">{metric.label}</p>
                        <p className="text-xl font-bold text-gray-900 mt-0.5">{metric.value}</p>
                      </div>
                      <div className={`flex items-center gap-1 text-[12px] font-bold px-2.5 py-1 rounded-lg shrink-0
                        ${metric.up ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'}
                      `}>
                        {metric.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {metric.trend}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <p className="text-2xl font-extrabold text-[#25D366]">4.2K</p>
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mt-1">Total Sent</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <p className="text-2xl font-extrabold text-gray-900">89%</p>
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mt-1">Avg Open</p>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
