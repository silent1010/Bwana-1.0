import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Building,
  CheckCircle2,
  ExternalLink,
  Search,
  Filter,
  PlusCircle,
  Share2,
  ShieldCheck,
  Globe,
  Clock,
  Briefcase,
  GraduationCap,
  Sparkles,
  X,
  Send,
  HelpCircle,
  AlertCircle,
  Check,
  Copy
} from 'lucide-react';
import { OpportunityItem, UserRole } from '../../types';

interface OpportunitiesListProps {
  opportunities: OpportunityItem[];
  currentUser?: {
    isAuthenticated: boolean;
    email?: string;
    name?: string;
    role: UserRole;
  };
  onCreateOpportunity?: (opp: OpportunityItem) => Promise<void>;
  onOpenAuth?: () => void;
}

export const OpportunitiesList: React.FC<OpportunitiesListProps> = ({
  opportunities,
  currentUser,
  onCreateOpportunity,
  onOpenAuth,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityItem | null>(null);
  const [showZppaGuideModal, setShowZppaGuideModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Opportunity Form state
  const [newTitle, setNewTitle] = useState('');
  const [newOrg, setNewOrg] = useState('');
  const [newType, setNewType] = useState<OpportunityItem['type']>('tender');
  const [newLocation, setNewLocation] = useState('Kitwe / Copperbelt, Zambia');
  const [newBudget, setNewBudget] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newRequirements, setNewRequirements] = useState('');
  const [newContact, setNewContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const filtered = opportunities.filter((op) => {
    let matchType = true;
    if (filterType === 'zppa') {
      matchType = Boolean(op.isZppaTender);
    } else if (filterType === 'private_tenders') {
      matchType = op.type === 'tender' && !op.isZppaTender;
    } else if (filterType !== 'all') {
      matchType = op.type === filterType;
    }

    const matchSearch =
      !search ||
      op.title.toLowerCase().includes(search.toLowerCase()) ||
      op.organization.toLowerCase().includes(search.toLowerCase()) ||
      op.description.toLowerCase().includes(search.toLowerCase()) ||
      op.location.toLowerCase().includes(search.toLowerCase()) ||
      (op.tenderNumber && op.tenderNumber.toLowerCase().includes(search.toLowerCase()));

    return matchType && matchSearch;
  });

  const handleCopyLink = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newOrg.trim() || !newDescription.trim()) return;

    setIsSubmitting(true);
    const reqArray = newRequirements
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    const newOpp: OpportunityItem = {
      id: `opp-custom-${Date.now()}`,
      title: newTitle.trim(),
      organization: newOrg.trim(),
      type: newType,
      location: newLocation.trim(),
      deadline: newDeadline || '2026-12-31',
      description: newDescription.trim(),
      requirements: reqArray.length > 0 ? reqArray : ['Registered Business Entity', 'Proof of competence'],
      remunerationOrBudget: newBudget.trim() ? `ZMW ${newBudget.trim()}` : 'Negotiable Commercial Value',
      applyUrlOrContact: newContact.trim() || (currentUser?.email || 'procurement@bwana.africa'),
      isVerifiedOrg: Boolean(currentUser?.isAuthenticated),
      createdAt: new Date().toISOString(),
    };

    if (onCreateOpportunity) {
      await onCreateOpportunity(newOpp);
    }

    setIsSubmitting(false);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowCreateModal(false);
      setNewTitle('');
      setNewOrg('');
      setNewDescription('');
      setNewRequirements('');
      setNewBudget('');
      setNewContact('');
    }, 1500);
  };

  const zppaTendersCount = opportunities.filter((o) => o.isZppaTender).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* 1. OFFICIAL ZPPA E-PROCUREMENT GATEWAY BANNER */}
      <div className="mb-8 rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-stone-950 text-white p-6 sm:p-8 border border-emerald-800/80 shadow-lg relative overflow-hidden">
        {/* Background Decorative Crest Pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <Globe className="w-80 h-80 text-emerald-400" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 tracking-wide uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Republic of Zambia · Official Procurement
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono text-emerald-300 bg-emerald-800/40 border border-emerald-600/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1" />
              Live e-GP System Connection
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display tracking-tight text-white leading-tight">
            Zambia Public Procurement Authority (ZPPA) Tenders
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 mt-2.5 leading-relaxed max-w-2xl">
            Bwana connects Zambian enterprises, contractors, and SMEs directly to official government tenders on the Electronic Government Procurement (e-GP) platform. Bid for public ministry contracts across Health, Infrastructure, Education, and Energy.
          </p>

          {/* Quick Connection Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="https://eprocure.zppa.org.zm"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md hover:scale-102 cursor-pointer"
            >
              <Globe className="w-4 h-4 text-stone-950" />
              <span>Open ZPPA e-GP Bidding Portal</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            <a
              href="https://www.zppa.org.zm"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-stone-900/90 hover:bg-stone-800 text-stone-200 border border-emerald-700/60 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Building className="w-4 h-4 text-emerald-400" />
              <span>ZPPA Official Site (zppa.org.zm)</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>

            <button
              onClick={() => setShowZppaGuideModal(true)}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/15 text-stone-200 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer backdrop-blur-xs"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>How to Bid on e-GP</span>
            </button>

            <button
              onClick={() => {
                if (!currentUser?.isAuthenticated && onOpenAuth) {
                  onOpenAuth();
                } else {
                  setShowCreateModal(true);
                }
              }}
              className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer ml-auto shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Company RFQ / Tender</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & ADVANCED FILTER STRIP */}
      <div className="mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search tenders by ref number, ministry, keywords (e.g. ZPPA/MOH, Solar, Roads, Cement)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-emerald-500 shadow-2xs"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-950'
                : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-50'
            }`}
          >
            All Opportunities ({opportunities.length})
          </button>

          <button
            onClick={() => setFilterType('zppa')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              filterType === 'zppa'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ZPPA Government ({zppaTendersCount})</span>
          </button>

          <button
            onClick={() => setFilterType('private_tenders')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'private_tenders'
                ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-950'
                : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-50'
            }`}
          >
            Private RFQs
          </button>

          <button
            onClick={() => setFilterType('job')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'job'
                ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-950'
                : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-50'
            }`}
          >
            Jobs
          </button>

          <button
            onClick={() => setFilterType('internship')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'internship'
                ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-950'
                : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-50'
            }`}
          >
            Apprenticeships
          </button>
        </div>
      </div>

      {/* 3. TENDERS & OPPORTUNITIES LIST */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
            <FileText className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
            <h3 className="font-bold text-base text-stone-900 dark:text-white">
              No tenders or opportunities found
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto mt-1">
              Try adjusting your search terms or view all ZPPA public tenders on the official portal.
            </p>
            <a
              href="https://eprocure.zppa.org.zm"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              <span>Browse e-GP Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          filtered.map((op) => (
            <div
              key={op.id}
              className={`bg-white dark:bg-stone-900 border rounded-2xl p-5 sm:p-6 transition-all hover:shadow-md flex flex-col lg:flex-row lg:items-start justify-between gap-6 ${
                op.isZppaTender
                  ? 'border-emerald-300 dark:border-emerald-700/80 hover:border-emerald-500 ring-1 ring-emerald-500/10'
                  : 'border-stone-200 dark:border-stone-800 hover:border-emerald-300'
              }`}
            >
              {/* Left Column: Details */}
              <div className="space-y-3 flex-1 min-w-0">
                {/* Meta Header */}
                <div className="flex flex-wrap items-center gap-2">
                  {op.isZppaTender ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 font-mono">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      ZPPA Official Tender
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-mono">
                      {op.type}
                    </span>
                  )}

                  {op.tenderNumber && (
                    <span className="font-mono text-xs font-bold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700">
                      Ref: {op.tenderNumber}
                    </span>
                  )}

                  {op.procurementCategory && (
                    <span className="text-xs text-stone-500 dark:text-stone-400">
                      Category: <strong className="text-stone-700 dark:text-stone-300">{op.procurementCategory}</strong>
                    </span>
                  )}

                  {op.procurementMethod && (
                    <span className="hidden sm:inline text-xs text-stone-500 dark:text-stone-400">
                      · {op.procurementMethod}
                    </span>
                  )}
                </div>

                {/* Organization & Location */}
                <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
                  <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    {op.organization}
                  </span>
                  {op.isVerifiedOrg && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold" title="Verified Authority">✓</span>
                  )}
                  <span>·</span>
                  <span>{op.location}</span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-display text-stone-900 dark:text-white leading-snug">
                    {op.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
                    {op.description}
                  </p>
                </div>

                {/* Mandatory Requirements Checklist */}
                {op.requirements && op.requirements.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>Mandatory Compliance / Eligibility Criteria:</span>
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {op.requirements.map((req, i) => (
                        <span
                          key={i}
                          className="text-xs text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/60 px-2.5 py-1 rounded-lg"
                        >
                          • {req}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Financial Allocation, Deadline & Direct Actions */}
              <div className="lg:w-72 shrink-0 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-stone-100 dark:border-stone-800 pt-4 lg:pt-0 lg:pl-6 space-y-4">
                <div className="space-y-3">
                  {/* Budget Allocation */}
                  {op.remunerationOrBudget && (
                    <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700/60">
                      <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 block">
                        Estimated Tender Value
                      </span>
                      <span className="text-base font-mono font-extrabold text-emerald-700 dark:text-emerald-400">
                        {op.remunerationOrBudget}
                      </span>
                    </div>
                  )}

                  {/* Deadline & Time */}
                  <div className="text-xs text-stone-600 dark:text-stone-300 space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>Closing: {op.deadline} {op.closingTime ? `(${op.closingTime})` : ''}</span>
                    </div>
                    {op.procuringEntity && (
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1">
                        Procuring: {op.procuringEntity}
                      </div>
                    )}
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="space-y-2">
                  {op.isZppaTender ? (
                    <a
                      href={op.applyUrlOrContact.startsWith('http') ? op.applyUrlOrContact : 'https://eprocure.zppa.org.zm'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-md cursor-pointer text-center"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Connect to ZPPA e-GP Portal</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                    </a>
                  ) : (
                    <a
                      href={op.applyUrlOrContact.startsWith('http') ? op.applyUrlOrContact : `mailto:${op.applyUrlOrContact}?subject=Tender%20Inquiry%20${encodeURIComponent(op.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
                    >
                      <span>Submit Bid / Apply</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {/* Secondary Tools: Details & Share */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedOpportunity(op)}
                      className="flex-1 py-1.5 text-xs text-stone-600 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 font-semibold border border-stone-200 dark:border-stone-800 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                    >
                      Full Details
                    </button>
                    <button
                      onClick={() => handleCopyLink(op.id, `${op.title} (${op.tenderNumber || ''}) - View on ZPPA: ${op.applyUrlOrContact}`)}
                      className="px-2.5 py-1.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 border border-stone-200 dark:border-stone-800 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                      title="Copy tender notice"
                    >
                      {copiedId === op.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. MODAL: FULL TENDER DETAILS & SBD COMPLIANCE */}
      {selectedOpportunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-2xl w-full p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <span className="text-[11px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedOpportunity.isZppaTender ? 'ZPPA Government Public Procurement' : 'Commercial Contract Opportunity'}
                </span>
                <h3 className="text-lg font-bold font-display text-stone-900 dark:text-white mt-0.5">
                  {selectedOpportunity.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOpportunity(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-stone-700 dark:text-stone-300">
              <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Procuring Authority</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">{selectedOpportunity.organization}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Estimated Budget</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{selectedOpportunity.remunerationOrBudget || 'Standard Government Rates'}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Tender Reference No.</span>
                  <span className="font-mono font-bold">{selectedOpportunity.tenderNumber || 'N/A (Direct Application)'}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Bid Submission Deadline</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">{selectedOpportunity.deadline}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                  Full Project Scope & Specifications
                </h4>
                <p className="leading-relaxed bg-stone-50 dark:bg-stone-800/40 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
                  {selectedOpportunity.description}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                  Mandatory Documents & Eligibility for Submission
                </h4>
                <ul className="space-y-1.5 pl-2">
                  {selectedOpportunity.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
              <a
                href="https://www.zppa.org.zm/standard-bidding-documents"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 font-semibold"
              >
                <span>Download ZPPA Standard SBDs</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedOpportunity(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white cursor-pointer"
                >
                  Close
                </button>
                <a
                  href={selectedOpportunity.applyUrlOrContact.startsWith('http') ? selectedOpportunity.applyUrlOrContact : `mailto:${selectedOpportunity.applyUrlOrContact}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Connect to ZPPA Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: ZPPA E-GP BIDDING COMPLIANCE GUIDE */}
      {showZppaGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-xl w-full p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-display text-stone-900 dark:text-white">
                    How Zambian Companies Win Tenders on e-GP
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Step-by-step roadmap for compliance and bidding on eprocure.zppa.org.zm
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowZppaGuideModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-stone-700 dark:text-stone-300">
              <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl space-y-1">
                <span className="font-bold text-stone-900 dark:text-white text-xs">Step 1: Company Legal Identity</span>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                  Ensure your business is registered with <strong>PACRA</strong> and has an active <strong>ZRA TPIN</strong> with a current Tax Clearance Certificate (TCC).
                </p>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl space-y-1">
                <span className="font-bold text-stone-900 dark:text-white text-xs">Step 2: ZPPA Supplier Registration</span>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                  Create your supplier profile on <strong>eprocure.zppa.org.zm</strong>. Pay the annual statutory supplier registration fee via mobile money or bank transfer to obtain your ZPPA Registration Certificate.
                </p>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl space-y-1">
                <span className="font-bold text-stone-900 dark:text-white text-xs">Step 3: Industry Regulatory Licenses</span>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                  • Construction tenders require <strong>NCC (National Council for Construction)</strong> Grade 1 to 6.<br />
                  • Pharmaceuticals require <strong>ZAMRA</strong> wholesale permits.<br />
                  • Engineering works require <strong>EIZ / EngRB</strong> corporate registration.
                </p>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl space-y-1">
                <span className="font-bold text-stone-900 dark:text-white text-xs">Step 4: Submitting Bids on e-GP</span>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                  Download the official Standard Bidding Document (SBD). Fill out the Bill of Quantities (BOQ), attach certified statutory certificates, and encrypt & submit through the e-GP portal before the stated closing hour.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <span className="text-[11px] text-stone-400">ZPPA Helpdesk: +260 211 377 400</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowZppaGuideModal(false)}
                  className="px-3.5 py-1.5 text-xs text-stone-600 dark:text-stone-300 font-semibold"
                >
                  Got It
                </button>
                <a
                  href="https://eprocure.zppa.org.zm/epps/registration/supplierRegistration.do"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <span>Register on e-GP</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: POST COMPANY PRIVATE RFQ / TENDER */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-xl w-full p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-bold text-base font-display text-stone-900 dark:text-white">
                  Post a Commercial Tender or Subcontract RFQ
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Publish your business procurement request to vetted Zambian suppliers in real time.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-stone-900 dark:text-white">
                  Tender Published in Real Time!
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
                  Your procurement opportunity is now broadcasted to suppliers across Zambia.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Tender / Opportunity Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Supply of 500 Tons Aggregate & River Sand for Commercial Project"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Issuing Company / Entity *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ABC Hardware & Construction Ltd"
                      value={newOrg}
                      onChange={(e) => setNewOrg(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Opportunity Type
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as OpportunityItem['type'])}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="tender">Commercial Tender / RFQ</option>
                      <option value="job">Career / Job Opening</option>
                      <option value="internship">Apprenticeship</option>
                      <option value="business_grant">Business Grant</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Budget / Estimated Value (ZMW)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 450,000 or Fixed Rate"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Submission Deadline *
                    </label>
                    <input
                      type="date"
                      required
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Project Location / Site *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Plot 418, Riverside, Kitwe"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Scope of Work & Deliverables *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide detailed specifications, expected delivery schedule, testing requirements..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Eligibility & Requirements (1 per line)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="PACRA Certificate&#10;Valid ZRA Tax Clearance&#10;Track record of 2 prior deliveries"
                    value={newRequirements}
                    onChange={(e) => setNewRequirements(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Bid Submission Email or Portal URL *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. procurement@company.co.zm or https://company.co.zm/tenders"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Publishing...' : 'Publish Tender in Real Time'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
