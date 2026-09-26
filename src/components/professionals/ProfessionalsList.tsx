import React, { useState } from 'react';
import {
  Briefcase,
  Star,
  MapPin,
  Phone,
  MessageSquare,
  CheckCircle,
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';
import { Professional, LocationArea } from '../../types';

interface ProfessionalsListProps {
  professionals: Professional[];
  currentLocation: LocationArea;
  onCall: (phone: string) => void;
  onWhatsApp: (whatsapp: string) => void;
}

export const ProfessionalsList: React.FC<ProfessionalsListProps> = ({
  professionals,
  currentLocation,
  onCall,
  onWhatsApp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);

  // Extract unique skills
  const allSkills = Array.from(
    new Set(professionals.flatMap((p) => p.skills))
  );

  const filtered = professionals.filter((p) => {
    const matchSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchSkill =
      selectedSkill === 'all' || p.skills.includes(selectedSkill);

    return matchSearch && matchSkill;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Independent Professionals Directory</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-stone-900 tracking-tight">
          Find Vetted Freelancers & Skilled Contractors
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-2xl mt-1">
          Beyond formal companies: connect directly with verified software engineers, electricians, accountants, lawyers, and tradespeople across Zambia.
        </p>

        {/* Search & Filter Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by skill, trade, name, or city (e.g. React, Electrician, Lusaka, Kitwe)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-emerald-500 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedSkill('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedSkill === 'all'
                  ? 'bg-stone-900 text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              All Skills
            </button>
            {allSkills.slice(0, 6).map((skill) => (
              <button
                key={skill}
                onClick={() => setSelectedSkill(skill)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedSkill === skill
                    ? 'bg-stone-900 text-white'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Professionals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((pro) => (
          <div
            key={pro.id}
            className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all group"
          >
            <div>
              {/* Header profile info */}
              <div className="flex items-start gap-4">
                <img
                  src={pro.avatar}
                  alt={pro.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-stone-100 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-base font-display text-stone-900 truncate">
                        {pro.name}
                      </h3>
                      {pro.isVerified && (
                        <span className="text-emerald-600 font-bold text-sm" title="Verified Professional">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-mono font-bold text-stone-900">
                        {pro.currency} {pro.hourlyRate}/hr
                      </div>
                      <span className="text-[10px] text-stone-400">Starting rate</span>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-emerald-800 mt-0.5">{pro.title}</p>
                  
                  <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                    <span className="text-amber-600 font-semibold flex items-center gap-0.5">
                      ★ {pro.rating}
                    </span>
                    <span>({pro.reviewsCount} reviews)</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      {pro.city}, {pro.province}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <p className="text-xs text-stone-600 mt-4 leading-relaxed line-clamp-3">
                {pro.bio}
              </p>

              {/* Skills Tags (Zero-Pill styling: quiet text with separators or minimal badge) */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap gap-1.5">
                {pro.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-mono text-stone-600 bg-stone-100 px-2 py-0.5 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Available for */}
              <div className="mt-3 text-[11px] text-stone-500 flex items-center gap-1.5">
                <span className="font-semibold text-stone-700">Available for:</span>
                <span>{pro.availableFor.join(' · ')}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedPro(pro)}
                className="px-3 py-1.5 text-xs text-stone-700 hover:text-stone-900 font-medium"
              >
                View Portfolio ({pro.portfolio.length})
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onCall(pro.phone)}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-stone-600" />
                  <span>Call</span>
                </button>
                <button
                  onClick={() => onWhatsApp(pro.whatsapp)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Portfolio & Details Modal */}
      {selectedPro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-stone-200 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedPro.avatar}
                  alt={selectedPro.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-bold text-base font-display text-stone-900 flex items-center gap-1.5">
                    <span>{selectedPro.name}</span>
                    {selectedPro.isVerified && <span className="text-emerald-600">✓</span>}
                  </h3>
                  <p className="text-xs text-emerald-800">{selectedPro.title} · {selectedPro.city}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPro(null)}
                className="text-stone-400 hover:text-stone-600 text-xs px-2 py-1"
              >
                Close
              </button>
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Delivered Client Projects & Portfolio
              </h4>
              <div className="space-y-3">
                {selectedPro.portfolio.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-900">{item.title}</span>
                      <span className="font-mono text-stone-400">{item.year}</span>
                    </div>
                    <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
                      Client: {item.client}
                    </div>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedPro(null)}
                className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900"
              >
                Dismiss
              </button>
              <button
                onClick={() => onWhatsApp(selectedPro.whatsapp)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Contact {selectedPro.name}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
