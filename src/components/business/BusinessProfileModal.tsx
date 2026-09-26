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
  MapPin
} from 'lucide-react';
import { Business, BusinessProduct, BusinessService, BusinessReview, UserRole } from '../../types';
import { INITIAL_REVIEWS } from '../../data/mockData';
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
    verifiedVisit: boolean
  ) => void;
  onHelpfulVote?: (reviewId: string) => void;
  currentUser?: {
    isAuthenticated: boolean;
    email: string;
    name: string;
    role: UserRole;
  };
  onRequireLogin?: () => void;
}

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
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'services' | 'promotions' | 'reviews'>('overview');
  const [reviews, setReviews] = useState<BusinessReview[]>(INITIAL_REVIEWS);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('Incorrect phone number or address');

  const businessReviews = useMemo(() => {
    if (!business) return [];
    const source = allReviews || reviews;
    return source.filter((r) => r.businessId === business.id);
  }, [allReviews, reviews, business]);

  if (!isOpen || !business) return null;

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitted(true);
    setTimeout(() => {
      setShowReportForm(false);
      setReportSubmitted(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Visual Cover & Header Banner */}
        <div className="relative h-64 sm:h-72 bg-stone-900 shrink-0 overflow-hidden">
          <img
            src={business.coverImage}
            alt={business.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-black/30" />

          {/* Top Actions */}
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
              {onToggleSave && (
                <button
                  onClick={() => onToggleSave(business.id)}
                  className={`p-2 rounded-full backdrop-blur-xs transition-colors ${
                    isSaved
                      ? 'bg-amber-500 text-white'
                      : 'bg-stone-900/70 text-white hover:bg-stone-900'
                  }`}
                  title="Save business"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-stone-900/70 text-white hover:bg-stone-900 transition-colors"
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
                
                {/* Clean unboxed metadata */}
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-stone-300 mt-1">
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className="font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer transition-colors"
                    title="View reviews and ratings"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-300" />
                    <span>{business.rating.toFixed(1)} ({businessReviews.length || business.reviewsCount} reviews)</span>
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
                      <span className="font-mono text-emerald-300 font-semibold">{business.distanceKm} km away</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2.5 py-1 rounded font-medium ${
                  business.isOpenNow
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-stone-800 text-stone-400'
                }`}>
                  {business.isOpenNow ? 'OPEN NOW' : 'CLOSED NOW'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action Bar (PRD Section 8: Call, WhatsApp, Directions, Save) */}
        <div className="bg-stone-50 border-b border-stone-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <button
              onClick={() => onCall(business.phone)}
              className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Call {business.phone}</span>
            </button>

            <button
              onClick={() => onWhatsApp(business.whatsapp)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
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
              onClick={() => setShowReportForm(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-stone-500 hover:text-stone-800 text-xs transition-colors ml-auto cursor-pointer"
              title="Report incorrect information"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Report Info</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-stone-200 bg-white flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Overview & About
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
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
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
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
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
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
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
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
              {/* Left 2 cols: About & Details */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                    About {business.name}
                  </h4>
                  <p className="text-sm text-stone-700 leading-relaxed">
                    {business.description}
                  </p>
                </div>

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
                      <span>Valid: {business.promotions[0].validFrom} – {business.promotions[0].validUntil}</span>
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
                        className="text-xs text-emerald-700 font-semibold hover:underline"
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
                {/* Location & Address Card */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Location Details</span>
                  </h4>
                  <div className="text-xs text-stone-800 space-y-1">
                    <p className="font-semibold">{business.address}</p>
                    <p className="text-stone-500">{business.area}, {business.city}</p>
                    <p className="text-stone-500">{business.province} Province, Zambia</p>
                  </div>
                  <div className="pt-2 border-t border-stone-200/80 text-[11px] font-mono text-stone-500">
                    GPS: {business.coordinates.latitude.toFixed(4)}, {business.coordinates.longitude.toFixed(4)}
                  </div>
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

                {/* Business Verification & Ownership Claiming (PRD Section 9) */}
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

          {/* PRODUCTS TAB (PRD Section 12) */}
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

          {/* SERVICES TAB (PRD Section 12) */}
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
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
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

          {/* PROMOTIONS TAB (PRD Section 13) */}
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
                        <span>Valid Dates: <strong>{promo.validFrom} – {promo.validUntil}</strong></span>
                        <button
                          onClick={() => onWhatsApp(business.whatsapp)}
                          className="px-3 py-1 bg-stone-900 text-white hover:bg-stone-800 rounded-md font-medium transition-colors"
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

          {/* REVIEWS TAB (PRD Section 10) */}
          {activeTab === 'reviews' && (
            <BusinessReviewsSection
              business={business}
              reviews={businessReviews}
              onAddReview={(bizId, rating, comment, tags, verifiedVisit) => {
                if (onAddReview) {
                  onAddReview(bizId, rating, comment, tags, verifiedVisit);
                } else {
                  const newRev: BusinessReview = {
                    id: `rev-${Date.now()}`,
                    businessId: bizId,
                    userId: currentUser?.email || `usr-${Date.now()}`,
                    userName: currentUser?.name || 'Verified Customer',
                    rating,
                    comment,
                    tags,
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
                  role: 'customer',
                }
              }
              onRequireLogin={onRequireLogin || (() => {})}
            />
          )}

          {/* Report incorrect information form modal */}
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
                      className="px-3 py-1 text-xs text-stone-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold"
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
          <span>Bwana Verified Platform · Kitwe & Lusaka, Zambia</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
