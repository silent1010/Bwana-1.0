import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Mic,
  MicOff,
  Sparkles,
  Phone,
  MapPin,
  CheckCircle,
  Share2,
  Gift,
  ExternalLink,
  MessageCircle,
  QrCode,
  ShieldCheck,
  TrendingUp,
  Award
} from 'lucide-react';
import { INITIAL_SCOUTS } from '../../data/mockData';
import { ScoutOnboardingRecord } from '../../types';
import { subscribeToScouts, createScoutInFirestore } from '../../services/firebase';

interface BwanaScoutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShopAdded?: (shopName: string) => void;
}

const COMPOUND_OPTIONS = [
  'Nakadoli Market, Kitwe',
  'Chamboli Compound, Kitwe',
  'Chisokone Market, Kitwe',
  'Chimwemwe Compound, Kitwe',
  'Riverside Ext, Kitwe',
  'Ndeke Village, Kitwe',
  'Chawama Compound, Lusaka',
  'Mtendere Market, Lusaka',
  'Matero East, Lusaka',
  'Kalingalinga, Lusaka'
];

const CATEGORY_CHIPS = [
  'Kantemba / Tuckshop',
  'Grocery & Provisions',
  'Community Chemist',
  'Hair Salon & Barber',
  'Welder & Metal Craft',
  'Fresh Butchery',
  'Tailoring & Chitenge',
  'Agro & Poultry Stall'
];

export const BwanaScoutsModal: React.FC<BwanaScoutsModalProps> = ({
  isOpen,
  onClose,
  onShopAdded,
}) => {
  const [activeTab, setActiveTab] = useState<'lite_form' | 'scout_network' | 'airtime_bounty'>('lite_form');
  
  // 30-Second Lite Onboarding Form State
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('+260 97 ');
  const [compound, setCompound] = useState(COMPOUND_OPTIONS[0]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_CHIPS[0]);
  const [scoutCode, setScoutCode] = useState('SCOUT-01 (Moses)');
  const [isRecordingBemba, setIsRecordingBemba] = useState(false);
  const [voiceNoteText, setVoiceNoteText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Airtime Crowdsource Bounty State
  const [crowdShopName, setCrowdShopName] = useState('');
  const [crowdLocation, setCrowdLocation] = useState('');
  const [crowdPhone, setCrowdPhone] = useState('');
  const [crowdAirtimePhone, setCrowdAirtimePhone] = useState('+260 97 ');
  const [crowdSubmitted, setCrowdSubmitted] = useState(false);

  const [scoutRecords, setScoutRecords] = useState<ScoutOnboardingRecord[]>(INITIAL_SCOUTS);

  // Synchronize with live Firestore scouts collection
  useEffect(() => {
    const unsub = subscribeToScouts((liveScouts) => {
      if (liveScouts && liveScouts.length > 0) {
        setScoutRecords(liveScouts);
      }
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  if (!isOpen) return null;

  const simulateBembaVoiceRecording = () => {
    if (isRecordingBemba) {
      setIsRecordingBemba(false);
      return;
    }
    setIsRecordingBemba(true);
    setVoiceNoteText('Recording in Bemba/Nyanja audio stream...');

    setTimeout(() => {
      setIsRecordingBemba(false);
      setVoiceNoteText('"Shitolo ya kwa Ba Mwape, ma groceries, cooking oil na fresh bread pa Nakadoli Market"');
      if (!shopName) setShopName('Ba Mwape Daily Provisions');
      if (!ownerName) setOwnerName('Ba Mwape Chileshe');
    }, 2500);
  };

  const handleLiteFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newRecord: ScoutOnboardingRecord = {
        id: `scout-rec-${Date.now()}`,
        shopName: shopName.trim(),
        ownerName: ownerName.trim() || 'Shop Owner',
        phone: phone.trim(),
        compound,
        city: compound.includes('Lusaka') ? 'Lusaka' : 'Kitwe',
        category: selectedCategory,
        scoutName: scoutCode,
        bountyZMW: 20,
        status: 'verified',
        audioNoteBemba: voiceNoteText || undefined,
        createdAt: new Date().toISOString(),
      };

      setScoutRecords([newRecord, ...scoutRecords]);
      createScoutInFirestore(newRecord).catch((err) => {
        console.warn('Failed to save scout record to Firestore:', err);
      });
      setIsSubmitting(false);
      setSuccessMessage(`Awesome! "${shopName}" is now listed as Community Verified. K20 bounty credited to ${scoutCode}.`);
      if (onShopAdded) onShopAdded(shopName);

      // Reset
      setShopName('');
      setOwnerName('');
      setVoiceNoteText('');
    }, 800);
  };

  const handleCrowdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCrowdSubmitted(true);
    setTimeout(() => {
      setCrowdSubmitted(false);
      setCrowdShopName('');
      setCrowdLocation('');
      setCrowdPhone('');
      setSuccessMessage('Zikomo! Missing shop submitted. K5 airtime will be sent to your MoMo number upon verification.');
    }, 2000);
  };

  const openWhatsAppBot = () => {
    const text = encodeURIComponent('Hi Bwana HQ! I want to onboard my shop in Kitwe/Lusaka: [Shop Name, Compound, Phone]');
    window.open(`https://wa.me/260977118330?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-stone-950 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-display text-white">Bwana Scouts Agent Program</h3>
                <span className="text-[11px] font-mono bg-amber-500/30 text-amber-300 border border-amber-500/50 px-2 py-0.5 rounded font-bold">
                  K20 Bounty / Shop
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Informal Economy Engine: Onboarding 500+ kantembas, tuckshops & pharmacies across Kitwe & Lusaka
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 px-6">
          <button
            onClick={() => { setActiveTab('lite_form'); setSuccessMessage(null); }}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'lite_form'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            ⚡ 30-Second Lite Onboarding
          </button>
          <button
            onClick={() => { setActiveTab('scout_network'); setSuccessMessage(null); }}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'scout_network'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            🛡️ Active Scouts ({scoutRecords.length} shops)
          </button>
          <button
            onClick={() => { setActiveTab('airtime_bounty'); setSuccessMessage(null); }}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'airtime_bounty'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            🎁 Earn K5 Airtime (Crowdsource)
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {successMessage && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: 30-SECOND LITE ONBOARDING FORM */}
          {activeTab === 'lite_form' && (
            <div className="space-y-6">
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Scouts Ground Directive: Fast 30-Second Kantemba Enrollment</span>
                  </div>
                  <p className="mt-0.5 text-stone-600 dark:text-stone-400">
                    Walk the compound, tap category chips, record voice note in Bemba/Nyanja, and collect phone number. No formal PACRA paperwork required for Community Verified status.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openWhatsAppBot}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Bot (+260977118330)</span>
                </button>
              </div>

              <form onSubmit={handleLiteFormSubmit} className="space-y-4">
                {/* Voice Bemba Audio Simulation */}
                <div className="p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-rose-500" />
                      <span>Bemba / Nyanja Voice Note Input (Offline Ready)</span>
                    </span>
                    <button
                      type="button"
                      onClick={simulateBembaVoiceRecording}
                      className={`px-3 py-1 text-xs rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        isRecordingBemba
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300'
                      }`}
                    >
                      {isRecordingBemba ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      <span>{isRecordingBemba ? 'Recording Audio...' : 'Record Voice (Bemba)'}</span>
                    </button>
                  </div>
                  {voiceNoteText && (
                    <p className="mt-2 text-xs italic text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 p-2 rounded border border-emerald-200 dark:border-emerald-900">
                      Transcribed: {voiceNoteText}
                    </p>
                  )}
                </div>

                {/* Shop Name & Owner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Shop / Kantemba Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ba Mwape Kantemba"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Owner / Vendor Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Francis Mwape"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Category Chips */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                    Category Chip *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_CHIPS.map((cat) => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          selectedCategory === cat
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Phone & Compound */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Phone / MoMo Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+260 97 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Compound / Market Location *
                    </label>
                    <select
                      value={compound}
                      onChange={(e) => setCompound(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {COMPOUND_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Scout ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Bwana Scout Agent ID
                    </label>
                    <select
                      value={scoutCode}
                      onChange={(e) => setScoutCode(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="SCOUT-01 (Moses)">Agent Moses Phiri (Kitwe Scout #01)</option>
                      <option value="SCOUT-02 (Brenda)">Agent Brenda Mwila (Kitwe Scout #02)</option>
                      <option value="SCOUT-03 (Chanda)">Agent Chanda Musonda (Kitwe Scout #03)</option>
                      <option value="SCOUT-HQ">HQ Field Supervisor</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{isSubmitting ? 'Enrolling Shop...' : 'Enroll Shop & Earn K20 Bounty'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: ACTIVE SCOUTS NETWORK */}
          {activeTab === 'scout_network' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                  <div className="text-[11px] text-stone-500">Active Field Scouts</div>
                  <div className="text-xl font-bold font-display text-stone-900 dark:text-white">3 Agents</div>
                  <div className="text-[10px] text-emerald-600">Kitwe & Lusaka Clusters</div>
                </div>
                <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                  <div className="text-[11px] text-stone-500">Shops Enrolled This Week</div>
                  <div className="text-xl font-bold font-display text-stone-900 dark:text-white">{scoutRecords.length} Shops</div>
                  <div className="text-[10px] text-stone-500">Target: 500 shops</div>
                </div>
                <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                  <div className="text-[11px] text-stone-500">Total Bounties Paid</div>
                  <div className="text-xl font-bold font-display text-amber-600 dark:text-amber-400 font-mono">
                    ZMW {scoutRecords.length * 20}
                  </div>
                  <div className="text-[10px] text-stone-500">Instant MoMo Payouts</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Recently Onboarded Informal Merchants
                </h4>
                {scoutRecords.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                        <span>{r.shopName}</span>
                        <span className="text-[10px] bg-stone-200 dark:bg-stone-700 px-1.5 py-0.2 rounded text-stone-600 dark:text-stone-300">
                          {r.category}
                        </span>
                      </div>
                      <div className="text-stone-500 text-[11px] mt-0.5">
                        {r.compound} · {r.phone} · Enrolled by {r.scoutName}
                      </div>
                      {r.audioNoteBemba && (
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 italic mt-0.5">
                          "{r.audioNoteBemba}"
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                        +K{r.bountyZMW} Bounty
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: AIRTIME CROWDSOURCE BOUNTY */}
          {activeTab === 'airtime_bounty' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-amber-300/40 rounded-xl">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-amber-500" />
                  <h4 className="font-bold text-sm text-stone-900 dark:text-white">
                    Add Missing Shop — Earn K5 Airtime
                  </h4>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                  Know a kantemba, local butcher, welder, or tuckshop in your compound that isn't on Bwana yet? Enter their details below. Once verified by our local scout, we immediately send K5 MTN or Airtel airtime to your phone!
                </p>
              </div>

              <form onSubmit={handleCrowdSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Missing Shop Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mambwe Butchery near Chimwemwe police"
                    value={crowdShopName}
                    onChange={(e) => setCrowdShopName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Compound / Landmark
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Nakadoli Market Section 4"
                      value={crowdLocation}
                      onChange={(e) => setCrowdLocation(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Shop Owner Phone (if known)
                    </label>
                    <input
                      type="text"
                      placeholder="+260 97..."
                      value={crowdPhone}
                      onChange={(e) => setCrowdPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Your Mobile Number to Receive K5 Airtime *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+260 97 123 4567"
                    value={crowdAirtimePhone}
                    onChange={(e) => setCrowdAirtimePhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={crowdSubmitted}
                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg text-xs font-bold transition-all shadow cursor-pointer flex items-center justify-center gap-2"
                >
                  <Gift className="w-4 h-4" />
                  <span>Submit Missing Shop & Claim K5 Airtime</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
          <span>Bwana Scouts Agent Protocol · Kitwe & Lusaka Ground Network</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-stone-800 dark:text-stone-200 rounded-lg font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
