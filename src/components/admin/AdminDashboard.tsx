import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  XCircle,
  FileCheck,
  Users,
  Building2,
  Briefcase,
  Star,
  AlertTriangle,
  History,
  Settings,
  Filter,
  Eye,
  Search,
  ExternalLink,
  PhoneCall,
  MessageSquare,
  FileText,
  BadgeCheck,
  Check,
  RefreshCw,
  Building,
  TrendingUp,
  BarChart3,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart
} from 'recharts';
import { VerificationRequest, AuditLogEntry, Business } from '../../types';

interface AdminDashboardProps {
  businesses: Business[];
  verifications: VerificationRequest[];
  auditLogs: AuditLogEntry[];
  onApproveVerification: (requestId: string, businessId: string) => void;
  onRejectVerification: (requestId: string, reason: string) => void;
  onNavigateToBusiness?: (businessId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  businesses,
  verifications,
  auditLogs,
  onApproveVerification,
  onRejectVerification,
  onNavigateToBusiness,
}) => {
  const [activeTab, setActiveTab] = useState<'verifications' | 'audit_logs' | 'overview'>('verifications');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerId, setSelectedVerId] = useState<string>(verifications[0]?.id || '');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [previewDocTab, setPreviewDocTab] = useState<'pacra' | 'tpin' | 'storefront'>('pacra');

  // Simulated live registry cross-checks
  const [pacraCheckStatus, setPacraCheckStatus] = useState<Record<string, 'unverified' | 'checking' | 'verified'>>({});
  const [tpinCheckStatus, setTpinCheckStatus] = useState<Record<string, 'unverified' | 'checking' | 'verified'>>({});

  // Filtered applications
  const filteredVerifications = useMemo(() => {
    return verifications.filter((v) => {
      const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
      const matchesSearch =
        v.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.pacraRegistrationNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.tpinNumber.includes(searchQuery);
      return matchesStatus && matchesSearch;
    });
  }, [verifications, statusFilter, searchQuery]);

  const selectedVer = useMemo(() => {
    return verifications.find((v) => v.id === selectedVerId) || filteredVerifications[0] || verifications[0] || null;
  }, [verifications, selectedVerId, filteredVerifications]);

  const associatedBusiness = useMemo(() => {
    if (!selectedVer) return null;
    return businesses.find((b) => b.id === selectedVer.businessId) || null;
  }, [businesses, selectedVer]);

  // Platform metrics from PRD section 19
  const platformStats = {
    users: 124892,
    businesses: businesses.length,
    professionals: 6832,
    reviews: 92421,
    reports: 1283,
    pendingVerification: verifications.filter((v) => v.status === 'pending').length,
    verifiedBusinesses: businesses.filter((b) => b.verificationStatus === 'verified').length,
  };

  // Trend of new business registrations over the last 30 days based on the audit logs
  const registrationTrendData = useMemo(() => {
    // Reference base time: 2026-09-29
    const referenceDate = new Date('2026-09-29T12:00:00Z');
    const dayMap = new Map<string, number>();

    // Initialize all 30 days up to the reference date
    for (let i = 29; i >= 0; i--) {
      const d = new Date(referenceDate);
      d.setUTCDate(d.getUTCDate() - i);
      const isoDate = d.toISOString().slice(0, 10); // YYYY-MM-DD
      dayMap.set(isoDate, 0);
    }

    // Filter audit logs for business registration events
    auditLogs.forEach((log) => {
      const isRegAction =
        log.action === 'BUSINESS_REGISTERED_PENDING_VERIFICATION' ||
        log.action === 'BUSINESS_REGISTERED' ||
        log.action === 'BUSINESS_CREATED' ||
        (log.targetEntity === 'Business' &&
          (log.action.includes('REGISTER') || log.details.toLowerCase().includes('new registration')));

      if (isRegAction && log.timestamp) {
        // Formats: '2026-09-29 09:42:15' or ISO '2026-09-29T...'
        const logDateStr = log.timestamp.slice(0, 10);
        if (dayMap.has(logDateStr)) {
          dayMap.set(logDateStr, (dayMap.get(logDateStr) || 0) + 1);
        }
      }
    });

    let cumulativeTotal = 0;
    const result: { date: string; displayDate: string; registrations: number; cumulative: number }[] = [];

    dayMap.forEach((count, dateStr) => {
      cumulativeTotal += count;
      const parts = dateStr.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const dayNum = parseInt(parts[2], 10);
      const displayDate = `${monthNames[monthIdx] || ''} ${dayNum}`;

      result.push({
        date: dateStr,
        displayDate,
        registrations: count,
        cumulative: cumulativeTotal,
      });
    });

    return result;
  }, [auditLogs]);

  // Total registrations captured in 30 days
  const totalNewRegistrations30Days = useMemo(() => {
    return registrationTrendData.reduce((acc, curr) => acc + curr.registrations, 0);
  }, [registrationTrendData]);

  // Peak daily registrations in 30 days
  const peakRegistrations = useMemo(() => {
    return Math.max(...registrationTrendData.map((d) => d.registrations), 0);
  }, [registrationTrendData]);

  const handleRunPacraCheck = (reqId: string) => {
    setPacraCheckStatus((prev) => ({ ...prev, [reqId]: 'checking' }));
    setTimeout(() => {
      setPacraCheckStatus((prev) => ({ ...prev, [reqId]: 'verified' }));
    }, 600);
  };

  const handleRunTpinCheck = (reqId: string) => {
    setTpinCheckStatus((prev) => ({ ...prev, [reqId]: 'checking' }));
    setTimeout(() => {
      setTpinCheckStatus((prev) => ({ ...prev, [reqId]: 'verified' }));
    }, 600);
  };

  const handleApprove = (req: VerificationRequest) => {
    onApproveVerification(req.id, req.businessId);
  };

  const handleConfirmReject = () => {
    if (!selectedVer) return;
    onRejectVerification(selectedVer.id, rejectReason || 'Documentation requires revision');
    setShowRejectModal(false);
    setRejectReason('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Admin Header */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 mb-8 border border-stone-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-amber-400 bg-amber-950 px-2.5 py-0.5 rounded border border-amber-800 font-semibold">
                BWANA ADMIN ENGINE · ZAMBIA
              </span>
              <span className="text-xs text-stone-400">·</span>
              <span className="text-xs text-stone-300">Statutory Verification & Oversight Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight mt-1">
              Platform Administration & Business Verification
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mt-1 leading-relaxed">
              Verify company registrations, review PACRA certificates & ZRA TPINs, award official Verified Badges (✓), and audit all platform actions.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="p-3 bg-amber-950/80 border border-amber-700/60 rounded-2xl text-center">
              <div className="text-[10px] text-amber-300 uppercase tracking-wider font-semibold">Action Required</div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                {platformStats.pendingVerification} Applications Pending
              </div>
            </div>
          </div>
        </div>

        {/* PRD Section 19: Stat counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-8 pt-6 border-t border-stone-800 text-center">
          <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800/80">
            <div className="text-[11px] text-stone-400">Registered Users</div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {platformStats.users.toLocaleString()}
            </div>
          </div>
          <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800/80">
            <div className="text-[11px] text-stone-400">Active Businesses</div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {platformStats.businesses.toLocaleString()}
            </div>
          </div>
          <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800/80">
            <div className="text-[11px] text-stone-400">Verified Badges (✓)</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
              {platformStats.verifiedBusinesses.toLocaleString()}
            </div>
          </div>
          <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800/80">
            <div className="text-[11px] text-stone-400">Independent Pros</div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {platformStats.professionals.toLocaleString()}
            </div>
          </div>
          <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800/80">
            <div className="text-[11px] text-stone-400">Total Reviews</div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {platformStats.reviews.toLocaleString()}
            </div>
          </div>
          <div className="p-3 bg-stone-950/60 rounded-xl border border-amber-900/60">
            <div className="text-[11px] text-amber-300">Pending Review</div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">
              {platformStats.pendingVerification}
            </div>
          </div>
        </div>
      </div>

      {/* 30-Day Business Registration Trend Chart (Recharts) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-2xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200/80">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-stone-900 tracking-tight">
                New Business Registrations (Last 30 Days)
              </h2>
              <span className="text-[10px] font-mono font-semibold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                Live Audit Logs
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Daily registration intake captured from statutory PACRA & ZRA verification queue logs
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-stone-500">30d Total:</span>
              <span className="font-bold text-stone-900 text-sm">{totalNewRegistrations30Days}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-stone-500">Peak Day:</span>
              <span className="font-bold text-rose-600 text-sm">{peakRegistrations}</span>
            </div>
          </div>
        </div>

        {/* Recharts Line Chart Container */}
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={registrationTrendData}
              margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="regGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="displayDate"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                interval="preserveStartEnd"
                minTickGap={20}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-stone-900 text-white text-xs p-3 rounded-xl shadow-xl border border-stone-700 space-y-1">
                        <div className="font-mono text-stone-400 text-[10px] pb-1 border-b border-stone-800">
                          {data.date} ({label})
                        </div>
                        <div className="flex items-center justify-between gap-4 pt-1">
                          <span className="text-stone-300">Daily Registrations:</span>
                          <span className="font-bold text-rose-400 font-mono text-sm">
                            {data.registrations}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-[11px] text-stone-400">
                          <span>Cumulative:</span>
                          <span className="font-mono text-stone-300 font-medium">
                            {data.cumulative}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="registrations"
                stroke="#e11d48"
                strokeWidth={2.5}
                dot={{ r: 2.5, fill: '#e11d48', strokeWidth: 1, stroke: '#fff' }}
                activeDot={{ r: 5, fill: '#e11d48', stroke: '#fff', strokeWidth: 2 }}
                name="Registrations"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between text-[11px] text-stone-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
            <span>Daily Statutory Registration Submissions (PACRA/ZRA verification queue)</span>
          </div>
          <span className="font-mono text-stone-400">
            Source: audit_logs (BUSINESS_REGISTERED_PENDING_VERIFICATION)
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3 mb-6">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'verifications'
              ? 'bg-stone-900 text-white shadow-2xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Verification Queue ({verifications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit_logs')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'audit_logs'
              ? 'bg-stone-900 text-white shadow-2xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Compliance Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* VERIFICATIONS TAB (PRD Section 9 & 19) */}
      {activeTab === 'verifications' && (
        <div className="space-y-6">
          {/* Controls bar: Search & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-stone-50 px-3 py-2 rounded-xl border border-stone-200 text-xs">
              <Search className="w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search by business name, applicant, or PACRA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent focus:outline-none text-stone-800 placeholder-stone-400 text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-stone-500 font-medium mr-1">Status:</span>
              {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-medium capitalize transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-stone-900 text-white font-bold'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {st === 'pending' ? 'Pending Review' : st}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Verification Requests List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500 px-1">
                <span className="font-bold uppercase tracking-wider text-[10px] text-stone-400">
                  Applications ({filteredVerifications.length})
                </span>
                <span>Select to inspect dossier</span>
              </div>

              <div className="space-y-2.5">
                {filteredVerifications.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-xs text-stone-500">
                    No applications match the current filter.
                  </div>
                ) : (
                  filteredVerifications.map((req) => (
                    <div
                      key={req.id}
                      onClick={() => setSelectedVerId(req.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        selectedVer?.id === req.id
                          ? 'bg-emerald-50/70 border-emerald-500 shadow-2xs ring-1 ring-emerald-500'
                          : 'bg-white border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-stone-900 text-xs leading-snug">
                            {req.businessName}
                          </h4>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            Applicant: <strong>{req.applicantName}</strong>
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold shrink-0 ${
                            req.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800 ring-1 ring-amber-300'
                          }`}
                        >
                          {req.status === 'pending' ? 'Pending' : req.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-stone-400 mt-2 flex items-center justify-between font-mono">
                        <span>{req.pacraRegistrationNo}</span>
                        <span>{req.submittedAt}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right 2 Columns: Application Dossier & Approval Controls */}
            {selectedVer && (
              <div className="lg:col-span-2 bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
                {/* Header & Approval Controls */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-stone-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-stone-400">Ref: {selectedVer.id}</span>
                      <span className="text-stone-300">·</span>
                      <span
                        className={`text-xs font-bold uppercase ${
                          selectedVer.status === 'approved'
                            ? 'text-emerald-700'
                            : selectedVer.status === 'rejected'
                            ? 'text-rose-700'
                            : 'text-amber-700'
                        }`}
                      >
                        Status: {selectedVer.status.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold font-display text-stone-900 mt-1 flex items-center gap-2">
                      <span>{selectedVer.businessName}</span>
                      {selectedVer.status === 'approved' && (
                        <span className="text-emerald-600 text-lg font-bold" title="Official Verified Badge">
                          ✓
                        </span>
                      )}
                    </h3>
                    {associatedBusiness && (
                      <p className="text-xs text-stone-500 mt-0.5">
                        {associatedBusiness.area}, {associatedBusiness.city} ({associatedBusiness.province}) · Category: {associatedBusiness.categoryName}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {selectedVer.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => setShowRejectModal(true)}
                          className="px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Reject / Revise
                        </button>
                        <button
                          onClick={() => handleApprove(selectedVer)}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve & Grant Verified Badge ✓</span>
                        </button>
                      </>
                    ) : selectedVer.status === 'approved' ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Officially Verified on Bwana Discovery</span>
                        </span>
                        {onNavigateToBusiness && associatedBusiness && (
                          <button
                            onClick={() => onNavigateToBusiness(associatedBusiness.id)}
                            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                        Application Rejected
                      </span>
                    )}
                  </div>
                </div>

                {/* Statutory Cross-Verification Simulation Tools */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Zambian Statutory Cross-Verification Engines</span>
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">Live API Link</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* PACRA e-Services Cross-check */}
                    <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-stone-900">PACRA Registry Database</span>
                        {pacraCheckStatus[selectedVer.id] === 'verified' || selectedVer.status === 'approved' ? (
                          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            MATCH: ACTIVE
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-stone-400">e-Registry</span>
                        )}
                      </div>
                      <div className="text-stone-600 text-[11px] font-mono">
                        {selectedVer.pacraRegistrationNo}
                      </div>

                      {pacraCheckStatus[selectedVer.id] === 'verified' || selectedVer.status === 'approved' ? (
                        <div className="text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded-lg border border-emerald-100 space-y-0.5">
                          <div className="font-semibold">✓ PACRA Status: Active Company</div>
                          <div className="text-stone-600">Incorporation Date: 12-Nov-2021</div>
                          <div className="text-stone-600">Director: {selectedVer.applicantName}</div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRunPacraCheck(selectedVer.id)}
                          disabled={pacraCheckStatus[selectedVer.id] === 'checking'}
                          className="w-full py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${pacraCheckStatus[selectedVer.id] === 'checking' ? 'animate-spin' : ''}`} />
                          <span>{pacraCheckStatus[selectedVer.id] === 'checking' ? 'Querying PACRA API...' : 'Run PACRA e-Registry Check'}</span>
                        </button>
                      )}
                    </div>

                    {/* ZRA Tax Compliance Cross-check */}
                    <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-stone-900">ZRA Tax Compliance (TPIN)</span>
                        {tpinCheckStatus[selectedVer.id] === 'verified' || selectedVer.status === 'approved' ? (
                          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            TPIN: COMPLIANT
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-stone-400">Domestic Taxes</span>
                        )}
                      </div>
                      <div className="text-stone-600 text-[11px] font-mono">
                        {selectedVer.tpinNumber}
                      </div>

                      {tpinCheckStatus[selectedVer.id] === 'verified' || selectedVer.status === 'approved' ? (
                        <div className="text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded-lg border border-emerald-100 space-y-0.5">
                          <div className="font-semibold">✓ ZRA Status: Registered Taxpayer</div>
                          <div className="text-stone-600">Tax Clearance: Valid for 2026 Fiscal Year</div>
                          <div className="text-stone-600">Trading Name Matches PACRA record</div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRunTpinCheck(selectedVer.id)}
                          disabled={tpinCheckStatus[selectedVer.id] === 'checking'}
                          className="w-full py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${tpinCheckStatus[selectedVer.id] === 'checking' ? 'animate-spin' : ''}`} />
                          <span>{tpinCheckStatus[selectedVer.id] === 'checking' ? 'Checking ZRA TPIN...' : 'Run ZRA Tax Compliance Check'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Applicant & Representative Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-stone-50 rounded-2xl space-y-1.5 border border-stone-200">
                    <div className="text-[10px] uppercase font-bold text-stone-400">Authorized Representative</div>
                    <div className="font-bold text-stone-900 text-sm">{selectedVer.applicantName}</div>
                    <div className="text-stone-600 flex items-center gap-1">
                      <PhoneCall className="w-3.5 h-3.5 text-stone-400" />
                      <span>{selectedVer.applicantPhone}</span>
                    </div>
                    <div className="text-stone-600 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
                      <span>{selectedVer.applicantEmail}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-stone-50 rounded-2xl space-y-1.5 border border-stone-200">
                    <div className="text-[10px] uppercase font-bold text-stone-400">Trading Entity Location</div>
                    <div className="font-bold text-stone-900 text-sm">
                      {associatedBusiness ? associatedBusiness.address : 'Physical Location On File'}
                    </div>
                    <div className="text-stone-600">
                      {associatedBusiness ? `${associatedBusiness.area}, ${associatedBusiness.city} (${associatedBusiness.province})` : 'Zambia'}
                    </div>
                    <div className="text-stone-400 font-mono text-[11px]">
                      GPS: {associatedBusiness?.coordinates.latitude}, {associatedBusiness?.coordinates.longitude}
                    </div>
                  </div>
                </div>

                {/* Document Evidence Viewer */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                      Statutory Evidence Preview
                    </h4>
                    <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs">
                      <button
                        onClick={() => setPreviewDocTab('pacra')}
                        className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                          previewDocTab === 'pacra' ? 'bg-stone-900 text-white' : 'text-stone-600'
                        }`}
                      >
                        PACRA Certificate
                      </button>
                      <button
                        onClick={() => setPreviewDocTab('tpin')}
                        className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                          previewDocTab === 'tpin' ? 'bg-stone-900 text-white' : 'text-stone-600'
                        }`}
                      >
                        ZRA Tax Clearance
                      </button>
                      <button
                        onClick={() => setPreviewDocTab('storefront')}
                        className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                          previewDocTab === 'storefront' ? 'bg-stone-900 text-white' : 'text-stone-600'
                        }`}
                      >
                        Storefront Photo
                      </button>
                    </div>
                  </div>

                  {/* Document preview canvas */}
                  <div className="p-6 bg-stone-50 border border-stone-200 rounded-2xl text-xs min-h-[160px] flex flex-col justify-center">
                    {previewDocTab === 'pacra' && (
                      <div className="bg-white p-5 rounded-xl border border-stone-300 shadow-2xs space-y-3 font-mono">
                        <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                          <div className="text-xs font-bold text-stone-900">
                            REPUBLIC OF ZAMBIA · PATENTS AND COMPANIES REGISTRATION AGENCY
                          </div>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                            VALIDATED
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-700">
                          <div>Company: <strong>{selectedVer.businessName}</strong></div>
                          <div>Registration No: <strong>{selectedVer.pacraRegistrationNo}</strong></div>
                          <div>Incorporation Type: <strong>Private Limited by Shares</strong></div>
                          <div>Registered Representative: <strong>{selectedVer.applicantName}</strong></div>
                        </div>
                      </div>
                    )}

                    {previewDocTab === 'tpin' && (
                      <div className="bg-white p-5 rounded-xl border border-stone-300 shadow-2xs space-y-3 font-mono">
                        <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                          <div className="text-xs font-bold text-stone-900">
                            ZAMBIA REVENUE AUTHORITY · TAXPAYER IDENTIFICATION CERTIFICATE
                          </div>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                            TAX CLEARANCE ACTIVE
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-700">
                          <div>Taxpayer: <strong>{selectedVer.businessName}</strong></div>
                          <div>TPIN No: <strong>{selectedVer.tpinNumber}</strong></div>
                          <div>Tax Centre: <strong>Kitwe / Copperbelt Domestic Tax Station</strong></div>
                          <div>Compliance Status: <strong>Fully Current / Good Standing</strong></div>
                        </div>
                      </div>
                    )}

                    {previewDocTab === 'storefront' && (
                      <div className="bg-white p-4 rounded-xl border border-stone-300 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-stone-800">Physical Storefront Signage & Facility</span>
                          <span className="text-[10px] text-stone-500 font-mono">GPS Verified</span>
                        </div>
                        <div className="h-32 bg-stone-200 rounded-lg overflow-hidden relative">
                          <img
                            src={associatedBusiness?.coverImage || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80'}
                            alt="Facility"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-2 left-2 bg-stone-900/80 text-white px-2 py-0.5 rounded text-[10px] font-mono">
                            {associatedBusiness?.address || 'Kitwe, Zambia'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Audit trail notes */}
                {selectedVer.notes && (
                  <div className="p-4 bg-stone-100 rounded-2xl text-xs text-stone-700 space-y-1">
                    <div className="font-semibold text-stone-900">Audit & Submission Notes:</div>
                    <p>{selectedVer.notes}</p>
                    {selectedVer.reviewedBy && (
                      <div className="text-[11px] text-stone-500 pt-2 border-t border-stone-200 mt-2">
                        Audited by: <strong>{selectedVer.reviewedBy}</strong> on {selectedVer.reviewedAt}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AUDIT LOGS TAB (PRD Section 19) */}
      {activeTab === 'audit_logs' && (
        <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-2xs">
          <div className="p-5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xs text-stone-900 uppercase tracking-wider">
                Immutable Platform Verification Audit Trail
              </h3>
              <p className="text-[11px] text-stone-500">
                Permanent system log of all merchant registration approvals, badge grants, and compliance events.
              </p>
            </div>
            <span className="text-xs text-stone-500 font-mono bg-stone-200/60 px-2.5 py-1 rounded-lg">
              PostgreSQL audit_logs
            </span>
          </div>

          <div className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-stone-50 transition-colors text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                    <span className="text-stone-400">·</span>
                    <span className="text-stone-700 font-semibold">{log.actor}</span>
                    <span className="text-stone-400">({log.role})</span>
                  </div>
                  <span className="font-mono text-stone-400 text-[11px]">{log.timestamp}</span>
                </div>
                <p className="text-stone-600 mt-1.5">{log.details}</p>
                <div className="text-[11px] text-stone-400 mt-1 font-mono">
                  Target: {log.targetEntity} #{log.targetId} · Host: {log.ipAddress}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-stone-200 space-y-4 shadow-xl">
            <h4 className="text-base font-bold text-stone-900">
              Reject / Request Documentation Revision
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Select or provide a specific reason for rejection to send to the business applicant.
            </p>

            <div className="space-y-1.5">
              {[
                'PACRA certificate name mismatch with trading name',
                'ZRA TPIN tax clearance expired or inactive',
                'Storefront photo unverified or address does not match plot',
                'Applicant does not appear on official PACRA company registry',
              ].map((reason, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setRejectReason(reason)}
                  className="w-full text-left text-xs p-2 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 cursor-pointer"
                >
                  {reason}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              placeholder="Or enter custom revision instructions for the applicant..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-rose-500"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Confirm Rejection & Notify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
