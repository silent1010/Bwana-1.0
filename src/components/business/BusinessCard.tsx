import React from 'react';
import {
  Phone,
  MessageSquare,
  Navigation,
  Bookmark,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';
import { Business } from '../../types';

interface BusinessCardProps {
  business: Business;
  onSelect: (biz: Business) => void;
  onCall: (phone: string, e: React.MouseEvent) => void;
  onWhatsApp: (whatsapp: string, e: React.MouseEvent) => void;
  onDirections: (biz: Business, e: React.MouseEvent) => void;
  isSaved?: boolean;
  onToggleSave?: (bizId: string, e: React.MouseEvent) => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  onSelect,
  onCall,
  onWhatsApp,
  onDirections,
  isSaved = false,
  onToggleSave,
}) => {
  return (
    <div
      onClick={() => onSelect(business)}
      className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl overflow-hidden hover:border-emerald-500/80 hover:shadow-xl dark:hover:border-emerald-500/60 transition-all duration-200 flex flex-col cursor-pointer group"
    >
      {/* Visual Header / Cover Image */}
      <div className="relative aspect-16/9 bg-stone-100 dark:bg-stone-800 overflow-hidden">
        <img
          src={business.coverImage}
          alt={business.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
        />
        
        {/* Subtle top & bottom scrims */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-black/30" />

        {/* Distance Indicator in top right */}
        {business.distanceKm !== undefined && (
          <div className="absolute top-3 right-3 bg-stone-950/85 backdrop-blur-md text-emerald-300 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 shadow-xs">
            {business.distanceKm} km away
          </div>
        )}

        {/* Save button in top left */}
        {onToggleSave && (
          <button
            onClick={(e) => onToggleSave(business.id, e)}
            className={`absolute top-3 left-3 p-2 rounded-full backdrop-blur-md transition-all ${
              isSaved
                ? 'bg-amber-500 text-stone-950 shadow-md scale-105'
                : 'bg-stone-950/65 text-stone-200 hover:text-white hover:bg-stone-950 border border-white/10'
            }`}
            title="Save business"
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Bottom overlay: Name & Verification */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-bold text-base font-display text-white tracking-tight truncate">
              {business.name}
            </h3>
            {business.verificationTier === 'community_verified' ? (
              <span
                className="shrink-0 text-[10px] font-semibold bg-stone-900/90 text-stone-300 border border-stone-700 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs"
                title="Community Verified by local Bwana Scouts & Neighbors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                Scout Verified
              </span>
            ) : business.verificationStatus === 'verified' || business.verificationTier === 'bwana_verified' ? (
              <span
                className="shrink-0 text-[10px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs"
                title="Bwana Verified Business (PACRA & ZRA TPIN certified)"
              >
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                Verified Merchant
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone-200 mt-0.5">
            <span className="font-bold text-amber-400">★ {business.rating}</span>
            <span className="text-stone-300">({business.reviewsCount} reviews)</span>
            <span className="text-stone-400">·</span>
            <span className="truncate">{business.area}, {business.city}</span>
          </div>
        </div>
      </div>

      {/* Body: Zero-pill metadata & description */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Unboxed Metadata line with typographic separators */}
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-2 flex-wrap">
            <span className="font-semibold text-stone-800 dark:text-stone-200">{business.categoryName}</span>
            <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">·</span>
            <span className={`font-semibold ${business.isOpenNow ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-400 dark:text-stone-500'}`}>
              {business.isOpenNow ? 'Open Now' : 'Closed'}
            </span>
            {business.isWholesaler && (
              <>
                <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">·</span>
                <span className="text-amber-800 dark:text-amber-300 font-bold bg-amber-100/90 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 px-1.5 py-0.2 rounded text-[10px]">Wholesale Restock Hub</span>
              </>
            )}
            {business.isKantemba && (
              <>
                <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">·</span>
                <span className="text-sky-800 dark:text-sky-300 font-bold bg-sky-100/90 dark:bg-sky-950/70 border border-sky-300 dark:border-sky-800 px-1.5 py-0.2 rounded text-[10px]">Compound Kantemba</span>
              </>
            )}
            <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">·</span>
            <span className="truncate text-stone-400">{business.address}</span>
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
            {business.tagline}
          </p>

          {/* Business Attributes / Feature tags preview */}
          {business.tags && business.tags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {business.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium border border-stone-200/60 dark:border-stone-700/60"
                >
                  {tag}
                </span>
              ))}
              {business.tags.length > 3 && (
                <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono self-center">
                  +{business.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Promotional snippet if active */}
          {business.promotions && business.promotions.length > 0 && (
            <div className="mt-2.5 text-[11px] text-amber-950 dark:text-amber-200 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800 rounded-xl px-2.5 py-1.5 flex items-center justify-between">
              <span className="font-semibold truncate">{business.promotions[0].title}</span>
              <span className="font-mono font-bold text-amber-800 dark:text-amber-400 ml-2 shrink-0">
                {business.promotions[0].discountPercentage}% OFF
              </span>
            </div>
          )}
        </div>

        {/* Stitch Quick Action Button Row */}
        <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between gap-2">
          <button
            onClick={(e) => onCall(business.phone, e)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
            title="Call business"
          >
            <Phone className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
            <span>Call</span>
          </button>

          <button
            onClick={(e) => onWhatsApp(business.whatsapp, e)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            title="Chat on WhatsApp"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={(e) => onDirections(business, e)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
            title="Directions"
          >
            <Navigation className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
            <span>Map</span>
          </button>
        </div>
      </div>
    </div>
  );
};
