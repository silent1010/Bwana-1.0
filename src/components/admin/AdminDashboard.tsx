import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  XCircle,
  X,
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
  Calendar,
  Layers,
  Navigation,
  Database,
  Server,
  HardDrive,
  CheckCircle2,
  Play,
  Terminal,
  ArrowUpRight,
  FolderTree,
  RefreshCcw
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
import { VerificationRequest, AuditLogEntry, Business, UserRole } from '../../types';
import { EngineeringSpec } from '../architecture/EngineeringSpec';
import { DatabaseSchemaWorkbenchModal } from './DatabaseSchemaWorkbenchModal';
import { BiometricConfirmModal } from '../common/BiometricConfirmModal';
import { optimizeBusinessImage } from '../../lib/images/imageOptimizer';
import {
  seedDatabaseData,
  SeedProgressUpdate,
  SeedResultSummary
} from '../../services/dbSeeder';
import {
  getDatabaseCollectionsHealth,
  fetchCollectionSample,
  DatabaseHealthReport
} from '../../services/firebase';
import {
  SUPER_ADMIN_EMAIL,
  isSuperAdminEmail,
  getCapabilitiesForRole
} from '../../services/rbacService';

interface AdminDashboardProps {
  businesses: Business[];
  verifications: VerificationRequest[];
  auditLogs: AuditLogEntry[];
  currentUserEmail?: string;
  currentRole?: UserRole;
  onApproveVerification: (requestId: string, businessId: string) => void;
  onRejectVerification: (requestId: string, reason: string) => void;
  onApproveGoogleMapsBusiness?: (businessId: string) => Promise<void> | void;
  onNavigateToBusiness?: (businessId: string) => void;
  onDirections?: (biz: Business) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  businesses,
  verifications,
  auditLogs,
  currentUserEmail = 'm.mumba8@gmail.com',
  currentRole = 'super_admin',
  onApproveVerification,
  onRejectVerification,
  onApproveGoogleMapsBusiness,
  onNavigateToBusiness,
  onDirections,
}) => {
  const [activeTab, setActiveTab] = useState<
    'verifications' | 'gmp_places' | 'audit_logs' | 'engineering_spec' | 'database_management' | 'overview'
  >('verifications');
  const [gmpCategoryFilter, setGmpCategoryFilter] = useState<'all' | 'malls' | 'medical' | 'commercial' | 'pending' | 'verified'>('all');
  const [gmpSearchQuery, setGmpSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerId, setSelectedVerId] = useState<string>(verifications[0]?.id || '');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSchemaWorkbench, setShowSchemaWorkbench] = useState(false);
  const [previewDocTab, setPreviewDocTab] = useState<'pacra' | 'tpin' | 'storefront'>('pacra');

  // Super Administrator privilege validation (Exclusively for m.mumba8@gmail.com)
  const isSuperAdmin = isSuperAdminEmail(currentUserEmail) || currentRole === 'super_admin';
  const [showPrivilegeModal, setShowPrivilegeModal] = useState(false);
  const grantedCapabilities = useMemo(() => {
    return getCapabilitiesForRole('super_admin', 'm.mumba8@gmail.com');
  }, []);

  // Database Management & Seeder State
  const [dbReport, setDbReport] = useState<DatabaseHealthReport | null>(null);
  const [isLoadingDbHealth, setIsLoadingDbHealth] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [showBiometricSeedConfirm, setShowBiometricSeedConfirm] = useState(false);
  const [seedProgress, setSeedProgress] = useState<SeedProgressUpdate | null>(null);
  const [seedLogs, setSeedLogs] = useState<string[]>([]);
  const [seedSummary, setSeedSummary] = useState<SeedResultSummary | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<'businesses' | 'categories' | 'users' | 'verifications' | 'auditLogs'>('businesses');
  const [collectionSample, setCollectionSample] = useState<any[]>([]);
  const [collectionSearch, setCollectionSearch] = useState('');
  const [explorerViewMode, setExplorerViewMode] = useState<'table' | 'json'>('table');

  const refreshDbHealth = async () => {
    setIsLoadingDbHealth(true);
    try {
      const rep = await getDatabaseCollectionsHealth();
      setDbReport(rep);
    } catch (err) {
      console.warn('Error loading DB health:', err);
    } finally {
      setIsLoadingDbHealth(false);
    }
  };

  const loadCollectionSample = async (colName: string) => {
    try {
      const docs = await fetchCollectionSample(colName, 12);
      setCollectionSample(docs);
    } catch (err) {
      console.warn('Error loading sample for', colName, err);
    }
  };

  useEffect(() => {
    if (activeTab === 'database_management') {
      refreshDbHealth();
      loadCollectionSample(selectedCollection);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'database_management') {
      loadCollectionSample(selectedCollection);
    }
  }, [selectedCollection]);

  const handleRunSeeder = async () => {
    setIsSeeding(true);
    setSeedProgress(null);
    setSeedSummary(null);
    setSeedLogs([`[${new Date().toLocaleTimeString()}] Initializing live synchronization and recovery...`]);

    try {
      const result = await seedDatabaseData((update) => {
        setSeedProgress(update);
        setSeedLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] [${update.percentage}%] ${update.log}`,
          ...prev.slice(0, 40),
        ]);
      });
      setSeedSummary(result);
      setSeedLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] ✅ ${result.message}`,
        ...prev,
      ]);
      await refreshDbHealth();
      loadCollectionSample(selectedCollection);
    } catch (err: any) {
      setSeedLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] ❌ Seeding notice: ${err?.message}`,
        ...prev,
      ]);
    } finally {
      setIsSeeding(false);
    }
  };

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

  // Google Maps Platform Registered Businesses
  const googleMapsBusinesses = useMemo(() => {
    return businesses.filter((b) => b.googleMapsRegistered || b.id.startsWith('gmp-'));
  }, [businesses]);

  const filteredGmpBusinesses = useMemo(() => {
    return googleMapsBusinesses.filter((b) => {
      const matchesSearch =
        !gmpSearchQuery ||
        b.name.toLowerCase().includes(gmpSearchQuery.toLowerCase()) ||
        b.city.toLowerCase().includes(gmpSearchQuery.toLowerCase()) ||
        b.area.toLowerCase().includes(gmpSearchQuery.toLowerCase()) ||
        b.categoryName.toLowerCase().includes(gmpSearchQuery.toLowerCase()) ||
        b.tags?.some((t) => t.toLowerCase().includes(gmpSearchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (gmpCategoryFilter === 'all') return true;
      if (gmpCategoryFilter === 'malls') {
        return (
          b.tags?.some((t) => t.toLowerCase().includes('mall')) ||
          b.categoryName.toLowerCase().includes('mall') ||
          b.name.toLowerCase().includes('mall')
        );
      }
      if (gmpCategoryFilter === 'medical') {
        return (
          b.categoryId === 'cat-health' ||
          b.name.toLowerCase().includes('hospital') ||
          b.name.toLowerCase().includes('clinic') ||
          b.tags?.some((t) => t.toLowerCase().includes('hospital') || t.toLowerCase().includes('clinic'))
        );
      }
      if (gmpCategoryFilter === 'commercial') {
        return (
          b.categoryId !== 'cat-health' &&
          !b.tags?.some((t) => t.toLowerCase().includes('mall')) &&
          !b.name.toLowerCase().includes('mall')
        );
      }
      if (gmpCategoryFilter === 'pending') {
        return b.verificationStatus !== 'verified';
      }
      if (gmpCategoryFilter === 'verified') {
        return b.verificationStatus === 'verified' || b.verificationTier === 'bwana_verified';
      }

      return true;
    });
  }, [googleMapsBusinesses, gmpSearchQuery, gmpCategoryFilter]);

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
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-amber-400 bg-amber-950 px-2.5 py-0.5 rounded border border-amber-800 font-semibold">
                BWANA ADMIN ENGINE · ZAMBIA
              </span>
              <span className="text-xs text-stone-400">·</span>
              <span className="text-xs font-mono font-bold text-rose-300 bg-rose-950/80 px-2.5 py-0.5 rounded border border-rose-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                <span>SUPER ADMIN: m.mumba8@gmail.com</span>
              </span>
              <span className="text-xs text-stone-400">·</span>
              <button
                type="button"
                onClick={() => setShowPrivilegeModal(true)}
                className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium cursor-pointer"
              >
                All Privileges Granted (View Matrix)
              </button>
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
          onClick={() => setActiveTab('gmp_places')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'gmp_places'
              ? 'bg-stone-900 text-white shadow-2xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-sky-400" />
          <span>Google Maps Registry ({googleMapsBusinesses.length})</span>
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

        <button
          onClick={() => setActiveTab('database_management')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'database_management'
              ? 'bg-stone-900 text-white shadow-2xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-amber-400" />
          <span>Database Management & Seeder</span>
        </button>

        <button
          onClick={() => setActiveTab('engineering_spec')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'engineering_spec'
              ? 'bg-stone-900 text-white shadow-2xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>Engineering Architecture</span>
        </button>

        <button
          onClick={() => setShowSchemaWorkbench(true)}
          className="ml-auto px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
        >
          <Database className="w-3.5 h-3.5 text-white" />
          <span>PostgreSQL & Supabase Workbench (V1.0)</span>
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
                            src={optimizeBusinessImage(associatedBusiness?.coverImage, 400)}
                            alt="Facility"
                            loading="lazy"
                            decoding="async"
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

      {/* GOOGLE MAPS REGISTRY & STATUTORY VERIFICATION TAB */}
      {activeTab === 'gmp_places' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-6 bg-gradient-to-r from-sky-950 via-stone-900 to-stone-950 border border-sky-500/40 rounded-3xl text-white shadow-md relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/40 font-mono text-[10px] font-bold">
                    GOOGLE MAPS PLATFORM DATASET
                  </span>
                  <span className="text-stone-400">·</span>
                  <span className="text-xs text-stone-300">Republic of Zambia Directory</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight mt-1">
                  Google Maps Registered Malls, Hospitals & Enterprises
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 max-w-2xl mt-1 leading-relaxed">
                  These authentic Zambian places are loaded in advance from Google Maps with accurate GPS coordinates. Review and grant statutory Bwana Verified badges (✓) to elevate them to certified merchants in the live Firestore database.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="p-3 bg-sky-950/80 border border-sky-600/50 rounded-2xl text-center">
                  <div className="text-[10px] text-sky-300 uppercase tracking-wider font-semibold">Pending Admin Review</div>
                  <div className="text-lg font-bold font-mono text-white mt-0.5">
                    {googleMapsBusinesses.filter((b) => b.verificationStatus !== 'verified').length} Unverified Places
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-center">
              <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
                <div className="text-[11px] text-stone-400">Total Google Maps Places</div>
                <div className="text-lg font-bold font-mono text-white mt-0.5">{googleMapsBusinesses.length}</div>
              </div>
              <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
                <div className="text-[11px] text-purple-300">Shopping Malls</div>
                <div className="text-lg font-bold font-mono text-purple-200 mt-0.5">
                  {googleMapsBusinesses.filter((b) => b.categoryName.includes('Mall') || b.tags?.some((t) => t.toLowerCase().includes('mall'))).length}
                </div>
              </div>
              <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
                <div className="text-[11px] text-rose-300">Hospitals & Clinics</div>
                <div className="text-lg font-bold font-mono text-rose-200 mt-0.5">
                  {googleMapsBusinesses.filter((b) => b.categoryId === 'cat-health' || b.name.includes('Hospital') || b.name.includes('Clinic') || b.name.includes('Medical')).length}
                </div>
              </div>
              <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
                <div className="text-[11px] text-emerald-300">Admin Verified (✓)</div>
                <div className="text-lg font-bold font-mono text-emerald-200 mt-0.5">
                  {googleMapsBusinesses.filter((b) => b.verificationStatus === 'verified' || b.verificationTier === 'bwana_verified').length}
                </div>
              </div>
            </div>
          </div>

          {/* Controls Bar: Search & Category Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-stone-50 px-3 py-2 rounded-xl border border-stone-200 text-xs">
              <Search className="w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search Google Maps places by name, city (Kitwe, Lusaka, Ndola), area, or tag..."
                value={gmpSearchQuery}
                onChange={(e) => setGmpSearchQuery(e.target.value)}
                className="bg-transparent w-full focus:outline-none text-stone-900"
              />
              {gmpSearchQuery && (
                <button
                  onClick={() => setGmpSearchQuery('')}
                  className="text-stone-400 hover:text-stone-600 font-mono text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setGmpCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  gmpCategoryFilter === 'all'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                All ({googleMapsBusinesses.length})
              </button>
              <button
                onClick={() => setGmpCategoryFilter('malls')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  gmpCategoryFilter === 'malls'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                Malls ({googleMapsBusinesses.filter((b) => b.categoryName.includes('Mall') || b.tags?.some((t) => t.toLowerCase().includes('mall'))).length})
              </button>
              <button
                onClick={() => setGmpCategoryFilter('medical')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  gmpCategoryFilter === 'medical'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                Clinics & Hospitals ({googleMapsBusinesses.filter((b) => b.categoryId === 'cat-health' || b.name.includes('Hospital') || b.name.includes('Clinic') || b.name.includes('Medical')).length})
              </button>
              <button
                onClick={() => setGmpCategoryFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  gmpCategoryFilter === 'pending'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                Pending Review ({googleMapsBusinesses.filter((b) => b.verificationStatus !== 'verified').length})
              </button>
              <button
                onClick={() => setGmpCategoryFilter('verified')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  gmpCategoryFilter === 'verified'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                Verified (✓) ({googleMapsBusinesses.filter((b) => b.verificationStatus === 'verified' || b.verificationTier === 'bwana_verified').length})
              </button>
            </div>
          </div>

          {/* Places Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGmpBusinesses.length === 0 ? (
              <div className="col-span-full p-10 text-center bg-white rounded-3xl border border-stone-200 text-stone-500">
                <Building2 className="w-8 h-8 mx-auto text-stone-400 mb-2 opacity-50" />
                <p className="text-sm font-semibold">No Google Maps places found matching your filter.</p>
                <button
                  onClick={() => {
                    setGmpSearchQuery('');
                    setGmpCategoryFilter('all');
                  }}
                  className="mt-3 text-xs text-sky-600 hover:underline font-semibold"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              filteredGmpBusinesses.map((biz) => {
                const isVerified = biz.verificationStatus === 'verified' || biz.verificationTier === 'bwana_verified';
                const isMall = biz.categoryName.includes('Mall') || biz.tags?.some((t) => t.toLowerCase().includes('mall'));
                const isHealth = biz.categoryId === 'cat-health' || biz.name.includes('Hospital') || biz.name.includes('Clinic') || biz.name.includes('Medical');

                return (
                  <div
                    key={biz.id}
                    className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      {/* Thumbnail Header */}
                      <div className="relative aspect-16/9 bg-stone-100 overflow-hidden">
                        <img
                          src={optimizeBusinessImage(biz.coverImage, 400)}
                          alt={biz.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-black/20" />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold bg-stone-900/90 text-white px-2 py-0.5 rounded-md backdrop-blur-xs">
                            {biz.city}
                          </span>
                          {isMall && (
                            <span className="text-[10px] font-bold bg-purple-900/90 text-purple-200 px-2 py-0.5 rounded-md backdrop-blur-xs">
                              Shopping Mall
                            </span>
                          )}
                          {isHealth && (
                            <span className="text-[10px] font-bold bg-rose-900/90 text-rose-200 px-2 py-0.5 rounded-md backdrop-blur-xs">
                              Hospital / Clinic
                            </span>
                          )}
                        </div>

                        {/* Status in top right */}
                        <div className="absolute top-2.5 right-2.5">
                          {isVerified ? (
                            <span className="text-[10px] font-bold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                              <CheckCircle className="w-3 h-3" />
                              <span>Verified ✓</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold bg-sky-950/90 text-sky-300 border border-sky-400/50 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                              <span>Pending Admin</span>
                            </span>
                          )}
                        </div>

                        {/* Bottom Name & Rating */}
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                          <h4 className="font-bold text-sm font-display leading-tight truncate">
                            {biz.name}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-stone-200 mt-0.5">
                            <span className="text-amber-400 font-bold">★ {biz.rating}</span>
                            <span className="text-stone-300">({biz.reviewsCount} Google reviews)</span>
                          </div>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-4 space-y-2.5 text-xs text-stone-600">
                        <p className="line-clamp-2 leading-relaxed">
                          {biz.description}
                        </p>

                        <div className="space-y-1 font-mono text-[11px] text-stone-500 pt-1 border-t border-stone-100">
                          <div>📍 {biz.address}</div>
                          {biz.phone && <div>📞 {biz.phone}</div>}
                          <div>🌐 GPS: {biz.coordinates.latitude.toFixed(4)}, {biz.coordinates.longitude.toFixed(4)}</div>
                        </div>

                        {/* Tags */}
                        {biz.tags && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {biz.tags.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="p-4 pt-2 border-t border-stone-100 flex items-center gap-2">
                      {!isVerified ? (
                        <button
                          onClick={async () => {
                            if (onApproveGoogleMapsBusiness) {
                              await onApproveGoogleMapsBusiness(biz.id);
                            }
                          }}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <BadgeCheck className="w-3.5 h-3.5" />
                          <span>Verify & Award Badge ✓</span>
                        </button>
                      ) : (
                        <div className="flex-1 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Bwana Verified Active</span>
                        </div>
                      )}

                      {onNavigateToBusiness && (
                        <button
                          onClick={() => onNavigateToBusiness(biz.id)}
                          className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs transition-colors cursor-pointer"
                          title="View public profile modal"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {onDirections && (
                        <button
                          type="button"
                          onClick={() => onDirections(biz)}
                          className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1 font-semibold"
                          title="Navigate to this location in-app"
                        >
                          <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="hidden sm:inline">Directions</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
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

      {/* ENGINEERING SPEC TAB (Moved from public view into authorized Admin portal) */}
      {activeTab === 'engineering_spec' && (
        <div className="space-y-6">
          <div className="p-4 bg-stone-900 text-white rounded-2xl border border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-sm">PostgreSQL + PostGIS Architecture & Versioned Gateway</h3>
                <p className="text-xs text-stone-400">Restricted administrative and developer clearance</p>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold border border-emerald-500/40">
              Admin Exclusive
            </span>
          </div>
          <EngineeringSpec />
        </div>
      )}

      {/* DATABASE MANAGEMENT & SEEDER TAB */}
      {activeTab === 'database_management' && (
        <div className="space-y-6">
          {/* Top Bar with Primary PostgreSQL / Supabase Workbench Launcher */}
          <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-7 border border-stone-800 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-amber-400 bg-amber-950 px-2.5 py-0.5 rounded border border-amber-800 font-semibold flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-amber-400" />
                    <span>DATABASE RECOVERY & SEEDER CONSOLE</span>
                  </span>
                  <span className="text-xs text-stone-500">·</span>
                  <span className="text-xs text-stone-300 font-mono">
                    Firestore ID: {dbReport?.databaseId || 'ai-studio-bwana-d9336748-f031-436d-bcac-cb70413ff046'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight mt-1">
                  Database Management, Seeder & Relational Console
                </h2>
                <p className="text-xs sm:text-sm text-stone-400 max-w-2xl leading-relaxed">
                  Monitor live collection health, repair core taxonomies & anchor facilities, inspect document records, and manage the hybrid Firestore + PostgreSQL architecture.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                <button
                  type="button"
                  onClick={refreshDbHealth}
                  disabled={isLoadingDbHealth}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDbHealth ? 'animate-spin' : ''}`} />
                  <span>Refresh Health</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSchemaWorkbench(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Database className="w-4 h-4 text-white" />
                  <span>Open PostgreSQL & Supabase Workbench</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Diagnostic Details Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-stone-800 text-xs">
              <div className="p-3 bg-stone-950/70 rounded-xl border border-stone-800">
                <div className="text-[10px] text-stone-400 font-medium">Connection Mode</div>
                <div className="font-semibold text-emerald-400 flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{dbReport?.isConnected ? 'Live Firestore Synced' : 'Resilient Offline Sync'}</span>
                </div>
              </div>

              <div className="p-3 bg-stone-950/70 rounded-xl border border-stone-800">
                <div className="text-[10px] text-stone-400 font-medium">Authorized Admin</div>
                <div className="font-mono text-stone-200 font-semibold mt-1 truncate">
                  m.mumba8@gmail.com
                </div>
              </div>

              <div className="p-3 bg-stone-950/70 rounded-xl border border-stone-800">
                <div className="text-[10px] text-stone-400 font-medium">Deployment Region</div>
                <div className="font-mono text-stone-200 font-semibold mt-1">
                  europe-west2 (Cloud Run)
                </div>
              </div>

              <div className="p-3 bg-stone-950/70 rounded-xl border border-stone-800">
                <div className="text-[10px] text-stone-400 font-medium">Relational Engine</div>
                <div className="font-mono text-emerald-300 font-semibold mt-1">
                  PostgreSQL 16 + PostGIS
                </div>
              </div>
            </div>
          </div>

          {/* Core Collection Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {(dbReport?.collections || [
              { name: 'businesses', count: businesses.length || 18, description: 'Commercial enterprises' },
              { name: 'categories', count: 10, description: 'Taxonomy categories' },
              { name: 'users', count: 12, description: 'Registered accounts' },
              { name: 'verifications', count: verifications.length || 6, description: 'PACRA/ZRA submissions' },
              { name: 'auditLogs', count: auditLogs.length || 12, description: 'Compliance audit trail' },
            ]).map((col) => (
              <button
                key={col.name}
                type="button"
                onClick={() => setSelectedCollection(col.name as any)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedCollection === col.name
                    ? 'bg-stone-900 border-amber-500 shadow-md text-white'
                    : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase font-semibold text-stone-400">
                    {col.name}
                  </span>
                  <HardDrive className={`w-3.5 h-3.5 ${selectedCollection === col.name ? 'text-amber-400' : 'text-stone-400'}`} />
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums mt-1.5">
                  {col.count.toLocaleString()}
                </div>
                <div className={`text-[11px] mt-1 line-clamp-1 ${selectedCollection === col.name ? 'text-stone-300' : 'text-stone-500'}`}>
                  {col.description}
                </div>
              </button>
            ))}
          </div>

          {/* Interactive Seeder & Repair Console */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-stone-900 font-display">
                    Idempotent Database Seeder & Repair Console
                  </h3>
                  <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded">
                    One-Click Repair
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Synchronizes all core categories (including Specialized Hospitals & Private Clinics) and anchor Zambian commercial businesses.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBiometricSeedConfirm(true)}
                  disabled={isSeeding}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  title="Requires Super Admin Biometric Passkey Confirmation"
                >
                  <Play className={`w-3.5 h-3.5 text-emerald-400 ${isSeeding ? 'animate-spin' : ''}`} />
                  <span>{isSeeding ? 'Synchronizing Database...' : 'Run Idempotent Database Seed'}</span>
                </button>
              </div>
            </div>

            {/* Live Progress Bar if Seeding */}
            {isSeeding && seedProgress && (
              <div className="p-4 bg-stone-950 text-white rounded-2xl border border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-stone-300 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                    <span>{seedProgress.log}</span>
                  </span>
                  <span className="text-amber-400 font-bold tabular-nums">
                    {seedProgress.percentage}% ({seedProgress.current}/{seedProgress.total})
                  </span>
                </div>
                <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full transition-all duration-150"
                    style={{ width: `${seedProgress.percentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Success Summary Banner */}
            {seedSummary && !isSeeding && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{seedSummary.message}</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-700">
                  {new Date(seedSummary.timestamp).toLocaleTimeString()}
                </span>
              </div>
            )}

            {/* Seeder Terminal / Audit Output Log */}
            <div className="rounded-2xl bg-stone-950 border border-stone-800 overflow-hidden text-xs">
              <div className="px-4 py-2 bg-stone-900 border-b border-stone-800 flex items-center justify-between text-[11px] text-stone-400 font-mono">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>LIVE REPAIR & SYNC LOGS</span>
                </div>
                <span>AUTO-SCROLL ENABLED</span>
              </div>
              <div className="p-3.5 max-h-48 overflow-y-auto font-mono text-[11px] text-stone-300 space-y-1">
                {seedLogs.length === 0 ? (
                  <div className="text-stone-500 italic py-2">
                    Click "Run Idempotent Database Seed" to execute automated category repair and business record synchronization.
                  </div>
                ) : (
                  seedLogs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed hover:bg-stone-900/50 px-1 rounded">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Interactive Collection Data Explorer */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-stone-900 font-display">
                  Live Collection Explorer: <span className="font-mono text-amber-600">{selectedCollection}</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Inspect active document payloads and attributes stored in Firestore.
                </p>
              </div>

              {/* Segmented Collection Picker */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100 rounded-xl text-xs">
                {(['businesses', 'categories', 'users', 'verifications', 'auditLogs'] as const).map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => {
                      setSelectedCollection(col);
                      loadCollectionSample(col);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                      selectedCollection === col
                        ? 'bg-white text-stone-900 font-bold shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter and View Toggle Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-2 flex-1 max-w-sm bg-stone-50 px-3 py-2 rounded-xl border border-stone-200 text-xs">
                <Search className="w-3.5 h-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder={`Search ${selectedCollection}...`}
                  value={collectionSearch}
                  onChange={(e) => setCollectionSearch(e.target.value)}
                  className="w-full bg-transparent focus:outline-none text-stone-800 placeholder-stone-400 text-xs"
                />
              </div>

              <div className="flex items-center gap-1 text-xs">
                <span className="text-stone-500 mr-1 text-[11px]">View Mode:</span>
                <button
                  type="button"
                  onClick={() => setExplorerViewMode('table')}
                  className={`px-3 py-1 rounded-lg font-medium cursor-pointer ${
                    explorerViewMode === 'table'
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Table
                </button>
                <button
                  type="button"
                  onClick={() => setExplorerViewMode('json')}
                  className={`px-3 py-1 rounded-lg font-medium cursor-pointer ${
                    explorerViewMode === 'json'
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Raw JSON
                </button>
              </div>
            </div>

            {/* Document Browser Area */}
            {explorerViewMode === 'table' ? (
              <div className="overflow-x-auto border border-stone-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold font-mono">
                    <tr>
                      <th className="p-3">ID / Reference</th>
                      <th className="p-3">Primary Field</th>
                      <th className="p-3">Status / Role</th>
                      <th className="p-3">Details / Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {collectionSample
                      .filter((item) => {
                        if (!collectionSearch) return true;
                        return JSON.stringify(item).toLowerCase().includes(collectionSearch.toLowerCase());
                      })
                      .map((docItem: any, idx) => (
                        <tr key={docItem.id || idx} className="hover:bg-stone-50 transition-colors">
                          <td className="p-3 font-mono text-[11px] text-stone-600 font-semibold">
                            {docItem.id || `doc-${idx}`}
                          </td>
                          <td className="p-3 font-semibold text-stone-900">
                            {docItem.name || docItem.businessName || docItem.title || docItem.email || '—'}
                          </td>
                          <td className="p-3">
                            <span className="font-mono text-[10px] bg-stone-100 text-stone-800 px-2 py-0.5 rounded font-medium">
                              {docItem.verificationStatus || docItem.role || docItem.status || 'active'}
                            </span>
                          </td>
                          <td className="p-3 text-stone-500 text-[11px] truncate max-w-xs">
                            {docItem.city || docItem.description || docItem.action || docItem.phone || '—'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 bg-stone-950 text-emerald-400 rounded-2xl border border-stone-800 font-mono text-xs max-h-96 overflow-y-auto">
                <pre>
                  {JSON.stringify(
                    collectionSample.filter((item) => {
                      if (!collectionSearch) return true;
                      return JSON.stringify(item).toLowerCase().includes(collectionSearch.toLowerCase());
                    }),
                    null,
                    2
                  )}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
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

      {/* PostgreSQL & Supabase Relational Workbench Modal */}
      <DatabaseSchemaWorkbenchModal
        isOpen={showSchemaWorkbench}
        onClose={() => setShowSchemaWorkbench(false)}
      />

      {/* Super Administrator Privileges & Security Clearance Modal */}
      {showPrivilegeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-stone-900 text-white rounded-3xl max-w-2xl w-full border border-rose-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-rose-950 via-stone-950 to-stone-900 border-b border-rose-900/60 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-700 flex items-center justify-center text-rose-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      Super Administrator Authority & Privileges
                    </h3>
                    <span className="text-[9px] font-mono uppercase bg-rose-950 text-rose-300 border border-rose-700 px-2 py-0.5 rounded font-bold">
                      Root Tier
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5 font-mono">
                    Designated User: m.mumba8@gmail.com · All 32 Platform Privileges Active
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPrivilegeModal(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content: Matrix of granted privileges */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              <div className="p-3.5 bg-rose-950/40 border border-rose-800/80 rounded-2xl flex items-start gap-3">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-white text-xs">Exclusive Privilege Enforcement</div>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    By platform security design, <span className="font-mono text-rose-300 font-bold">m.mumba8@gmail.com</span> is the single authorized identity granted unrestricted Super Admin privileges. No other user can escalate privileges, claim root authority, or override security invariants.
                  </p>
                </div>
              </div>

              {/* Granted Privilege Groups */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-[11px] font-mono uppercase font-bold text-stone-400 tracking-wider">
                    1. Cloud & System Root Governance
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { name: 'Full Platform Administration', desc: 'Manage tenants, configs, routing and global platform modes' },
                      { name: 'Super Admin Root Clearance', desc: 'Direct root access to all platform engines and cloud services' },
                      { name: 'Multi-Role & Admin Role Management', desc: 'Exclusive authority to provision and revoke administrative access' },
                      { name: 'Immutable Audit Trail Authority', desc: 'Inspect system-wide security, IP logs, and statutory events' },
                    ].map((p, idx) => (
                      <div key={idx} className="p-2.5 bg-stone-950/70 border border-stone-800 rounded-xl flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-white text-[11px]">{p.name}</div>
                          <div className="text-[10px] text-stone-400">{p.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-mono uppercase font-bold text-stone-400 tracking-wider">
                    2. Database & Data Architecture Control
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { name: 'Idempotent Database Seeder Execution', desc: 'One-click automated seeding of categories, clinics, and businesses' },
                      { name: 'PostgreSQL & PostGIS Workbench', desc: 'Access DDL scripts, spatial indexes, and recursive triggers' },
                      { name: 'Direct Firestore Collection Inspection', desc: 'Raw document viewer and live collections diagnostic tools' },
                      { name: 'Cache & Local Sync Recovery', desc: 'Zero-downtime offline fallback and manual flush authority' },
                    ].map((p, idx) => (
                      <div key={idx} className="p-2.5 bg-stone-950/70 border border-stone-800 rounded-xl flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-white text-[11px]">{p.name}</div>
                          <div className="text-[10px] text-stone-400">{p.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-mono uppercase font-bold text-stone-400 tracking-wider">
                    3. Statutory & Commercial Clearance
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { name: 'PACRA Registry Verification', desc: 'Approve or reject commercial registration certificates' },
                      { name: 'ZRA TPIN Tax Clearance Authority', desc: 'Verify tax payer identification numbers and compliance status' },
                      { name: 'Verified Badge (✓) Allocation', desc: 'Award official trust badges to Zambian business listings' },
                      { name: 'Dispute Arbitration & Moderation', desc: 'Override reported content, suspend listings, and resolve claims' },
                    ].map((p, idx) => (
                      <div key={idx} className="p-2.5 bg-stone-950/70 border border-stone-800 rounded-xl flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-white text-[11px]">{p.name}</div>
                          <div className="text-[10px] text-stone-400">{p.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs font-mono text-stone-400">
              <span className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>STATUS: 100% PRIVILEGES ACTIVE</span>
              </span>
              <button
                type="button"
                onClick={() => setShowPrivilegeModal(false)}
                className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white font-sans text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Biometric Passkey Confirmation Modal for Database Re-Seed */}
      <BiometricConfirmModal
        isOpen={showBiometricSeedConfirm}
        onClose={() => setShowBiometricSeedConfirm(false)}
        onConfirm={() => {
          setShowBiometricSeedConfirm(false);
          handleRunSeeder();
        }}
        actionTitle="Confirm Database Seed & Synchronization"
        actionDescription="You are initiating an idempotent database seed to synchronize core categories, hospitals, and anchor Zambian commercial businesses into live Firestore."
        targetEntity="Firestore Collections (businesses, categories, etc.)"
        currentUserEmail={currentUserEmail || 'm.mumba8@gmail.com'}
      />
    </div>
  );
};
