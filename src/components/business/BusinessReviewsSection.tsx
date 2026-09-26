import React, { useState, useMemo } from 'react';
import {
  Star,
  CheckCircle,
  ThumbsUp,
  AlertTriangle,
  Send,
  MessageSquare,
  ShieldCheck,
  Filter,
  User,
  Sparkles,
  ArrowRight,
  Check,
  CornerDownRight,
  LogIn
} from 'lucide-react';
import { Business, BusinessReview, UserRole } from '../../types';

interface BusinessReviewsSectionProps {
  business: Business;
  reviews: BusinessReview[];
  onAddReview: (
    businessId: string,
    rating: number,
    comment: string,
    tags: string[],
    verifiedVisit: boolean
  ) => void;
  onHelpfulVote?: (reviewId: string) => void;
  currentUser: {
    isAuthenticated: boolean;
    email: string;
    name: string;
    role: UserRole;
  };
  onRequireLogin: () => void;
}

const REVIEW_TAGS = [
  'Prompt Delivery',
  'Fair Kwacha Pricing',
  'Authentic Materials',
  'Knowledgeable Staff',
  'Great Customer Service',
  'Fast WhatsApp Response',
  'Quality Workmanship',
  'Clean Premises'
];

export const BusinessReviewsSection: React.FC<BusinessReviewsSectionProps> = ({
  business,
  reviews,
  onAddReview,
  onHelpfulVote,
  currentUser,
  onRequireLogin,
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Authentic Materials', 'Fair Kwacha Pricing']);
  const [verifiedVisit, setVerifiedVisit] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterRating, setFilterRating] = useState<'all' | '5' | '4' | '3_and_below' | 'has_response'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'helpful'>('newest');
  const [votedHelpful, setVotedHelpful] = useState<Record<string, boolean>>({});
  const [showReportModal, setShowReportModal] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('Offensive or abusive language');
  const [reportedReviews, setReportedReviews] = useState<Record<string, boolean>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Dynamic distribution calculations
  const distribution = useMemo(() => {
    const total = reviews.length;
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const clamped = Math.max(1, Math.min(5, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      counts[clamped] = (counts[clamped] || 0) + 1;
    });

    return {
      total,
      counts,
      percentages: {
        5: total > 0 ? Math.round((counts[5] / total) * 100) : 0,
        4: total > 0 ? Math.round((counts[4] / total) * 100) : 0,
        3: total > 0 ? Math.round((counts[3] / total) * 100) : 0,
        2: total > 0 ? Math.round((counts[2] / total) * 100) : 0,
        1: total > 0 ? Math.round((counts[1] / total) * 100) : 0,
      },
      recommendedPercent:
        total > 0 ? Math.round(((counts[5] + counts[4]) / total) * 100) : 100,
    };
  }, [reviews]);

  // Filtered and sorted reviews
  const displayedReviews = useMemo(() => {
    let result = [...reviews];

    if (filterRating === '5') {
      result = result.filter((r) => r.rating === 5);
    } else if (filterRating === '4') {
      result = result.filter((r) => r.rating === 4);
    } else if (filterRating === '3_and_below') {
      result = result.filter((r) => r.rating <= 3);
    } else if (filterRating === 'has_response') {
      result = result.filter((r) => Boolean(r.response));
    }

    if (sortBy === 'newest') {
      // keep original or ID reverse
      result.sort((a, b) => (b.id.localeCompare(a.id)));
    } else if (sortBy === 'highest') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'helpful') {
      result.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
    }

    return result;
  }, [reviews, filterRating, sortBy]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleRatingHover = (star: number) => {
    setHoverRating(star);
  };

  const handleRatingLeave = () => {
    setHoverRating(0);
  };

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1:
        return '★☆☆☆☆ · Poor Experience';
      case 2:
        return '★★☆☆☆ · Below Expectations';
      case 3:
        return '★★★☆☆ · Average / Satisfactory';
      case 4:
        return '★★★★☆ · Very Good / Recommended';
      case 5:
        return '★★★★★ · Exceptional / Highly Recommended';
      default:
        return 'Select your rating';
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser.isAuthenticated) {
      onRequireLogin();
      return;
    }
    if (!comment.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onAddReview(
        business.id,
        selectedRating,
        comment.trim(),
        selectedTags,
        verifiedVisit
      );
      setComment('');
      setSelectedTags(['Fair Kwacha Pricing']);
      setIsSubmitting(false);
      setShowReviewForm(false);
      setSuccessMessage('✓ Review published successfully! Your rating has updated the merchant profile.');
      setTimeout(() => setSuccessMessage(null), 5000);
    }, 300);
  };

  const handleHelpfulClick = (revId: string) => {
    if (votedHelpful[revId]) return;
    setVotedHelpful((prev) => ({ ...prev, [revId]: true }));
    if (onHelpfulVote) {
      onHelpfulVote(revId);
    }
  };

  const handleReportConfirm = (revId: string) => {
    setReportedReviews((prev) => ({ ...prev, [revId]: true }));
    setShowReportModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl flex items-center justify-between text-xs font-semibold shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-200 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-200 hover:text-white px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Unauthenticated User Callout Banner */}
      {!currentUser.isAuthenticated && (
        <div className="p-4 bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-900 text-white rounded-2xl border border-emerald-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
              <LogIn className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-sm text-stone-100 flex items-center gap-2">
                <span>Have you transacted with {business.name}?</span>
                <span className="text-[10px] uppercase font-mono bg-emerald-900/80 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-700/60">
                  Customer Reviews
                </span>
              </p>
              <p className="text-stone-300 text-xs mt-0.5">
                Sign in to leave a star rating, share Kwacha pricing transparency, and post verified feedback.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRequireLogin}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In to Review</span>
          </button>
        </div>
      )}

      {/* 1. RATING SUMMARY & DISTRIBUTION HERO CARD */}
      <div className="p-6 bg-stone-50 border border-stone-200 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Aggregate Score */}
          <div className="flex items-center gap-5">
            <div className="text-center sm:text-left">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold font-mono text-stone-900 tracking-tight">
                  {business.rating.toFixed(1)}
                </span>
                <span className="text-stone-400 font-bold text-lg">/ 5.0</span>
              </div>

              <div className="flex items-center gap-1 text-amber-400 my-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(business.rating) ? 'fill-amber-400' : 'text-stone-300'
                    }`}
                  />
                ))}
              </div>

              <div className="text-xs text-stone-500">
                Based on <strong className="text-stone-800">{business.reviewsCount}</strong> verified ratings
              </div>
            </div>

            <div className="hidden sm:block h-16 w-px bg-stone-200" />

            <div className="hidden sm:block text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{distribution.recommendedPercent}% of customers recommend this merchant</span>
              </div>
              <p className="text-stone-500 text-[11px]">
                Authentic reviews from clients across {business.city} and Copperbelt.
              </p>
            </div>
          </div>

          {/* Call to Action: Write a review */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {showReviewForm ? (
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Review Form
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!currentUser.isAuthenticated) {
                    onRequireLogin();
                  } else {
                    setShowReviewForm(true);
                  }
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Star className="w-4 h-4 fill-white" />
                <span>Write a Customer Review</span>
              </button>
            )}
          </div>
        </div>

        {/* 5-Star Distribution Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-stone-200 text-xs">
          {([5, 4, 3, 2, 1] as const).map((starNum) => {
            const pct = distribution.percentages[starNum];
            const count = distribution.counts[starNum];
            return (
              <button
                key={starNum}
                type="button"
                onClick={() =>
                  setFilterRating(filterRating === String(starNum) ? 'all' : (String(starNum) as any))
                }
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  filterRating === String(starNum)
                    ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-400'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-semibold text-stone-700 mb-1">
                  <span className="flex items-center gap-1">
                    <span>{starNum}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                  </span>
                  <span className="font-mono text-stone-500">{count}</span>
                </div>
                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-[10px] text-stone-400 mt-1 text-right font-mono">
                  {pct}%
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ADD REVIEW FORM (Interactive Form for Logged-in Users) */}
      {showReviewForm && (
        <form
          onSubmit={handleSubmitReview}
          className="p-6 bg-white border-2 border-emerald-500/80 rounded-2xl shadow-lg space-y-5 animate-in fade-in"
        >
          {/* User Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                {currentUser.name ? currentUser.name[0] : 'U'}
              </div>
              <div>
                <span className="font-semibold text-stone-900 block">
                  Posting as {currentUser.name || 'Verified Customer'}
                </span>
                <span className="text-stone-400 text-[11px]">
                  Account: {currentUser.email}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-medium bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 self-start sm:self-auto">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Customer Review</span>
            </div>
          </div>

          {/* Interactive Star Rating Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider">
              Your Overall Rating *
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-1.5" onMouseLeave={handleRatingLeave}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const activeStar = hoverRating ? star <= hoverRating : star <= selectedRating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => handleRatingHover(star)}
                      onClick={() => setSelectedRating(star)}
                      className="p-1 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                      title={`${star} Star`}
                    >
                      <Star
                        className={`w-7 h-7 ${
                          activeStar
                            ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                            : 'text-stone-300 hover:text-amber-200'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <span className="text-xs font-bold font-mono text-stone-700 bg-stone-100 px-3 py-1 rounded-lg">
                {getRatingLabel(hoverRating || selectedRating)}
              </span>
            </div>
          </div>

          {/* Experience Highlight Tags */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider">
              What Stood Out? (Optional Highlight Badges)
            </label>
            <div className="flex flex-wrap gap-2">
              {REVIEW_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Text Review Feedback */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider">
              Your Written Review & Feedback *
            </label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Share details about your order, pricing in Zambian Kwacha (ZMW), staff assistance, or physical pickup in ${business.city}...`}
              className="w-full px-4 py-3 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-emerald-600 transition-colors leading-relaxed"
            />
            <div className="flex items-center justify-between text-[11px] text-stone-400">
              <span>Be constructive and specific to help other Zambian buyers.</span>
              <span className="font-mono">{comment.length} characters</span>
            </div>
          </div>

          {/* Verified visit confirmation checkbox */}
          <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={verifiedVisit}
              onChange={(e) => setVerifiedVisit(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300"
            />
            <span>I confirm this feedback is based on my genuine experience with this business.</span>
          </label>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !comment.trim()}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-300 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Publishing...' : 'Publish Customer Review'}</span>
            </button>
          </div>
        </form>
      )}

      {/* 3. FILTERS & SORT CONTROLS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200 text-xs">
        {/* Rating Category Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-stone-400 font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <button
            onClick={() => setFilterRating('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              filterRating === 'all'
                ? 'bg-stone-900 text-white font-bold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            All Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setFilterRating('5')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              filterRating === '5'
                ? 'bg-stone-900 text-white font-bold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            5 Stars ({distribution.counts[5]})
          </button>
          <button
            onClick={() => setFilterRating('4')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              filterRating === '4'
                ? 'bg-stone-900 text-white font-bold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            4 Stars ({distribution.counts[4]})
          </button>
          <button
            onClick={() => setFilterRating('has_response')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              filterRating === 'has_response'
                ? 'bg-stone-900 text-white font-bold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            With Owner Response
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-stone-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 font-medium focus:outline-none"
          >
            <option value="newest">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* 4. REVIEWS LIST */}
      <div className="space-y-4">
        {displayedReviews.length === 0 ? (
          <div className="p-10 text-center bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
            <MessageSquare className="w-8 h-8 text-stone-400 mx-auto" />
            <h4 className="text-sm font-bold text-stone-800">No Reviews Matching Selected Filter</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Be the first customer to share your experience with {business.name}.
            </p>
            <button
              onClick={() => {
                if (!currentUser.isAuthenticated) {
                  onRequireLogin();
                } else {
                  setShowReviewForm(true);
                  setFilterRating('all');
                }
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Write First Review
            </button>
          </div>
        ) : (
          displayedReviews.map((rev) => {
            const hasVoted = votedHelpful[rev.id];
            const isReported = reportedReviews[rev.id];

            return (
              <div
                key={rev.id}
                className="p-5 bg-white border border-stone-200 rounded-2xl space-y-3.5 shadow-2xs hover:border-stone-300 transition-colors"
              >
                {/* Reviewer Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-stone-800 to-stone-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {rev.userName[0]?.toUpperCase() || 'C'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-xs sm:text-sm">
                          {rev.userName}
                        </span>
                        {rev.verifiedVisit && (
                          <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" />
                            <span>Verified Customer</span>
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-stone-400 flex items-center gap-2 mt-0.5">
                        <span>{rev.userLocation || `${business.city}, Zambia`}</span>
                        <span>·</span>
                        <span>{rev.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stars Display */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-mono font-bold text-stone-700">
                      {rev.rating}.0
                    </span>
                  </div>
                </div>

                {/* Experience Highlight Badges */}
                {rev.tags && rev.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pl-0 sm:pl-12">
                    {rev.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium text-emerald-800 bg-emerald-50/70 border border-emerald-200/60 px-2 py-0.5 rounded-md"
                      >
                        ✓ {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Review Body */}
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed pl-0 sm:pl-12">
                  "{rev.comment}"
                </p>

                {/* Official Business Owner Response Block (PRD Section 10) */}
                {rev.response && (
                  <div className="ml-0 sm:ml-12 p-4 bg-stone-50 rounded-xl border-l-3 border-emerald-600 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <CornerDownRight className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Response from {rev.response.responderName}</span>
                      </span>
                      <span className="text-stone-400 font-mono">{rev.response.respondedAt}</span>
                    </div>
                    <p className="text-stone-600 leading-relaxed text-xs">
                      {rev.response.comment}
                    </p>
                  </div>
                )}

                {/* Review Actions: Helpful count & Report */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs pl-0 sm:pl-12">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleHelpfulClick(rev.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-[11px] ${
                        hasVoted
                          ? 'bg-emerald-50 text-emerald-800 font-semibold'
                          : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
                      }`}
                      title="Mark review as helpful"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>
                        Helpful ({rev.helpfulCount + (hasVoted ? 1 : 0)})
                      </span>
                    </button>
                    {hasVoted && (
                      <span className="text-[10px] text-emerald-600 font-medium">
                        Thanks for your feedback!
                      </span>
                    )}
                  </div>

                  {isReported ? (
                    <span className="text-[11px] text-stone-400 italic">Reported for review</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowReportModal(rev.id)}
                      className="text-[11px] text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      Report
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Report Review Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-stone-200 space-y-4 shadow-xl text-xs">
            <div className="flex items-center gap-2 text-rose-600 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-stone-900">Report Review to Moderation</span>
            </div>
            <p className="text-stone-500 leading-relaxed">
              Help maintain a high-trust Zambian directory. Why is this review inappropriate?
            </p>

            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-800"
            >
              <option value="Offensive or abusive language">Offensive or abusive language</option>
              <option value="Suspected competitor or fake review">Suspected competitor or fake review</option>
              <option value="Spam or promotional advertising">Spam or promotional advertising</option>
              <option value="Review describes wrong business">Review describes wrong business</option>
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReportModal(null)}
                className="px-3 py-1.5 text-stone-600 hover:text-stone-900 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReportConfirm(showReportModal)}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold cursor-pointer"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
