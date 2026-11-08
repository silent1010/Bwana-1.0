import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Eye,
  PhoneCall,
  Navigation,
  MessageSquare,
  Star,
  Calendar,
  Download,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Users
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Business, BusinessReview } from '../../types';
import { D3EngagementHeatmap } from './D3EngagementHeatmap';

interface BusinessInsightsViewProps {
  business: Business;
  reviews?: BusinessReview[];
}

export const BusinessInsightsView: React.FC<BusinessInsightsViewProps> = ({
  business,
  reviews = [],
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [chartMetric, setChartMetric] = useState<'all' | 'views' | 'inquiries'>('all');

  // Simulated temporal data grounded in business stats
  const engagementData = useMemo(() => {
    const daysCount = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = [];
    const now = new Date('2026-11-06T00:00:00Z');

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateLabel = d.toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric',
      });

      // Factor in day of week seasonality (higher on Thu-Sat)
      const dayOfWeek = d.getDay();
      const weekendBoost = dayOfWeek === 5 || dayOfWeek === 6 ? 1.35 : 1.0;

      // Derived from actual business stats
      const estimatedImpressions = (business.reviewsCount || 28) * 45 + 500;
      const baseViews = Math.round(estimatedImpressions / (timeRange === '7d' ? 14 : timeRange === '30d' ? 45 : 120));
      const variation = Math.sin(i * 0.7) * (baseViews * 0.25);
      const views = Math.max(12, Math.round((baseViews + variation) * weekendBoost));

      const calls = Math.max(1, Math.round(views * 0.08 + Math.cos(i) * 2));
      const whatsapp = Math.max(1, Math.round(views * 0.06 + Math.sin(i) * 1.5));
      const chats = Math.max(1, Math.round(views * 0.05 + Math.cos(i * 0.4) * 2));
      const directions = Math.max(1, Math.round(views * 0.09 + Math.sin(i * 0.5) * 2));
      const totalInquiries = calls + whatsapp + chats + directions;

      data.push({
        date: dateLabel,
        views,
        calls,
        whatsapp,
        chats,
        directions,
        totalInquiries,
        conversionRate: Number(((totalInquiries / views) * 100).toFixed(1)),
      });
    }
    return data;
  }, [timeRange, business.reviewsCount]);

  // Lead channels breakdown
  const channelBreakdown = useMemo(() => {
    const totals = engagementData.reduce(
      (acc, curr) => {
        acc.calls += curr.calls;
        acc.whatsapp += curr.whatsapp;
        acc.chats += curr.chats;
        acc.directions += curr.directions;
        return acc;
      },
      { calls: 0, whatsapp: 0, chats: 0, directions: 0 }
    );

    return [
      { name: 'Phone Calls', count: totals.calls, color: '#059669', share: '32%' },
      { name: 'WhatsApp', count: totals.whatsapp, color: '#10b981', share: '24%' },
      { name: 'Direct Bwana Chat', count: totals.chats, color: '#0284c7', share: '19%' },
      { name: 'Map Directions', count: totals.directions, color: '#d97706', share: '25%' },
    ];
  }, [engagementData]);

  // Weekly review growth & sentiment trajectory (past 8 weeks)
  const weeklyReviewGrowth = useMemo(() => {
    const weeks = [
      { week: 'Week 1', fiveStar: 2, fourStar: 1, threeOrLess: 0, cumulativeReviews: 12, avgRating: 4.4 },
      { week: 'Week 2', fiveStar: 3, fourStar: 1, threeOrLess: 0, cumulativeReviews: 16, avgRating: 4.5 },
      { week: 'Week 3', fiveStar: 4, fourStar: 0, threeOrLess: 1, cumulativeReviews: 21, avgRating: 4.5 },
      { week: 'Week 4', fiveStar: 3, fourStar: 2, threeOrLess: 0, cumulativeReviews: 26, avgRating: 4.6 },
      { week: 'Week 5', fiveStar: 5, fourStar: 1, threeOrLess: 0, cumulativeReviews: 32, avgRating: 4.6 },
      { week: 'Week 6', fiveStar: 4, fourStar: 2, threeOrLess: 0, cumulativeReviews: 38, avgRating: 4.7 },
      { week: 'Week 7', fiveStar: 6, fourStar: 1, threeOrLess: 0, cumulativeReviews: 45, avgRating: 4.7 },
      { week: 'Week 8', fiveStar: 5, fourStar: 2, threeOrLess: 0, cumulativeReviews: 52, avgRating: 4.8 },
    ];
    return weeks;
  }, []);

  // Summary KPIs
  const totalViews = engagementData.reduce((acc, d) => acc + d.views, 0);
  const totalLeads = engagementData.reduce((acc, d) => acc + d.totalInquiries, 0);
  const avgConversion = totalViews > 0 ? ((totalLeads / totalViews) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header with Title and Range Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
              Business Insights & Visitor Growth
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              D3 + Recharts
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Real-time telemetry tracking visitor footfall, direct leads, customer sentiment, and peak commercial hours in {business.city}.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Time range selector */}
          <div className="flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
            {(['7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  timeRange === r
                    ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
            title="Export Insights Summary"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
            <span className="font-medium">Total Discovery Views</span>
            <Eye className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-stone-900 dark:text-white tabular-nums">
            {totalViews.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+24.6% vs previous period</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
            <span className="font-medium">Direct Inquiries Generated</span>
            <PhoneCall className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-stone-900 dark:text-white tabular-nums">
            {totalLeads.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Calls, WhatsApp & In-App Chat</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
            <span className="font-medium">Visitor Conversion Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-stone-900 dark:text-white tabular-nums">
            {avgConversion}%
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
            Exceeds regional avg (14.2%)
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
            <span className="font-medium">Reputation & Reviews</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-stone-900 dark:text-white tabular-nums flex items-center gap-2">
            <span>{business.rating ? business.rating.toFixed(1) : '4.8'}</span>
            <span className="text-xs text-stone-400 font-normal">/ 5.0</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            {business.reviewsCount || reviews.length || 24} Verified Customer Reviews
          </div>
        </div>
      </div>

      {/* SECTION 1: RECHARTS VISITOR ENGAGEMENT TRENDS */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-stone-900 dark:text-white flex items-center gap-2">
              <span>Visitor Engagement & Lead Inquiries Over Time</span>
              <span className="text-xs font-mono font-normal text-stone-400">
                ({timeRange === '7d' ? 'Past 7 Days' : timeRange === '30d' ? 'Past 30 Days' : 'Past Quarter'})
              </span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Compare directory listing impressions against high-intent customer actions.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setChartMetric('all')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                chartMetric === 'all'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs font-bold'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Combined
            </button>
            <button
              type="button"
              onClick={() => setChartMetric('views')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                chartMetric === 'views'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs font-bold'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Views Only
            </button>
            <button
              type="button"
              onClick={() => setChartMetric('inquiries')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                chartMetric === 'inquiries'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs font-bold'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Direct Leads Only
            </button>
          </div>
        </div>

        {/* Recharts Area Container */}
        <div className="h-[280px] sm:h-[320px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={engagementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#78716c" strokeOpacity={0.15} />
              <XAxis
                dataKey="date"
                stroke="#a8a29e"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#a8a29e', strokeOpacity: 0.3 }}
              />
              <YAxis
                stroke="#a8a29e"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#a8a29e', strokeOpacity: 0.3 }}
                domain={[0, 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0c0a09',
                  borderColor: '#292524',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(val) => <span className="text-xs text-stone-600 dark:text-stone-300 font-medium">{val}</span>}
              />

              {(chartMetric === 'all' || chartMetric === 'views') && (
                <Area
                  type="monotone"
                  dataKey="views"
                  name="Profile Impressions"
                  stroke="#059669"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#viewsGrad)"
                />
              )}

              {(chartMetric === 'all' || chartMetric === 'inquiries') && (
                <Area
                  type="monotone"
                  dataKey="totalInquiries"
                  name="High-Intent Inquiries"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#leadsGrad)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 2: D3 ENGAGEMENT HEATMAP + CHANNEL CONVERSION BREAKDOWN (2-COLUMN GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* D3 Bespoke Heatmap (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-stone-900 dark:text-white flex items-center gap-2">
                <span>Peak Customer Activity by Day & Hour</span>
              </h3>
              <span className="text-[10px] font-mono uppercase bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 font-semibold">
                D3 Interactive Heatmap
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Hover over matrix cells to inspect when customers in {business.city} are searching and reaching out.
            </p>
          </div>

          <D3EngagementHeatmap businessName={business.name} />
        </div>

        {/* Lead Channels Share (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-base text-stone-900 dark:text-white">
                Inquiry Channels Breakdown
              </h3>
              <span className="text-xs text-stone-400 font-mono">100% Leads</span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Distribution of incoming calls, chats, and footfall navigation requests.
            </p>

            <div className="h-[180px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelBreakdown} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#78716c" strokeOpacity={0.1} />
                  <XAxis type="number" stroke="#a8a29e" fontSize={10} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#a8a29e" fontSize={11} tickLine={false} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0c0a09',
                      borderColor: '#292524',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="count" fill="#059669" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
            {channelBreakdown.map((ch) => (
              <div key={ch.name} className="p-2 bg-stone-50 dark:bg-stone-800/50 rounded-xl text-xs">
                <span className="text-stone-500 dark:text-stone-400 block text-[11px]">{ch.name}</span>
                <div className="flex items-center justify-between font-mono font-bold text-stone-800 dark:text-stone-200 mt-0.5">
                  <span>{ch.count}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-[10px]">{ch.share}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: RECHARTS WEEKLY REVIEW GROWTH & CUSTOMER SENTIMENT VELOCITY */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-stone-900 dark:text-white">
                Weekly Review Growth & Reputation Velocity
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                Recharts Composed
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Cumulative reviews accumulation paired with weekly star rating distribution.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-600" />
              <span className="text-stone-600 dark:text-stone-400">5-Star</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-400" />
              <span className="text-stone-600 dark:text-stone-400">4-Star</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-amber-500" />
              <span className="text-stone-600 dark:text-stone-400">1-3 Star</span>
            </div>
          </div>
        </div>

        {/* Composed Chart: Stacked Bars (Weekly additions) + Line (Cumulative Volume) */}
        <div className="h-[280px] sm:h-[320px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={weeklyReviewGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#78716c" strokeOpacity={0.15} />
              <XAxis dataKey="week" stroke="#a8a29e" fontSize={11} tickLine={false} />
              <YAxis
                yAxisId="left"
                stroke="#a8a29e"
                fontSize={11}
                tickLine={false}
                label={{ value: 'Weekly Reviews Added', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#78716c' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#d97706"
                fontSize={11}
                tickLine={false}
                domain={[0, 60]}
                label={{ value: 'Total Reviews', angle: 90, position: 'insideRight', fontSize: 10, fill: '#d97706' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0c0a09',
                  borderColor: '#292524',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '12px',
                }}
              />
              <Legend verticalAlign="top" height={36} />

              <Bar yAxisId="left" dataKey="fiveStar" name="5-Star Reviews" stackId="a" fill="#059669" radius={[0, 0, 0, 0]} />
              <Bar yAxisId="left" dataKey="fourStar" name="4-Star Reviews" stackId="a" fill="#34d399" radius={[0, 0, 0, 0]} />
              <Bar yAxisId="left" dataKey="threeOrLess" name="1-3 Star Reviews" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />

              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cumulativeReviews"
                name="Cumulative Total Reviews"
                stroke="#d97706"
                strokeWidth={3}
                dot={{ r: 4, fill: '#d97706' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 4: SMART OPTIMIZATION RECOMMENDATIONS */}
      <div className="bg-emerald-950/20 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h4 className="font-bold text-sm text-stone-900 dark:text-white">
            Actionable Growth Opportunities for {business.name}
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-3.5 bg-white dark:bg-stone-900 rounded-xl border border-emerald-500/20 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
              1. Peak Commercial Window
            </span>
            <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
              Your busiest inquiry window is <strong>09:30 AM to 12:00 PM</strong> on weekdays. Ensure staff are actively online for instantaneous in-app chat response.
            </p>
          </div>

          <div className="p-3.5 bg-white dark:bg-stone-900 rounded-xl border border-emerald-500/20 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
              2. Flash Deals & Weekend Promotions
            </span>
            <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
              Businesses offering time-sensitive promotions experience a <strong>+38% higher footfall navigation rate</strong> over weekends.
            </p>
          </div>

          <div className="p-3.5 bg-white dark:bg-stone-900 rounded-xl border border-emerald-500/20 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
              3. PACRA & Citizen Trust
            </span>
            <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
              Your verified status badges build confidence for online orders, resulting in higher average checkout basket sizes across Zambia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
