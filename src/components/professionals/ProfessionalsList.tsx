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
  Filter,
  PlusCircle,
  FileCheck,
  ShieldCheck,
  Award,
  Upload,
  Check,
  X,
  Sparkles,
  HelpCircle,
  User,
  BadgeCheck,
  Layers,
  ChevronRight,
  Send
} from 'lucide-react';
import { Professional, LocationArea, UserRole, UserAccount } from '../../types';

interface ProfessionalsListProps {
  professionals: Professional[];
  currentLocation: LocationArea;
  onCall: (phone: string) => void;
  onWhatsApp: (whatsapp: string) => void;
  currentUser?: {
    isAuthenticated: boolean;
    email?: string;
    name?: string;
    role: UserRole;
    isNrcVerified?: boolean;
    userAccount?: UserAccount | null;
  };
  onOpenAuth?: () => void;
  onAddProfessional?: (pro: Professional) => Promise<void>;
}

const FIELDS_OF_EXPERTISE = [
  'All Fields',
  'Software, Data & IT',
  'Electrical & Renewable Energy',
  'Plumbing & Mechanical Pipefitting',
  'Building, Masonry & Carpentry',
  'Accounting, Audit & ZRA Tax',
  'Legal & Statutory Compliance',
  'Health, Nursing & Caregiving',
  'Automotive & Heavy Plant Mechanics',
  'Agriculture & Farm Engineering',
  'Creative, Media & Digital Design'
];

export const ProfessionalsList: React.FC<ProfessionalsListProps> = ({
  professionals,
  currentLocation,
  onCall,
  onWhatsApp,
  currentUser,
  onOpenAuth,
  onAddProfessional,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedField, setSelectedField] = useState<string>('All Fields');
  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);
  const [showSkillShowcaseModal, setShowSkillShowcaseModal] = useState(false);

  // Form State for Skill Showcase
  const [name, setName] = useState(currentUser?.name || '');
  const [title, setTitle] = useState('');
  const [field, setField] = useState('Electrical & Renewable Energy');
  const [skillsInput, setSkillsInput] = useState('');
  const [city, setCity] = useState(currentLocation?.city || 'Kitwe');
  const [province, setProvince] = useState(currentLocation?.province || 'Copperbelt');
  const [rate, setRate] = useState('150');
  const [phone, setPhone] = useState(currentUser?.userAccount?.phone || '+260 97 ');
  const [whatsapp, setWhatsapp] = useState(currentUser?.userAccount?.phone?.replace(/\D/g, '') || '26097');
  const [bio, setBio] = useState('');
  const [yearsExperience, setYearsExperience] = useState('4');

  // Qualification & Documentation Proof
  const [hasQualificationDoc, setHasQualificationDoc] = useState(true);
  const [qualificationDocType, setQualificationDocType] = useState('TEVETA Craft / Technician Certificate');
  const [qualificationDocName, setQualificationDocName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Filtered list
  const filtered = professionals.filter((p) => {
    const matchSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.field && p.field.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchField =
      selectedField === 'All Fields' ||
      p.field === selectedField ||
      p.skills.some((s) => s.toLowerCase().includes(selectedField.toLowerCase()));

    return matchSearch && matchField;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setQualificationDocName(file.name);
    }
  };

  const handleShowcaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !title.trim() || !bio.trim()) return;

    setIsSubmitting(true);
    const skillsArray = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const proId = `pro-${Date.now()}`;
    const cleanWhatsapp = whatsapp.replace(/\D/g, '') || phone.replace(/\D/g, '');

    const newProfessional: Professional = {
      id: proId,
      userId: currentUser?.userAccount?.id || `usr-${Date.now()}`,
      name: name.trim(),
      title: title.trim(),
      field: field,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      city: city.trim(),
      province: province.trim(),
      coordinates: currentLocation.coordinates,
      skills: skillsArray.length > 0 ? skillsArray : [field, 'Contractor Services'],
      rating: 5.0,
      reviewsCount: 1,
      availableFor: ['Full-Time Contract', 'Freelance Project', 'On-Call Emergency'],
      hourlyRate: Number(rate) || 120,
      priceModel: 'fixed',
      currency: 'ZMW',
      bio: bio.trim(),
      isVerified: Boolean(hasQualificationDoc && (qualificationDocName || registrationNumber)),
      phone: phone.trim(),
      whatsapp: cleanWhatsapp,
      portfolio: [
        {
          title: `${title} Deliverables`,
          client: 'Private Client (Zambia)',
          year: '2026',
          description: bio.trim(),
        },
      ],
      qualificationDocName: hasQualificationDoc ? (qualificationDocName || uploadedFileName || 'Certified Qualification Documentation') : undefined,
      qualificationDocType: hasQualificationDoc ? qualificationDocType : undefined,
      qualificationDocVerified: hasQualificationDoc,
      yearsExperience: Number(yearsExperience) || 3,
      registrationNumber: registrationNumber.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    if (onAddProfessional) {
      await onAddProfessional(newProfessional);
    }

    setIsSubmitting(false);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowSkillShowcaseModal(false);
      setTitle('');
      setSkillsInput('');
      setBio('');
      setRegistrationNumber('');
      setUploadedFileName('');
    }, 1800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* 1. Header with Skill Showcase CTA */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Independent Professionals & Trades Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-stone-900 dark:text-white tracking-tight">
              Zambia Skilled Contractors & Verified Freelancers
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-2xl mt-1">
              Hire vetted local talent across Zambia: certified electricians, software architects, chartered accountants, mechanics, and legal consultants.
            </p>
          </div>

          {/* Prominent Action Button: Showcase Your Skill */}
          <button
            type="button"
            onClick={() => {
              if (!currentUser?.isAuthenticated && onOpenAuth) {
                onOpenAuth();
              } else {
                setShowSkillShowcaseModal(true);
              }
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:scale-102 cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Showcase Your Skill / Advertise on Pros Page</span>
          </button>
        </div>

        {/* Search & Field Categories Filter Strip */}
        <div className="mt-6 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by skill, trade, name, or city (e.g. Electrician, React, Kitwe, ZICA Accountant)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-emerald-500 shadow-2xs"
            />
          </div>

          {/* Fields Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {FIELDS_OF_EXPERTISE.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedField(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedField === f
                    ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900'
                    : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Grid of Professionals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((pro) => (
          <div
            key={pro.id}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div>
              {/* Header profile info */}
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <img
                    src={pro.avatar}
                    alt={pro.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-stone-100 dark:border-stone-800 shadow-xs"
                  />
                  {pro.isVerified && (
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px] shadow-sm font-bold" title="Verified Professional Credentials">
                      ✓
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-base font-display text-stone-900 dark:text-white truncate">
                          {pro.name}
                        </h3>
                        {pro.isVerified && (
                          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/60 px-1.5 py-0.2 rounded shrink-0">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mt-0.5">
                        {pro.title}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-mono font-extrabold text-stone-900 dark:text-white">
                        {pro.currency} {pro.hourlyRate}/hr
                      </div>
                      <span className="text-[10px] text-stone-400">Standard rate</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mt-1.5">
                    <span className="text-amber-500 font-bold flex items-center gap-0.5">
                      ★ {pro.rating.toFixed(1)}
                    </span>
                    <span>({pro.reviewsCount} reviews)</span>
                    <span>·</span>
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                      {pro.city}, {pro.province}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio & Field */}
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-3.5 leading-relaxed line-clamp-3">
                {pro.bio}
              </p>

              {/* Qualification Documentation Badge */}
              {pro.qualificationDocType && (
                <div className="mt-3 p-2 bg-emerald-50/70 dark:bg-emerald-950/50 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2 text-[11px] text-emerald-900 dark:text-emerald-200">
                  <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">
                    <strong>Credentials:</strong> {pro.qualificationDocType}
                    {pro.registrationNumber ? ` · Ref: ${pro.registrationNumber}` : ''}
                  </span>
                </div>
              )}

              {/* Skills Tags */}
              <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-wrap gap-1.5">
                {pro.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-mono text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedPro(pro)}
                className="px-3 py-1.5 text-xs text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 font-semibold cursor-pointer"
              >
                View Credentials & Projects
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onCall(pro.phone)}
                  className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
                  <span>Call</span>
                </button>
                <button
                  type="button"
                  onClick={() => onWhatsApp(pro.whatsapp)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. MODAL: SKILL SHOWCASE & PRO APPLICATION */}
      {showSkillShowcaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-2xl w-full p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <span className="text-[11px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Zambia Independent Professionals Directory</span>
                </span>
                <h3 className="text-lg font-bold font-display text-stone-900 dark:text-white mt-0.5">
                  Showcase Your Skill & Advertise to Clients Online
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  List your technical or trade skills on Bwana. Providing qualification documentation unlocks a verified badge.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSkillShowcaseModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-lg text-stone-900 dark:text-white">
                  🎉 Skill Showcased & Published Live!
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-300 max-w-sm mx-auto">
                  Your professional skill profile has been added in real time to the live Zambia Pros page. Clients can now view your credentials, call, or chat with you on WhatsApp!
                </p>
              </div>
            ) : (
              <form onSubmit={handleShowcaseSubmit} className="space-y-4 text-xs">
                {/* 1. Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kondwani Phiri"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Professional Title / Trade *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Certified Electrician & Solar Installer"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* 2. Industry Field & Years Exp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Primary Industry / Field *
                    </label>
                    <select
                      value={field}
                      onChange={(e) => setField(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    >
                      {FIELDS_OF_EXPERTISE.filter((f) => f !== 'All Fields').map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Years of Hands-on Experience
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="40"
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* 3. Skills Chips */}
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Specific Skills & Deliverables (Comma-separated) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Solar inverter setup, Single-phase wiring, DB Board repair, Circuit diagnostics"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* 4. Rates & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Starting Rate (ZMW / hr) *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="150"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      City / Base *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Kitwe / Lusaka"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Province *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Copperbelt / Lusaka"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* 5. Contact Channels */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Phone Number (Direct Calling) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+260 97 712 3456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      WhatsApp Number (For Direct Chat) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="260977123456"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* 6. Pitch / Bio */}
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Professional Bio & Pitch *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Tell prospective clients what makes you qualified, notable projects completed in Zambia, warranty provided, and working hours..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
                  />
                </div>

                {/* 7. QUALIFICATION DOCUMENTATION SECTION */}
                <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-bold text-stone-900 dark:text-white text-xs">
                        Qualification Documentation & Proof of Competence
                      </span>
                    </div>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={hasQualificationDoc}
                        onChange={(e) => setHasQualificationDoc(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-semibold text-stone-700 dark:text-stone-300">I have documentation</span>
                    </label>
                  </div>

                  {hasQualificationDoc && (
                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-stone-600 dark:text-stone-400 text-[11px] font-semibold mb-1">
                            Document / Credential Type *
                          </label>
                          <select
                            value={qualificationDocType}
                            onChange={(e) => setQualificationDocType(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500 text-xs"
                          >
                            <option value="TEVETA Craft / Technician Certificate">TEVETA Craft / Technician Certificate</option>
                            <option value="Engineering Institute of Zambia (EIZ) License">Engineering Institute of Zambia (EIZ) License</option>
                            <option value="Zambia Institute of Chartered Accountants (ZICA)">Zambia Institute of Chartered Accountants (ZICA)</option>
                            <option value="Law Association of Zambia (LAZ) License">Law Association of Zambia (LAZ) License</option>
                            <option value="University Degree or Diploma">University Degree or Diploma</option>
                            <option value="National Trade Test Certificate">National Trade Test Certificate</option>
                            <option value="NRC Identity Card & Apprenticeship Letter">NRC Identity Card & Apprenticeship Letter</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-stone-600 dark:text-stone-400 text-[11px] font-semibold mb-1">
                            Certificate / Registration Ref No.
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. EIZ-2024-ENG-0982 or TEV-9941"
                            value={registrationNumber}
                            onChange={(e) => setRegistrationNumber(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500 text-xs"
                          />
                        </div>
                      </div>

                      {/* File Upload Selector */}
                      <div>
                        <label className="block text-stone-600 dark:text-stone-400 text-[11px] font-semibold mb-1">
                          Attach Document / Certificate Scan (PDF, JPG, PNG)
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="px-3.5 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:border-emerald-500 text-stone-700 dark:text-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs">
                            <Upload className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>{uploadedFileName ? 'Change Document' : 'Choose File to Attach'}</span>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                          {uploadedFileName ? (
                            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium truncate max-w-xs flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>{uploadedFileName}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-stone-400">
                              (Optional: You can also specify the certificate ref above)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSkillShowcaseModal(false)}
                    className="px-4 py-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Publishing Live...' : 'Publish to Pros Directory'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 4. MODAL: PORTFOLIO & DETAILS */}
      {selectedPro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-2xl w-full p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedPro.avatar}
                  alt={selectedPro.name}
                  className="w-12 h-12 rounded-xl object-cover border border-stone-200 dark:border-stone-700"
                />
                <div>
                  <h3 className="font-bold text-base font-display text-stone-900 dark:text-white flex items-center gap-1.5">
                    <span>{selectedPro.name}</span>
                    {selectedPro.isVerified && <span className="text-emerald-600">✓</span>}
                  </h3>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    {selectedPro.title} · {selectedPro.city}, {selectedPro.province}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPro(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Qualifications Card */}
            {selectedPro.qualificationDocType && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified Professional Credentials</span>
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300">
                  {selectedPro.qualificationDocType} {selectedPro.registrationNumber ? `(Registration: ${selectedPro.registrationNumber})` : ''}
                </p>
              </div>
            )}

            <div className="pt-1">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Delivered Projects & Proven Track Record
              </h4>
              <div className="space-y-3">
                {selectedPro.portfolio && selectedPro.portfolio.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700/60">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-900 dark:text-white">{item.title}</span>
                      <span className="font-mono text-stone-400">{item.year}</span>
                    </div>
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                      Client: {item.client}
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => onCall(selectedPro.phone)}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Phone className="w-4 h-4" />
                <span>Call {selectedPro.name.split(' ')[0]}</span>
              </button>
              <button
                type="button"
                onClick={() => onWhatsApp(selectedPro.whatsapp)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
