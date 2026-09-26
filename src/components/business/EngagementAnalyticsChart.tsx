import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  LineChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  PhoneCall,
  MessageSquare,
  Eye,
  TrendingUp,
  Percent,
  Calendar,
  Sparkles,
  Info,
  CheckCircle2,
  ArrowUpRight,
  Clock
} from 'lucide-react';

export interface DailyEngagementRecord {
  date: string;       // e.g. "Aug 28"
  fullDate: string;   // e.g. "2026-08-28"
  day: string;        // e.g. "Fri"
  views: number;      // Visitor Profile Views
  calls: number;      // 'Call' Button Clicks
  whatsapp: number;   // 'WhatsApp' Button Clicks
  totalLeads: number; // calls + whatsapp
  ctr: number;        // (totalLeads / views) * 100
  callCtr: number;    // (calls / views) * 100
  whatsappCtr: number;// (whatsapp / views) * 100
}

// Generate realistic 90 days of Zambian business metrics ending on September 26, 2026
function createNinetyDayEngagementData(): DailyEngagementRecord[] {
  const endDate = new Date(2026, 8, 26); // September 26, 2026
  const records: DailyEngagementRecord[] = [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 89; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);

    const dayName = daysOfWeek[d.getDay()];
    const monthName = monthNames[d.getMonth()];
    const dayOfMonth = d.getDate();
    const dateStr = `${monthName} ${dayOfMonth.toString().padStart(2, '0')}`;
    const fullDate = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${dayOfMonth.toString().padStart(2, '0')}`;

    // Quarterly growth progression from late June to late September
    const progress = (89 - i) / 89; // 0 (day 0, Jun 29) to 1 (day 89, Sep 26)
    const baseViews = 118 + Math.round(progress * 70); // Baseline views increase from 118 to 188

    // Weekly cycle: Friday/Saturday mining & contractor restocking surge; Sunday lower
    const isFriSat = dayName === 'Fri' || dayName === 'Sat';
    const isSunday = dayName === 'Sun';
    const dayFactor = isFriSat ? 1.28 : isSunday ? 0.68 : 1.0;

    // Harmonic variation
    const noise = Math.sin(i * 1.5) * 14 + Math.cos(i * 0.8) * 9;
    const views = Math.max(75, Math.round(baseViews * dayFactor + noise));

    // Conversion rate dynamics (Fri/Sat higher CTR from ready buyers)
    const baseCtr = isFriSat ? 12.6 : isSunday ? 8.8 : 10.1;
    const ctrNoise = Math.sin(i * 0.6) * 1.1;
    const actualCtr = Math.max(7.2, Math.min(15.2, Number((baseCtr + ctrNoise).toFixed(1))));

    const totalLeads = Math.round((views * actualCtr) / 100);
    // Voice calls ~58% of urgent contacts, WhatsApp ~42%
    const calls = Math.round(totalLeads * 0.58);
    const whatsapp = Math.max(1, totalLeads - calls);

    const callCtr = Number(((calls / views) * 100).toFixed(1));
    const whatsappCtr = Number(((whatsapp / views) * 100).toFixed(1));
    const finalCtr = Number(((totalLeads / views) * 100).toFixed(1));

    records.push({
      date: dateStr,
      fullDate,
      day: dayName,
      views,
      calls,
      whatsapp,
      totalLeads,
      ctr: finalCtr,
      callCtr,
      whatsappCtr,
    });
  }

  return records;
}

export const NINETY_DAY_ENGAGEMENT_DATA = createNinetyDayEngagementData();
export const THIRTY_DAY_ENGAGEMENT_DATA = NINETY_DAY_ENGAGEMENT_DATA.slice(-30);

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number | string;
    color?: string;
    dataKey?: string;
  }>;
  label?: string;
  activePeriodLabel?: string;
}

const EngagementTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, activePeriodLabel = '30 Days' }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-stone-900 text-white p-3 rounded-xl border border-stone-700 shadow-xl text-xs space-y-2 min-w-[210px]">
      <div className="flex items-center justify-between border-b border-stone-800 pb-1.5 font-semibold text-stone-300">
        <span>{label}</span>
        <span className="text-[10px] text-stone-400 font-mono">{activePeriodLabel}</span>
      </div>
      <div className="space-y-1">
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color || '#10b981' }}
              />
              <span className="text-stone-300 text-[11px]">{entry.name}</span>
            </div>
            <span className="font-mono font-bold text-white text-[12px]">
              {typeof entry.value === 'number' && entry.name.includes('CTR')
                ? `${entry.value.toFixed(1)}%`
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export interface EngagementAnalyticsChartProps {
  compact?: boolean;
  initialPeriod?: '30d' | '90d';
}

export const EngagementAnalyticsChart: React.FC<EngagementAnalyticsChartProps> = ({
  compact = false,
  initialPeriod = '30d'
}) => {
  const [chartMode, setChartMode] = useState<'combined' | 'ctr' | 'leads'>('combined');
  const [timePeriod, setTimePeriod] = useState<'30d' | '90d'>(initialPeriod);
  const [subFilter, setSubFilter] = useState<'all' | '7d' | '14d'>('all');

  // Filter dataset by chosen duration
  const data = useMemo(() => {
    if (timePeriod === '90d') {
      return NINETY_DAY_ENGAGEMENT_DATA;
    }
    // '30d' mode with optional sub-filters
    if (subFilter === '7d') return NINETY_DAY_ENGAGEMENT_DATA.slice(-7);
    if (subFilter === '14d') return NINETY_DAY_ENGAGEMENT_DATA.slice(-14);
    return THIRTY_DAY_ENGAGEMENT_DATA;
  }, [timePeriod, subFilter]);

  // Aggregated totals
  const totals = useMemo(() => {
    const totalViews = data.reduce((acc, curr) => acc + curr.views, 0);
    const totalCalls = data.reduce((acc, curr) => acc + curr.calls, 0);
    const totalWhatsapp = data.reduce((acc, curr) => acc + curr.whatsapp, 0);
    const totalLeads = totalCalls + totalWhatsapp;
    const avgCtr = totalViews > 0 ? (totalLeads / totalViews) * 100 : 0;
    const callCtr = totalViews > 0 ? (totalCalls / totalViews) * 100 : 0;
    const whatsappCtr = totalViews > 0 ? (totalWhatsapp / totalViews) * 100 : 0;

    return {
      totalViews,
      totalCalls,
      totalWhatsapp,
      totalLeads,
      avgCtr: avgCtr.toFixed(1),
      callCtr: callCtr.toFixed(1),
      whatsappCtr: whatsappCtr.toFixed(1),
    };
  }, [data]);

  const dateRangeLabel = useMemo(() => {
    if (timePeriod === '90d') return 'Jun 29 – Sep 26, 2026 (Last 90 Days)';
    if (subFilter === '7d') return 'Sep 20 – Sep 26, 2026 (Last 7 Days)';
    if (subFilter === '14d') return 'Sep 13 – Sep 26, 2026 (Last 14 Days)';
    return 'Aug 28 – Sep 26, 2026 (Last 30 Days)';
  }, [timePeriod, subFilter]);

  // Mini compact view (embedded in top dashboard banner)
  if (compact) {
    return (
      <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Lead Conversion & CTR Trend
            </h4>
            <span className="text-[10px] text-stone-400 font-mono">
              ({timePeriod === '90d' ? '90 Days' : '30 Days'})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* 30D vs 90D Toggle */}
            <div className="flex items-center bg-stone-950 p-0.5 rounded-lg border border-stone-800 text-[11px]">
              <button
                type="button"
                onClick={() => setTimePeriod('30d')}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                  timePeriod === '30d'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Last 30 Days
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimePeriod('90d');
                  setSubFilter('all');
                }}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                  timePeriod === '90d'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Last 90 Days
              </button>
            </div>

            <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              CTR: {totals.avgCtr}%
            </span>
          </div>
        </div>

        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="miniViewsGradCompact" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <Tooltip
                content={<EngagementTooltip activePeriodLabel={timePeriod === '90d' ? '90-Day Trend' : '30-Day Trend'} />}
              />
              <Area
                type="monotone"
                dataKey="views"
                name="Profile Views"
                stroke="#10b981"
                strokeWidth={1.8}
                fillOpacity={1}
                fill="url(#miniViewsGradCompact)"
              />
              <Line
                type="monotone"
                dataKey="totalLeads"
                name="Total Leads (Call+WA)"
                stroke="#34d399"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-stone-800">
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-stone-950/70 rounded border border-stone-800/80">
            <span className="text-stone-400 text-[11px] flex items-center gap-1">
              <Eye className="w-3 h-3 text-stone-300" /> Views
            </span>
            <span className="font-mono font-bold text-white text-xs">{totals.totalViews.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-stone-950/70 rounded border border-stone-800/80">
            <span className="text-stone-400 text-[11px] flex items-center gap-1">
              <PhoneCall className="w-3 h-3 text-emerald-400" /> Calls
            </span>
            <span className="font-mono font-bold text-emerald-400 text-xs">{totals.totalCalls} ({totals.callCtr}%)</span>
          </div>
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-stone-950/70 rounded border border-stone-800/80">
            <span className="text-stone-400 text-[11px] flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-teal-400" /> WhatsApp
            </span>
            <span className="font-mono font-bold text-teal-400 text-xs">{totals.totalWhatsapp} ({totals.whatsappCtr}%)</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-2xs space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
              Recharts Analytics Engine
            </span>
            <span className="text-xs text-stone-400">·</span>
            <span className="text-xs text-stone-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              {dateRangeLabel}
            </span>
          </div>
          <h3 className="text-lg font-bold font-display text-stone-900 mt-1">
            Visitor Engagement & Lead Conversion Trends
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Compare visitor profile traffic against customer actions on <strong>'Call'</strong> and <strong>'WhatsApp'</strong> direct buttons.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Primary Timeframe Switcher: Last 30 Days vs Last 90 Days */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setTimePeriod('30d');
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                timePeriod === '30d'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Last 30 Days</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTimePeriod('90d');
                setSubFilter('all');
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                timePeriod === '90d'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Last 90 Days</span>
            </button>
          </div>

          {/* Granular Sub-filter if in 30-Day view */}
          {timePeriod === '30d' && (
            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
              <button
                type="button"
                onClick={() => setSubFilter('7d')}
                className={`px-2 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  subFilter === '7d' ? 'bg-emerald-600 text-white' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                7D
              </button>
              <button
                type="button"
                onClick={() => setSubFilter('14d')}
                className={`px-2 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  subFilter === '14d' ? 'bg-emerald-600 text-white' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                14D
              </button>
              <button
                type="button"
                onClick={() => setSubFilter('all')}
                className={`px-2 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  subFilter === 'all' ? 'bg-emerald-600 text-white' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                30D
              </button>
            </div>
          )}

          {/* Chart Display Mode Switcher */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
            <button
              type="button"
              onClick={() => setChartMode('combined')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                chartMode === 'combined'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Profile Views & Conversion CTR (%)"
            >
              Dual Axis (Views & CTR)
            </button>
            <button
              type="button"
              onClick={() => setChartMode('ctr')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                chartMode === 'ctr'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Call CTR vs WhatsApp CTR"
            >
              CTR Comparison (%)
            </button>
            <button
              type="button"
              onClick={() => setChartMode('leads')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                chartMode === 'leads'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Direct Lead Action Volumes"
            >
              Call vs WhatsApp Counts
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
          <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-stone-600" /> Total Views
            </span>
            <span className="text-[10px] text-stone-400 font-mono">
              {timePeriod === '90d' ? '90 Days' : subFilter === 'all' ? '30 Days' : subFilter}
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-stone-900">
            {totals.totalViews.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" />
            <span>Avg {Math.round(totals.totalViews / data.length)} / day</span>
          </div>
        </div>

        <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80">
          <div className="flex items-center justify-between text-emerald-800 text-xs mb-1">
            <span className="flex items-center gap-1.5 font-semibold">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" /> Phone Calls
            </span>
            <span className="text-[10px] text-emerald-700 font-mono font-bold">
              {totals.callCtr}% CTR
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-950">
            {totals.totalCalls.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
            Voice contacts placed
          </div>
        </div>

        <div className="p-3.5 bg-teal-50/70 rounded-xl border border-teal-200/80">
          <div className="flex items-center justify-between text-teal-800 text-xs mb-1">
            <span className="flex items-center gap-1.5 font-semibold">
              <MessageSquare className="w-3.5 h-3.5 text-teal-600" /> WhatsApp Leads
            </span>
            <span className="text-[10px] text-teal-700 font-mono font-bold">
              {totals.whatsappCtr}% CTR
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-teal-950">
            {totals.totalWhatsapp.toLocaleString()}
          </div>
          <div className="text-[11px] text-teal-700 font-medium mt-0.5">
            Chats & quotation threads
          </div>
        </div>

        <div className="p-3.5 bg-stone-900 text-white rounded-xl border border-stone-800">
          <div className="flex items-center justify-between text-stone-300 text-xs mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Percent className="w-3.5 h-3.5 text-emerald-400" /> Combined CTR
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">Lead Rate</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
            {totals.avgCtr}%
          </div>
          <div className="text-[11px] text-stone-400 font-medium mt-0.5">
            {totals.totalLeads.toLocaleString()} total inquiries
          </div>
        </div>
      </div>

      {/* Main Interactive Recharts Display */}
      <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-700">
              {chartMode === 'combined' && `Profile Views (Left Y-Axis) vs Click-Through Rate % (Right Y-Axis) · ${timePeriod === '90d' ? '90 Days' : '30 Days'}`}
              {chartMode === 'ctr' && `Call CTR (%) vs WhatsApp CTR (%) vs Total Lead CTR (%) · ${timePeriod === '90d' ? '90 Days' : '30 Days'}`}
              {chartMode === 'leads' && `Daily Action Inquiries (Call Clicks vs WhatsApp Clicks) · ${timePeriod === '90d' ? '90 Days' : '30 Days'}`}
            </span>
          </div>
          <div className="text-stone-400 text-[11px]">
            {timePeriod === '90d' ? 'Showing 90 days continuous trend (weekly intervals)' : 'Hover data points for exact daily metrics'}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'combined' ? (
              <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="viewsGradientFull" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                  interval={timePeriod === '90d' ? 6 : data.length > 20 ? 2 : 0}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                  label={{ value: 'Views', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#9ca3af' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 20]}
                  unit="%"
                  tick={{ fontSize: 10, fill: '#10b981' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                  label={{ value: 'CTR %', angle: 90, position: 'insideRight', fontSize: 10, fill: '#10b981' }}
                />
                <Tooltip
                  content={<EngagementTooltip activePeriodLabel={timePeriod === '90d' ? '90-Day Trend' : '30-Day Trend'} />}
                />
                <Legend
                  verticalAlign="top"
                  height={32}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '0px' }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="views"
                  name="Profile Views"
                  fill="url(#viewsGradientFull)"
                  stroke="#3b82f6"
                  strokeWidth={timePeriod === '90d' ? 1.5 : 2}
                />
                <Bar
                  yAxisId="left"
                  dataKey="calls"
                  name="Calls Placed"
                  fill="#10b981"
                  radius={[2, 2, 0, 0]}
                  barSize={timePeriod === '90d' ? 5 : 12}
                />
                <Bar
                  yAxisId="left"
                  dataKey="whatsapp"
                  name="WhatsApp Inquiries"
                  fill="#0d9488"
                  radius={[2, 2, 0, 0]}
                  barSize={timePeriod === '90d' ? 5 : 12}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="ctr"
                  name="Lead CTR (%)"
                  stroke="#f59e0b"
                  strokeWidth={timePeriod === '90d' ? 2 : 2.5}
                  dot={timePeriod === '90d' ? false : { r: 2.5, fill: '#f59e0b' }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            ) : chartMode === 'ctr' ? (
              <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                  interval={timePeriod === '90d' ? 6 : data.length > 20 ? 2 : 0}
                />
                <YAxis
                  domain={[0, 18]}
                  unit="%"
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip
                  content={<EngagementTooltip activePeriodLabel={timePeriod === '90d' ? '90-Day Trend' : '30-Day Trend'} />}
                />
                <Legend
                  verticalAlign="top"
                  height={32}
                  wrapperStyle={{ fontSize: '11px' }}
                />
                <Line
                  type="monotone"
                  dataKey="callCtr"
                  name="Call CTR (%)"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={timePeriod === '90d' ? false : { r: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="whatsappCtr"
                  name="WhatsApp CTR (%)"
                  stroke="#0d9488"
                  strokeWidth={2}
                  dot={timePeriod === '90d' ? false : { r: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="ctr"
                  name="Combined Lead CTR (%)"
                  stroke="#f59e0b"
                  strokeWidth={timePeriod === '90d' ? 2.5 : 3}
                  dot={timePeriod === '90d' ? false : { r: 3 }}
                />
              </LineChart>
            ) : (
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="callsGradFull" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="waGradFull" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                  interval={timePeriod === '90d' ? 6 : data.length > 20 ? 2 : 0}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip
                  content={<EngagementTooltip activePeriodLabel={timePeriod === '90d' ? '90-Day Trend' : '30-Day Trend'} />}
                />
                <Legend
                  verticalAlign="top"
                  height={32}
                  wrapperStyle={{ fontSize: '11px' }}
                />
                <Area
                  type="monotone"
                  dataKey="calls"
                  name="Direct Phone Calls"
                  stroke="#10b981"
                  strokeWidth={timePeriod === '90d' ? 1.5 : 2}
                  fillOpacity={1}
                  fill="url(#callsGradFull)"
                />
                <Area
                  type="monotone"
                  dataKey="whatsapp"
                  name="WhatsApp Threads"
                  stroke="#0d9488"
                  strokeWidth={timePeriod === '90d' ? 1.5 : 2}
                  fillOpacity={1}
                  fill="url(#waGradFull)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Behavioral Insights & Conversion Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-stone-200 text-xs">
        <div className="p-3 bg-stone-50 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-stone-900">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{timePeriod === '90d' ? '90-Day Growth Trend' : 'Peak Conversion Days'}</span>
          </div>
          <p className="text-stone-600 leading-relaxed">
            {timePeriod === '90d'
              ? 'Monthly visitor volume grew by +42% over the quarter (from ~120/day in July to ~210/day in September) as your Bwana verification status took effect.'
              : 'Fridays and Saturdays drive the highest CTR (13.0%–13.8%). Contractors in Kitwe and Ndola place pre-weekend restocking orders.'}
          </p>
        </div>

        <div className="p-3 bg-emerald-50 rounded-xl space-y-1 border border-emerald-100">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>'Call' vs 'WhatsApp' Balance</span>
          </div>
          <p className="text-emerald-800 leading-relaxed">
            Across {timePeriod === '90d' ? 'the full 90-day quarter' : 'the last 30 days'}, calls generated <strong>{totals.callCtr}% CTR</strong> and WhatsApp generated <strong>{totals.whatsappCtr}% CTR</strong>, maintaining a healthy 60/40 lead channel mix.
          </p>
        </div>

        <div className="p-3 bg-stone-50 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-stone-900">
            <Info className="w-3.5 h-3.5 text-stone-600" />
            <span>Regional Merchant Standing</span>
          </div>
          <p className="text-stone-600 leading-relaxed">
            Your {totals.avgCtr}% conversion rate places ABC Hardware in the <strong>top 5%</strong> of Copperbelt construction merchants on the Bwana platform.
          </p>
        </div>
      </div>
    </div>
  );
};
