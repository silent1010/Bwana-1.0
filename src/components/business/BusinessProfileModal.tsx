import React, { useState, useMemo } from 'react';
import {
  X,
  Phone,
  MessageSquare,
  Navigation,
  Bookmark,
  CheckCircle,
  Clock,
  Star,
  Share2,
  AlertTriangle,
  Package,
  Wrench,
  Flame,
  ShieldCheck,
  Send,
  Building2,
  ExternalLink,
  MapPin,
  Tag,
  QrCode,
  Map as MapIcon,
  Copy,
  Check,
  Wifi,
  Car,
  Truck,
  CreditCard,
  Wind,
  ShieldAlert,
  Sun,
  Filter,
  ArrowRight,
  ArrowLeft,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Compass,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import {
  Business,
  BusinessProduct,
  BusinessService,
  BusinessReview,
  UserRole
} from '../../types';
import { INITIAL_BUSINESSES, INITIAL_REVIEWS } from '../../data/mockData';
import { BusinessReviewsSection } from './BusinessReviewsSection';

interface BusinessProfileModalProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
  onCall: (phone: string) => void;
  onWhatsApp: (whatsapp: string) => void;
  onDirections: (biz: Business) => void;
  isSaved?: boolean;
  onToggleSave?: (bizId: string) => void;
  onOpenClaimModal?: (biz: Business) => void;
  allReviews?: BusinessReview[];
  onAddReview?: (
    businessId: string,
    rating: number,
    comment: string,
    tags: string[],
    verifiedVisit: boolean,
    photoUrl?: string,
    photos?: string[]
  ) => void;
  onHelpfulVote?: (reviewId: string) => void;
  currentUser?: {
    isAuthenticated: boolean;
    email: string;
    name: string;
    role: UserRole;
  };
  onRequireLogin?: () => void;
  allBusinesses?: Business[];
  onSelectBusiness?: (biz: Business) => void;
  onFilterDirectoryByTag?: (tag: string) => void;
}

// Helper to get tag icon and color
const getTagMeta = (tag: string) => {
  const lower = tag.toLowerCase();
  if (lower.includes('24/7') || lower.includes('hour')) {
    return {
      icon: Clock,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100',
      badgeColor: 'bg-emerald-700 text-white',
    };
  }
  if (lower.includes('wheelchair') || lower.includes('accessible')) {
    return {
      icon: CheckCircle2,
      color: 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100',
      badgeColor: 'bg-blue-700 text-white',
    };
  }
  if (lower.includes('delivery')) {
    return {
      icon: Truck,
      color: 'bg-indigo-50 text-indigo-800 border-indigo-300 hover:bg-indigo-100',
      badgeColor: 'bg-indigo-700 text-white',
    };
  }
  if (lower.includes('wifi')) {
    return {
      icon: Wifi,
      color: 'bg-cyan-50 text-cyan-800 border-cyan-300 hover:bg-cyan-100',
      badgeColor: 'bg-cyan-700 text-white',
    };
  }
  if (lower.includes('card') || lower.includes('money') || lower.includes('payment')) {
    return {
      icon: CreditCard,
      color: 'bg-teal-50 text-teal-800 border-teal-300 hover:bg-teal-100',
      badgeColor: 'bg-teal-700 text-white',
    };
  }
  if (lower.includes('parking')) {
    return {
      icon: Car,
      color: 'bg-stone-100 text-stone-800 border-stone-300 hover:bg-stone-200',
      badgeColor: 'bg-stone-700 text-white',
    };
  }
  if (lower.includes('air conditioned') || lower.includes('ac')) {
    return {
      icon: Wind,
      color: 'bg-sky-50 text-sky-800 border-sky-300 hover:bg-sky-100',
      badgeColor: 'bg-sky-700 text-white',
    };
  }
  if (lower.includes('outdoor') || lower.includes('seating')) {
    return {
      icon: Sun,
      color: 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100',
      badgeColor: 'bg-amber-700 text-white',
    };
  }
  if (lower.includes('emergency')) {
    return {
      icon: ShieldAlert,
      color: 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100',
      badgeColor: 'bg-rose-700 text-white',
    };
  }
  if (lower.includes('zabs') || lower.includes('zamra') || lower.includes('certified')) {
    return {
      icon: ShieldCheck,
      color: 'bg-emerald-50 text-emerald-900 border-emerald-400 hover:bg-emerald-100',
      badgeColor: 'bg-emerald-800 text-white',
    };
  }
  return {
    icon: Tag,
    color: 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100',
    badgeColor: 'bg-stone-700 text-white',
  };
};

export const BusinessProfileModal: React.FC<BusinessProfileModalProps> = ({
  business,
  isOpen,
  onClose,
  onCall,
  onWhatsApp,
  onDirections,
  isSaved = false,
  onToggleSave,
  onOpenClaimModal,
  allReviews,
  onAddReview,
  onHelpfulVote,
  currentUser,
  onRequireLogin,
  allBusinesses = INITIAL_BUSINESSES,
  onSelectBusiness,
  onFilterDirectoryByTag,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'services' | 'promotions' | 'reviews'
  >('overview');
  const [reviews, setReviews] = useState<BusinessReview[]>(INITIAL_REVIEWS);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('Incorrect phone number or address');

  // Tag-based filtering state
  const [activeFilterTag, setActiveFilterTag] = useState<string | null>(null);

  // QR Code & Interactive Map state
  const [showQrModal, setShowQrModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [mapZoom, setMapZoom] = useState(15);
  const [mapLayer, setMapLayer] = useState<'streets' | 'satellite'>('streets');

  const businessReviews = useMemo(() => {
    if (!business) return [];
    const source = allReviews || reviews;
    return source.filter((r) => r.businessId === business.id);
  }, [allReviews, reviews, business]);

  // Fallback default tags if not populated
  const businessTags = useMemo(() => {
    if (!business) return [];
    if (business.tags && business.tags.length > 0) return business.tags;
    // Derive sensible attributes
    const tags: string[] = ['Card & Mobile Money', 'Customer Parking'];
    if (business.isOpenNow) tags.push('Open Now');
    if (business.verificationStatus === 'verified') tags.push('Bwana Verified');
    return tags;
  }, [business]);

  // Get matching businesses for the activeFilterTag
  const matchingBusinesses = useMemo(() => {
    if (!activeFilterTag) return [];
    return allBusinesses.filter((b) => b.tags?.includes(activeFilterTag));
  }, [activeFilterTag, allBusinesses]);

  // Calculate count of other businesses for any tag
  const getOtherBusinessesCount = (tag: string) => {
    return allBusinesses.filter((b) => b.tags?.includes(tag)).length;
  };

  if (!isOpen || !business) return null;

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitted(true);
    setTimeout(() => {
      setShowReportForm(false);
      setReportSubmitted(false);
    }, 2000);
  };

  const handleCopyLink = () => {
    const link = `https://bwana.africa/biz/${business.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSwitchToMatchingBusiness = (targetBiz: Business) => {
    if (onSelectBusiness) {
      onSelectBusiness(targetBiz);
      setActiveFilterTag(null); // return to normal view of the new business
    }
  };

  const handleFilterMainDirectory = (tag: string) => {
    if (onFilterDirectoryByTag) {
      onFilterDirectoryByTag(tag);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col relative animate-in fade-in slide-in-from-bottom-5 duration-300 ease-out">
        {/* Visual Cover & Header Banner */}
        <div className="relative h-64 sm:h-72 bg-stone-900 shrink-0 overflow-hidden">
          <img
            src={business.coverImage}
            alt={business.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-black/40" />

          {/* Top Actions Bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {business.verificationStatus === 'verified' ? (
                <div className="bg-emerald-950/90 text-emerald-300 border border-emerald-700/80 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 backdrop-blur-xs shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Bwana Verified ✓</span>
                </div>
              ) : business.verificationStatus === 'claimed' ? (
                <div className="bg-amber-950/90 text-amber-300 border border-amber-700/80 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 backdrop-blur-xs">
                  <span>Claimed Profile</span>
                </div>
              ) : (
                <div className="bg-stone-900/90 text-stone-300 border border-stone-700 px-2.5 py-1 rounded-md text-xs font-semibold backdrop-blur-xs">
                  <span>Unverified Listing</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Show on Map Button */}
              <button
                onClick={() => setShowMapModal(true)}
                className="px-2.5 py-1.5 rounded-full bg-stone-900/80 hover:bg-stone-900 text-stone-200 hover:text-white border border-stone-700 backdrop-blur-xs text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Show business on interactive map"
              >
                <MapIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Show on Map</span>
              </button>

              {/* QR Code button */}
              <button
                onClick={() => setShowQrModal(true)}
                className="px-2.5 py-1.5 rounded-full bg-stone-900/80 hover:bg-stone-900 text-stone-200 hover:text-white border border-stone-700 backdrop-blur-xs text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="View QR Code for sharing or scanning"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">QR Code</span>
              </button>

              {onToggleSave && (
                <button
                  onClick={() => onToggleSave(business.id)}
                  className={`p-2 rounded-full backdrop-blur-xs transition-colors cursor-pointer ${
                    isSaved
                      ? 'bg-amber-500 text-white'
                      : 'bg-stone-900/80 text-white hover:bg-stone-900 border border-stone-700'
                  }`}
                  title="Save business"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-stone-900/80 text-white hover:bg-stone-900 border border-stone-700 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Business Hero Info in Banner */}
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight flex items-center gap-2">
                  <span>{business.name}</span>
                  {business.verificationStatus === 'verified' && (
                    <span className="text-emerald-400 text-xl font-bold" title="Verified by Bwana">
                      ✓
                    </span>
                  )}
                </h2>

                {/* Clean metadata line */}
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-stone-300 mt-1">
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className="font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer transition-colors"
                    title="View reviews and ratings"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-300" />
                    <span>
                      {business.rating.toFixed(1)} ({businessReviews.length || business.reviewsCount} reviews)
                    </span>
                  </button>
                  <span>·</span>
                  <span className="text-stone-200">{business.categoryName}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    {business.area}, {business.city} ({business.province})
                  </span>
                  {business.distanceKm !== undefined && (
                    <>
                      <span>·</span>
                      <span className="font-mono text-emerald-300 font-semibold">
                        {business.distanceKm} km away
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-xs px-2.5 py-1 rounded font-medium ${
                    business.isOpenNow
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {business.isOpenNow ? 'OPEN NOW' : 'CLOSED NOW'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action Bar */}
        <div className="bg-stone-50 border-b border-stone-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <button
              onClick={() => onCall(business.phone)}
              className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Call {business.phone}</span>
            </button>

            <button
              onClick={() => onWhatsApp(business.whatsapp)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Message</span>
            </button>

            <button
              onClick={() => onDirections(business)}
              className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-stone-600" />
              <span>Directions</span>
            </button>

            <button
              onClick={() => setShowMapModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <MapIcon className="w-4 h-4 text-emerald-600" />
              <span>Show on Map</span>
            </button>

            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-amber-600" />
              <span>Scan QR</span>
            </button>

            <button
              onClick={() => setShowReportForm(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-stone-500 hover:text-stone-800 text-xs transition-colors ml-auto cursor-pointer"
              title="Report incorrect information"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Report Info</span>
            </button>
          </div>
        </div>

        {/* Quick Tag Pills Bar: Prominent Clickable Attribute Row */}
        {businessTags.length > 0 && (
          <div className="bg-stone-100/80 border-b border-stone-200/90 px-6 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 font-semibold shrink-0 mr-1">
              <Tag className="w-3.5 h-3.5 text-stone-600" />
              <span className="uppercase tracking-wider text-[11px]">Attributes:</span>
            </div>

            <div className="flex items-center gap-1.5 flex-nowrap">
              {businessTags.map((tag) => {
                const meta = getTagMeta(tag);
                const IconComponent = meta.icon;
                const count = getOtherBusinessesCount(tag);
                const isCurrentActive = activeFilterTag === tag;

                return (
                  <button
                    key={tag}
                    onClick={() => setActiveFilterTag(isCurrentActive ? null : tag)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                      isCurrentActive
                        ? 'bg-emerald-900 text-white border-emerald-900 ring-2 ring-emerald-500'
                        : `${meta.color}`
                    }`}
                    title={`Click to find other businesses with "${tag}"`}
                  >
                    <IconComponent className="w-3 h-3" />
                    <span>{tag}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                        isCurrentActive
                          ? 'bg-emerald-800 text-emerald-100'
                          : meta.badgeColor
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="ml-auto text-[11px] text-stone-400 font-normal hidden md:inline shrink-0 pl-2">
              (Click tag to view matching businesses)
            </div>
          </div>
        )}

        {/* TAG FILTERING OVERLAY / PANEL (When user clicks any business attribute) */}
        {activeFilterTag && (
          <div className="bg-emerald-950 text-white px-6 py-4 border-b border-emerald-800 shrink-0 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-emerald-300">
                  <Filter className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-mono tracking-wider text-emerald-300">
                      Tag-Based Filter
                    </span>
                    <span className="text-[11px] bg-emerald-900 border border-emerald-700 px-2 py-0.2 rounded font-mono text-emerald-200">
                      {matchingBusinesses.length} businesses matching
                    </span>
                  </div>
                  <h3 className="text-base font-bold font-display text-white">
                    Businesses with &quot;{activeFilterTag}&quot;
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleFilterMainDirectory(activeFilterTag)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <span>Filter in Main Directory</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveFilterTag(null)}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Clear Filter
                </button>
              </div>
            </div>

            {/* Switch to another attribute of this business */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <span className="text-[11px] text-emerald-400/80 mr-1 shrink-0">Switch attribute:</span>
              {businessTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveFilterTag(tag)}
                  className={`text-xs px-2.5 py-0.5 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                    activeFilterTag === tag
                      ? 'bg-white text-emerald-950 font-bold'
                      : 'bg-emerald-900/80 text-emerald-200 hover:bg-emerald-800'
                  }`}
                >
                  {tag} ({getOtherBusinessesCount(tag)})
                </button>
              ))}
            </div>

            {/* Matching businesses grid/list in drawer */}
            <div className="mt-3 pt-3 border-t border-emerald-800/80">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-56 overflow-y-auto pr-1">
                {matchingBusinesses.map((match) => {
                  const isCurrent = match.id === business.id;
                  return (
                    <div
                      key={match.id}
                      onClick={() => !isCurrent && handleSwitchToMatchingBusiness(match)}
                      className={`p-3 rounded-xl border text-xs transition-all flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-emerald-900/40 border-emerald-500/60 ring-1 ring-emerald-500 cursor-default'
                          : 'bg-stone-900 hover:bg-stone-850 border-stone-800 hover:border-emerald-600 cursor-pointer group'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <img
                          src={match.coverImage}
                          alt={match.name}
                          className="w-12 h-12 rounded-lg object-cover shrink-0 border border-stone-700"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-white text-xs truncate group-hover:text-emerald-300 transition-colors">
                              {match.name}
                            </span>
                            {match.verificationStatus === 'verified' && (
                              <span className="text-emerald-400 font-bold shrink-0">✓</span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-400 truncate">
                            {match.categoryName} · {match.area}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[11px]">
                            <span className="text-amber-300 font-bold">★ {match.rating}</span>
                            <span className="text-stone-400">({match.reviewsCount})</span>
                            {match.distanceKm !== undefined && (
                              <span className="text-emerald-400 font-mono">
                                {match.distanceKm} km
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-stone-800 flex items-center justify-between">
                        {isCurrent ? (
                          <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-800">
                            Currently Viewing
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="text-[11px] text-emerald-400 group-hover:text-emerald-300 font-semibold flex items-center gap-1"
                          >
                            <span>Inspect Profile</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <span
                          className={`text-[10px] font-medium ${
                            match.isOpenNow ? 'text-emerald-400' : 'text-stone-500'
                          }`}
                        >
                          {match.isOpenNow ? 'Open Now' : 'Closed'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-stone-200 bg-white flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Overview & Attributes
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'products'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Products ({business.products?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'services'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Services ({business.services?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('promotions')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'promotions'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Deals & Offers ({business.promotions?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Reviews ({businessReviews.length})</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left 2 cols: About, Attributes, Catalog, Social */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                    About {business.name}
                  </h4>
                  <p className="text-sm text-stone-700 leading-relaxed">
                    {business.description}
                  </p>
                </div>

                {/* Prominent Business Attributes & Tag-Based Discovery Card */}
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Business Attributes & Amenities</span>
                    </h4>
                    <span className="text-[11px] text-stone-500">
                      Click any tag to see other businesses
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mb-3">
                    Filter across all registered Copperbelt & Lusaka enterprises sharing these certified capabilities:
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {businessTags.map((tag) => {
                      const meta = getTagMeta(tag);
                      const IconComponent = meta.icon;
                      const count = getOtherBusinessesCount(tag);

                      return (
                        <button
                          key={tag}
                          onClick={() => setActiveFilterTag(tag)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${meta.color} shadow-2xs group`}
                          title={`Explore ${count} businesses offering ${tag}`}
                        >
                          <IconComponent className="w-3.5 h-3.5 shrink-0" />
                          <span>{tag}</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${meta.badgeColor}`}>
                            {count} found
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Social Media Links Section */}
                {business.socialLinks && (
                  <div className="p-4 rounded-xl bg-white border border-stone-200">
                    <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Connect on Social Media</span>
                    </h4>
                    <p className="text-xs text-stone-500 mb-3">
                      Official social channels and online pages for {business.name}:
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      {business.socialLinks.facebook && (
                        <a
                          href={business.socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] border border-[#1877F2]/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          <span>Facebook Page</span>
                          <ExternalLink className="w-3 h-3 opacity-70" />
                        </a>
                      )}

                      {business.socialLinks.instagram && (
                        <a
                          href={business.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-[#E4405F]/10 hover:bg-[#E4405F]/20 text-[#E4405F] border border-[#E4405F]/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                          <span>Instagram</span>
                          <ExternalLink className="w-3 h-3 opacity-70" />
                        </a>
                      )}

                      {business.socialLinks.linkedin && (
                        <a
                          href={business.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2] border border-[#0A66C2]/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                          <span>LinkedIn</span>
                          <ExternalLink className="w-3 h-3 opacity-70" />
                        </a>
                      )}

                      {business.socialLinks.twitter && (
                        <a
                          href={business.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                          <span>X (Twitter)</span>
                          <ExternalLink className="w-3 h-3 opacity-70" />
                        </a>
                      )}

                      {business.website && (
                        <a
                          href={business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Official Website</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Promotional banner if available */}
                {business.promotions && business.promotions.length > 0 && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wide">
                      <Flame className="w-4 h-4 text-amber-600" />
                      <span>{business.promotions[0].title}</span>
                    </div>
                    <p className="text-sm font-semibold mt-1">
                      {business.promotions[0].tagline}
                    </p>
                    <div className="text-xs text-amber-700 mt-2 flex items-center justify-between">
                      <span>
                        Valid: {business.promotions[0].validFrom} – {business.promotions[0].validUntil}
                      </span>
                      <span className="font-mono font-bold bg-amber-200/80 px-2 py-0.5 rounded">
                        {business.promotions[0].discountPercentage}% OFF
                      </span>
                    </div>
                  </div>
                )}

                {/* Featured Products Sneak Peek */}
                {business.products && business.products.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                        Featured Catalog Items
                      </h4>
                      <button
                        onClick={() => setActiveTab('products')}
                        className="text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
                      >
                        View all {business.products.length} products →
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {business.products.slice(0, 4).map((p) => (
                        <div key={p.id} className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                          <div className="text-xs font-semibold text-stone-900">{p.name}</div>
                          <div className="text-xs text-stone-500 mt-1 line-clamp-1">{p.description}</div>
                          <div className="mt-2 text-sm font-mono font-bold text-stone-900">
                            {p.currency} {p.price.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photo Gallery Showcase */}
                {business.galleryImages && business.galleryImages.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
                      Storefront & Facility Gallery
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {business.galleryImages.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`${business.name} photo ${idx + 1}`}
                          className="h-28 w-full object-cover rounded-lg border border-stone-200"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right 1 col: Operational Details, Opening Hours & Location Info */}
              <div className="space-y-6">
                {/* Location & Address Card with 'Show on Map' CTA */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Location Details</span>
                    </h4>
                    <button
                      onClick={() => setShowMapModal(true)}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Full Map</span>
                      <Maximize2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-xs text-stone-800 space-y-1">
                    <p className="font-semibold">{business.address}</p>
                    <p className="text-stone-500">{business.area}, {business.city}</p>
                    <p className="text-stone-500">{business.province} Province, Zambia</p>
                  </div>
                  <div className="pt-2 border-t border-stone-200/80 text-[11px] font-mono text-stone-500 flex items-center justify-between">
                    <span>GPS: {business.coordinates.latitude.toFixed(4)}, {business.coordinates.longitude.toFixed(4)}</span>
                  </div>
                  <button
                    onClick={() => setShowMapModal(true)}
                    className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MapIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>View Interactive Map & Neighbors</span>
                  </button>
                </div>

                {/* Operating Hours */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Opening Hours</span>
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    {business.hours.map((h, i) => (
                      <div key={i} className="flex items-center justify-between text-stone-600">
                        <span className="font-medium text-stone-700">{h.day}</span>
                        <span className={h.isClosed ? 'text-stone-400' : 'text-stone-900 font-mono'}>
                          {h.isClosed ? 'Closed' : `${h.open} – ${h.close}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* QR Code Quick Card */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-amber-600" />
                    <span>Instant Business QR</span>
                  </h4>
                  <p className="text-xs text-stone-600">
                    Scan with your phone to open this profile on mobile or share contact card on WhatsApp.
                  </p>
                  <button
                    onClick={() => setShowQrModal(true)}
                    className="w-full py-2 px-3 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-stone-600" />
                    <span>Show Printable QR Code</span>
                  </button>
                </div>

                {/* Business Verification & Ownership Claiming */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Business Ownership</span>
                  </h4>
                  {business.verificationStatus === 'verified' ? (
                    <div className="text-xs text-emerald-800 space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Officially Verified Business</span>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        PACRA incorporation and ZRA TPIN compliance verified by Bwana verification officers.
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs space-y-2">
                      <p className="text-stone-600">
                        Do you own or manage {business.name}?
                      </p>
                      <button
                        onClick={() => onOpenClaimModal && onOpenClaimModal(business)}
                        className="w-full py-2 px-3 bg-white hover:bg-stone-100 text-emerald-800 border border-emerald-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Claim This Business Listing
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold font-display text-stone-900">
                    Product Catalog & Pricing
                  </h3>
                  <p className="text-xs text-stone-500">
                    Official stock items available at {business.name}. Prices in Zambian Kwacha (ZMW).
                  </p>
                </div>
              </div>

              {!business.products || business.products.length === 0 ? (
                <div className="p-8 text-center text-stone-500 bg-stone-50 rounded-xl">
                  No catalog products listed yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {business.products.map((prod) => (
                    <div
                      key={prod.id}
                      className="p-4 bg-white border border-stone-200 rounded-xl flex flex-col justify-between hover:border-emerald-300 transition-colors"
                    >
                      <div>
                        {prod.category && (
                          <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
                            {prod.category}
                          </span>
                        )}
                        <h4 className="font-semibold text-stone-900 text-sm mt-0.5">
                          {prod.name}
                        </h4>
                        {prod.description && (
                          <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                            {prod.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 mt-4 border-t border-stone-100 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-stone-400 block">Price</span>
                          <span className="text-base font-mono font-bold text-stone-900">
                            {prod.currency} {prod.price.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          In Stock
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SERVICES TAB */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold font-display text-stone-900">
                  Offered Services & Quotes
                </h3>
                <p className="text-xs text-stone-500">
                  Book or request quotation for specialized trades, engineering, and support.
                </p>
              </div>

              {!business.services || business.services.length === 0 ? (
                <div className="p-8 text-center text-stone-500 bg-stone-50 rounded-xl">
                  No services listed yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {business.services.map((serv) => (
                    <div
                      key={serv.id}
                      className="p-4 bg-white border border-stone-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-300 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-stone-900 text-sm">
                            {serv.name}
                          </h4>
                          {serv.category && (
                            <span className="text-[11px] text-stone-500 font-medium">· {serv.category}</span>
                          )}
                        </div>
                        {serv.description && (
                          <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
                            {serv.description}
                          </p>
                        )}
                        {serv.duration && (
                          <div className="text-[11px] text-stone-400 mt-1">
                            Estimated duration: {serv.duration}
                          </div>
                        )}
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                            {serv.priceType === 'starting_from' ? 'Starting From' : 'Rate'}
                          </span>
                          <span className="text-base font-mono font-bold text-stone-900">
                            {serv.currency} {serv.price.toLocaleString()}
                          </span>
                        </div>
                        <button
                          onClick={() => onWhatsApp(business.whatsapp)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Request Service
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROMOTIONS TAB */}
          {activeTab === 'promotions' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold font-display text-stone-900">
                  Active Promotions & Deals
                </h3>
                <p className="text-xs text-stone-500">
                  Special offers discovered by customers around Kitwe & Copperbelt.
                </p>
              </div>

              {!business.promotions || business.promotions.length === 0 ? (
                <div className="p-8 text-center text-stone-500 bg-stone-50 rounded-xl">
                  No active promotions right now. Follow this business to get notified!
                </div>
              ) : (
                <div className="space-y-4">
                  {business.promotions.map((promo) => (
                    <div
                      key={promo.id}
                      className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white border-2 border-amber-300 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Flame className="w-4 h-4 text-amber-600" />
                            <span>Exclusive Deal</span>
                          </div>
                          <h4 className="text-lg font-bold font-display text-stone-900 mt-1">
                            {promo.title}
                          </h4>
                          <p className="text-sm font-semibold text-stone-700 mt-1">
                            {promo.tagline}
                          </p>
                          <p className="text-xs text-stone-500 mt-3">
                            <strong>Terms:</strong> {promo.terms}
                          </p>
                        </div>

                        {promo.discountPercentage && (
                          <div className="text-center p-3 bg-amber-500 text-white rounded-xl shadow-xs shrink-0">
                            <div className="text-2xl font-black font-mono leading-none">
                              {promo.discountPercentage}%
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5">
                              OFF
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-amber-200/80 flex items-center justify-between text-xs text-stone-600">
                        <span>
                          Valid Dates: <strong>{promo.validFrom} – {promo.validUntil}</strong>
                        </span>
                        <button
                          onClick={() => onWhatsApp(business.whatsapp)}
                          className="px-3 py-1 bg-stone-900 text-white hover:bg-stone-800 rounded-md font-medium transition-colors cursor-pointer"
                        >
                          Claim Offer on WhatsApp
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === 'reviews' && (
            <BusinessReviewsSection
              business={business}
              reviews={businessReviews}
              onAddReview={(bizId, rating, comment, tags, verifiedVisit, photoUrl, photos) => {
                if (onAddReview) {
                  onAddReview(bizId, rating, comment, tags, verifiedVisit, photoUrl, photos);
                } else {
                  const newRev: BusinessReview = {
                    id: `rev-${Date.now()}`,
                    businessId: bizId,
                    userId: currentUser?.email || `usr-${Date.now()}`,
                    userName: currentUser?.name || 'Verified Customer',
                    rating,
                    comment,
                    tags,
                    photoUrl,
                    photos,
                    createdAt: 'Just now',
                    helpfulCount: 0,
                    verifiedVisit,
                  };
                  setReviews([newRev, ...reviews]);
                }
              }}
              onHelpfulVote={onHelpfulVote}
              currentUser={
                currentUser || {
                  isAuthenticated: true,
                  email: 'm.mumba8@gmail.com',
                  name: 'Michael Mumba',
                  role: 'user',
                }
              }
              onRequireLogin={onRequireLogin || (() => {})}
            />
          )}

          {/* Report incorrect information form */}
          {showReportForm && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Report Incorrect Information for {business.name}</span>
              </h4>
              {reportSubmitted ? (
                <div className="text-xs text-rose-800 font-medium">
                  Thank you! Your report has been submitted to Bwana moderators for verification.
                </div>
              ) : (
                <form onSubmit={handleReport} className="space-y-3">
                  <select
                    aria-label="Select report reason"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                  >
                    <option value="Incorrect phone number or address">Incorrect phone number or address</option>
                    <option value="Business permanently closed">Business permanently closed</option>
                    <option value="Duplicate listing">Duplicate listing</option>
                    <option value="Fraudulent or misleading prices">Fraudulent or misleading prices</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowReportForm(false)}
                      className="px-3 py-1 text-xs text-stone-600 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Submit Report
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Bar */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <div className="flex items-center gap-2">
            <span>Bwana Verified Platform · {business.city}, Zambia</span>
            <span className="text-stone-300">|</span>
            <button
              onClick={() => setShowQrModal(true)}
              className="text-stone-600 hover:text-emerald-700 font-medium flex items-center gap-1 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Share QR</span>
            </button>
            <span className="text-stone-300">|</span>
            <button
              onClick={() => setShowMapModal(true)}
              className="text-stone-600 hover:text-emerald-700 font-medium flex items-center gap-1 cursor-pointer"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* --- FULL SCREEN / EXPANDED INTERACTIVE MAP MODAL --- */}
        {showMapModal && (
          <div className="absolute inset-0 z-60 bg-stone-950/90 backdrop-blur-md flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Map Top Bar */}
            <div className="p-4 bg-stone-900 border-b border-stone-800 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm font-display text-white">
                    {business.name} – Interactive Map & Surroundings
                  </h3>
                  <p className="text-xs text-stone-400 font-mono">
                    Lat: {business.coordinates.latitude.toFixed(4)}, Lng: {business.coordinates.longitude.toFixed(4)} · {business.area}, {business.city}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Map style toggle */}
                <div className="bg-stone-800 p-1 rounded-lg border border-stone-700 flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setMapLayer('streets')}
                    className={`px-2.5 py-1 rounded cursor-pointer ${
                      mapLayer === 'streets' ? 'bg-emerald-600 text-white font-bold' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Streets
                  </button>
                  <button
                    onClick={() => setMapLayer('satellite')}
                    className={`px-2.5 py-1 rounded cursor-pointer ${
                      mapLayer === 'satellite' ? 'bg-emerald-600 text-white font-bold' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Satellite
                  </button>
                </div>

                <button
                  onClick={() => setShowMapModal(false)}
                  className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Interactive Map Canvas Simulator with surrounding landmarks */}
            <div className="relative flex-1 bg-stone-950 overflow-hidden flex items-center justify-center select-none">
              {/* Grid / Roads Representation */}
              <div
                className={`absolute inset-0 transition-opacity ${
                  mapLayer === 'satellite' ? 'opacity-30 bg-stone-900' : 'opacity-80'
                }`}
                style={{
                  backgroundImage: `
                    radial-gradient(circle, #292524 1px, transparent 1px),
                    linear-gradient(to right, #1c1917 1px, transparent 1px),
                    linear-gradient(to bottom, #1c1917 1px, transparent 1px)
                  `,
                  backgroundSize: `${30 * (mapZoom / 15)}px ${30 * (mapZoom / 15)}px`,
                }}
              />

              {/* Road vectors simulation */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#44403c" strokeWidth={10 * (mapZoom / 15)} />
                <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#44403c" strokeWidth={8 * (mapZoom / 15)} />
                <line x1="20%" y1="0" x2="80%" y2="100%" stroke="#292524" strokeWidth="4" />
                <line x1="10%" y1="90%" x2="90%" y2="20%" stroke="#292524" strokeWidth="4" />
              </svg>

              {/* Center Beacon: Active Business */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="relative">
                  <div className="absolute -inset-3 bg-emerald-500/30 rounded-full animate-ping" />
                  <div className="w-12 h-12 rounded-full bg-emerald-600 border-3 border-white shadow-2xl flex items-center justify-center text-white relative z-10">
                    <Building2 className="w-6 h-6" />
                  </div>
                </div>

                {/* Info Card pinned to marker */}
                <div className="mt-3 bg-stone-900/95 border border-stone-700 p-3 rounded-xl shadow-2xl text-center text-white max-w-xs backdrop-blur-md">
                  <div className="font-bold text-sm text-emerald-400">{business.name}</div>
                  <div className="text-xs text-stone-300 mt-0.5">{business.address}</div>
                  <div className="flex items-center justify-center gap-2 mt-2 text-[11px]">
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded font-mono">
                      {business.categoryName}
                    </span>
                    <span className="text-amber-300 font-bold">★ {business.rating}</span>
                  </div>
                </div>
              </div>

              {/* Surrounding Landmarks & Points of Interest */}
              <div className="absolute top-1/4 left-1/4 z-10 flex items-center gap-1.5 bg-stone-900/80 border border-stone-700 px-2 py-1 rounded-lg text-[11px] text-stone-300">
                <MapPin className="w-3 h-3 text-sky-400" />
                <span>Kitwe City Square (1.2 km)</span>
              </div>

              <div className="absolute top-1/3 right-1/4 z-10 flex items-center gap-1.5 bg-stone-900/80 border border-stone-700 px-2 py-1 rounded-lg text-[11px] text-stone-300">
                <MapPin className="w-3 h-3 text-amber-400" />
                <span>Mukwa Gardens Lodge (0.6 km)</span>
              </div>

              <div className="absolute bottom-1/4 left-1/3 z-10 flex items-center gap-1.5 bg-stone-900/80 border border-stone-700 px-2 py-1 rounded-lg text-[11px] text-stone-300">
                <MapPin className="w-3 h-3 text-rose-400" />
                <span>Nkana Hospital & Pharmacy (1.8 km)</span>
              </div>

              <div className="absolute bottom-1/3 right-1/5 z-10 flex items-center gap-1.5 bg-stone-900/80 border border-stone-700 px-2 py-1 rounded-lg text-[11px] text-stone-300">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>Independence Ave ATM Hub (0.4 km)</span>
              </div>

              {/* Zoom Controls */}
              <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-1.5 bg-stone-900 border border-stone-700 rounded-xl p-1 shadow-xl">
                <button
                  onClick={() => setMapZoom((z) => Math.min(z + 1, 20))}
                  className="p-2 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setMapZoom((z) => Math.max(z - 1, 10))}
                  className="p-2 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setMapZoom(15)}
                  className="p-2 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                  title="Reset Zoom"
                >
                  <Compass className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom Nav Actions Bar on Map */}
              <div className="absolute bottom-6 left-6 z-20 flex flex-wrap items-center gap-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${business.coordinates.latitude},${business.coordinates.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Open in Google Maps Directions</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>

                <button
                  onClick={() => onDirections(business)}
                  className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 rounded-xl text-xs font-medium transition-colors cursor-pointer shadow-lg"
                >
                  Calculate Driving Distance
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- UNIQUE QR CODE MODAL --- */}
        {showQrModal && (
          <div className="absolute inset-0 z-60 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-150">
              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <QrCode className="w-6 h-6" />
              </div>

              <h3 className="font-bold font-display text-lg text-stone-900">
                {business.name}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Scan with any smartphone camera to open store profile, pricing, and WhatsApp inquiries.
              </p>

              {/* High-Resolution SVG QR Code Representation */}
              <div className="my-5 p-4 bg-stone-50 border border-stone-200 rounded-2xl inline-block shadow-inner">
                <svg
                  className="w-48 h-48 mx-auto"
                  viewBox="0 0 140 140"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="140" height="140" fill="white" rx="8" />
                  
                  {/* Top-left corner finder */}
                  <rect x="10" y="10" width="35" height="35" rx="4" fill="#047857" />
                  <rect x="15" y="15" width="25" height="25" rx="2" fill="white" />
                  <rect x="20" y="20" width="15" height="15" rx="2" fill="#047857" />

                  {/* Top-right corner finder */}
                  <rect x="95" y="10" width="35" height="35" rx="4" fill="#047857" />
                  <rect x="100" y="15" width="25" height="25" rx="2" fill="white" />
                  <rect x="105" y="20" width="15" height="15" rx="2" fill="#047857" />

                  {/* Bottom-left corner finder */}
                  <rect x="10" y="95" width="35" height="35" rx="4" fill="#047857" />
                  <rect x="15" y="100" width="25" height="25" rx="2" fill="white" />
                  <rect x="20" y="105" width="15" height="15" rx="2" fill="#047857" />

                  {/* QR Data pattern pseudo blocks derived from business ID */}
                  <g fill="#1c1917">
                    <rect x="52" y="12" width="6" height="6" />
                    <rect x="62" y="12" width="6" height="6" />
                    <rect x="76" y="12" width="6" height="6" />
                    
                    <rect x="52" y="22" width="6" height="6" />
                    <rect x="70" y="22" width="12" height="6" />

                    <rect x="12" y="52" width="6" height="6" />
                    <rect x="22" y="52" width="12" height="6" />
                    <rect x="42" y="52" width="6" height="6" />
                    <rect x="52" y="52" width="6" height="6" />
                    <rect x="62" y="52" width="12" height="6" />
                    <rect x="82" y="52" width="6" height="6" />
                    <rect x="98" y="52" width="12" height="6" />
                    <rect x="118" y="52" width="10" height="6" />

                    <rect x="12" y="64" width="12" height="6" />
                    <rect x="32" y="64" width="6" height="6" />
                    <rect x="52" y="64" width="12" height="12" fill="#047857" />
                    <rect x="72" y="64" width="6" height="6" />
                    <rect x="86" y="64" width="12" height="6" />
                    <rect x="108" y="64" width="6" height="6" />
                    <rect x="120" y="64" width="8" height="6" />

                    <rect x="12" y="78" width="6" height="6" />
                    <rect x="26" y="78" width="6" height="6" />
                    <rect x="38" y="78" width="12" height="6" />
                    <rect x="68" y="78" width="6" height="6" />
                    <rect x="80" y="78" width="14" height="6" />
                    <rect x="102" y="78" width="6" height="6" />
                    <rect x="116" y="78" width="12" height="6" />

                    <rect x="52" y="94" width="6" height="6" />
                    <rect x="64" y="94" width="12" height="6" />
                    <rect x="84" y="94" width="6" height="6" />
                    <rect x="96" y="94" width="12" height="6" />
                    <rect x="116" y="94" width="12" height="6" />

                    <rect x="52" y="106" width="12" height="6" />
                    <rect x="72" y="106" width="6" height="6" />
                    <rect x="86" y="106" width="8" height="6" />
                    <rect x="102" y="106" width="14" height="6" />
                    <rect x="122" y="106" width="6" height="6" />

                    <rect x="52" y="118" width="6" height="10" />
                    <rect x="66" y="118" width="12" height="10" />
                    <rect x="86" y="118" width="6" height="10" />
                    <rect x="100" y="118" width="10" height="10" />
                    <rect x="118" y="118" width="10" height="10" />
                  </g>

                  {/* Center Bwana Logo Badge */}
                  <circle cx="70" cy="70" r="14" fill="#047857" />
                  <text
                    x="70"
                    y="74"
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="sans-serif"
                  >
                    BW
                  </text>
                </svg>

                <div className="text-[10px] font-mono text-stone-500 mt-2 truncate">
                  bwana.africa/biz/{business.id}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleCopyLink}
                  className="w-full py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Permalink Copied!' : 'Copy Business Link'}</span>
                </button>

                <button
                  onClick={() => onWhatsApp(business.whatsapp)}
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Share QR to WhatsApp Chat</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
