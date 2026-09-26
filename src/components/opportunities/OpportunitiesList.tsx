import React, { useState } from 'react';
import {
  Briefcase,
  FileText,
  GraduationCap,
  Calendar,
  Building,
  CheckCircle2,
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';
import { OpportunityItem } from '../../types';

interface OpportunitiesListProps {
  opportunities: OpportunityItem[];
}

export const OpportunitiesList: React.FC<OpportunitiesListProps> = ({ opportunities }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [appliedItem, setAppliedItem] = useState<string | null>(null);

  const filtered = opportunities.filter((op) => {
    const matchType = filterType === 'all' || op.type === filterType;
    const matchSearch =
      !search ||
      op.title.toLowerCase().includes(search.toLowerCase()) ||
      op.organization.toLowerCase().includes(search.toLowerCase()) ||
      op.description.toLowerCase().includes(search.toLowerCase()) ||
      op.location.toLowerCase().includes(search.toLowerCase());

    return matchType && matchSearch;
  });

  const handleApply = (id: string, contact: string) => {
    setAppliedItem(id);
    setTimeout(() => {
      window.open(`mailto:${contact}?subject=Bwana%20Application`, '_blank');
      setAppliedItem(null);
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
          <FileText className="w-3.5 h-3.5" />
          <span>Economic Opportunities</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-stone-900 tracking-tight">
          Procurement Tenders, Contracts & Career Openings
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-2xl mt-1">
          A discovery layer beyond physical businesses: public procurement tenders, private RFQs, graduate scholarships, and verified job postings.
        </p>

        {/* Filter Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by tender, role, organization or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-emerald-500 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {['all', 'tender', 'job', 'internship'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                  filterType === type
                    ? 'bg-stone-900 text-white'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {type === 'all' ? 'All Opportunities' : `${type}s`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {filtered.map((op) => (
          <div
            key={op.id}
            className="bg-white border border-stone-200 rounded-2xl p-6 hover:border-emerald-300 transition-all flex flex-col md:flex-row md:items-start justify-between gap-6"
          >
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono uppercase px-2 py-0.5 rounded font-semibold bg-stone-100 text-stone-800">
                  {op.type}
                </span>
                <span className="text-stone-300">·</span>
                <span className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-stone-400" />
                  {op.organization}
                </span>
                {op.isVerifiedOrg && (
                  <span className="text-emerald-600 font-bold text-xs" title="Verified Organization">
                    ✓
                  </span>
                )}
                <span className="text-stone-300">·</span>
                <span className="text-xs text-stone-500">{op.location}</span>
              </div>

              <div>
                <h3 className="text-lg font-bold font-display text-stone-900">
                  {op.title}
                </h3>
                <p className="text-xs text-stone-600 mt-1.5 leading-relaxed max-w-3xl">
                  {op.description}
                </p>
              </div>

              {/* Requirements */}
              <div>
                <h4 className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                  Key Requirements / Qualifications:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {op.requirements.map((req, i) => (
                    <span
                      key={i}
                      className="text-xs text-stone-600 bg-stone-50 border border-stone-200/80 px-2.5 py-1 rounded-md"
                    >
                      • {req}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right sidebar: remuneration & deadline */}
            <div className="md:w-64 shrink-0 flex flex-col justify-between border-t md:border-t-0 md:border-l border-stone-100 pt-4 md:pt-0 md:pl-6 space-y-4">
              <div>
                {op.remunerationOrBudget && (
                  <div className="mb-2">
                    <span className="text-[10px] uppercase font-semibold text-stone-400 block">
                      Value / Remuneration
                    </span>
                    <span className="text-sm font-mono font-bold text-stone-900">
                      {op.remunerationOrBudget}
                    </span>
                  </div>
                )}

                <div className="text-xs text-stone-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>Closing Deadline: <strong>{op.deadline}</strong></span>
                </div>
              </div>

              <button
                onClick={() => handleApply(op.id, op.applyUrlOrContact)}
                className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <span>{appliedItem === op.id ? 'Redirecting...' : 'Apply / Submit Bid'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
