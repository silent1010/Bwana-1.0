import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Store,
  Tag,
  Copy,
  Check,
  Heart,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Compass,
  ArrowRight
} from 'lucide-react';
import { getFollowingFeed, toggleFollow, isFollowing } from '../../services/followService';
import { BusinessPost, Business } from '../../types';

interface FollowingFeedProps {
  currentUserId?: string;
  allBusinesses: Business[];
  onSelectBusiness: (business: Business) => void;
  onOpenChatWithBusiness: (business: Business) => void;
  onNavigateToDiscovery: () => void;
}

export const FollowingFeed: React.FC<FollowingFeedProps> = ({
  currentUserId = 'current_user',
  allBusinesses,
  onSelectBusiness,
  onOpenChatWithBusiness,
  onNavigateToDiscovery,
}) => {
  const [posts, setPosts] = useState<BusinessPost[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const refreshPosts = () => {
    setPosts(getFollowingFeed(currentUserId));
  };

  useEffect(() => {
    refreshPosts();
    const handleUpdate = () => refreshPosts();
    window.addEventListener('bwana_follows_updated', handleUpdate);
    window.addEventListener('bwana_posts_updated', handleUpdate);
    return () => {
      window.removeEventListener('bwana_follows_updated', handleUpdate);
      window.removeEventListener('bwana_posts_updated', handleUpdate);
    };
  }, [currentUserId]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleToggleLike = (postId: string) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const filteredPosts = posts.filter((p) => {
    if (filterType === 'all') return true;
    return p.type === filterType;
  });

  // Recommended businesses to follow
  const recommendedToFollow = allBusinesses.slice(0, 4);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Feed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white font-display tracking-tight">
              Following Feed
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Live Updates
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
            Exclusive product drops, flash discounts, and operational announcements from verified Zambian merchants you follow.
          </p>
        </div>

        {/* Filter Segmented Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-2xl overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Updates' },
            { id: 'promotion', label: 'Deals & Offers' },
            { id: 'new_product', label: 'New Arrivals' },
            { id: 'announcement', label: 'Notices' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recommended Follows Carousel Bar */}
      <div className="bg-stone-50 dark:bg-stone-900/60 rounded-3xl p-4 border border-stone-200/80 dark:border-stone-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Discover Top Merchants to Follow</span>
          </div>
          <button
            onClick={onNavigateToDiscovery}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Explore all directory
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {recommendedToFollow.map((biz) => {
            const following = isFollowing(currentUserId, biz.id);
            return (
              <div
                key={biz.id}
                className="p-3 bg-white dark:bg-stone-800/90 rounded-2xl border border-stone-200 dark:border-stone-700/80 flex flex-col justify-between space-y-2.5"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 overflow-hidden shrink-0 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center">
                    {biz.logoUrl ? (
                      <img src={biz.logoUrl} alt={biz.name} className="w-full h-full object-cover" />
                    ) : (
                      <Store className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate leading-tight">
                      {biz.name}
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                      {biz.categoryName} · {biz.city}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-stone-100 dark:border-stone-700/60">
                  <button
                    onClick={() => {
                      toggleFollow(currentUserId, biz.id);
                      refreshPosts();
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      following
                        ? 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-200'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {following ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => onSelectBusiness(biz)}
                    className="p-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                    title="View Profile"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Posts Stream */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-3">
            <Compass className="w-10 h-10 text-stone-400 mx-auto opacity-40" />
            <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">No updates in this channel yet</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Follow more local hardware stores, farmers, food artisans, and service providers to get daily deals and inventory drops right here.
            </p>
            <button
              onClick={onNavigateToDiscovery}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition-colors cursor-pointer"
            >
              Browse Bwana Directory
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const biz = allBusinesses.find((b) => b.id === post.businessId);
            const isLiked = likedPosts[post.id];
            const currentLikes = (post.likesCount || 0) + (isLiked ? 1 : 0);

            return (
              <article
                key={post.id}
                className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden hover:border-emerald-500/40 transition-all duration-200"
              >
                {/* Post Author / Header */}
                <div className="p-4 sm:p-5 flex items-center justify-between border-b border-stone-100 dark:border-stone-800/80">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => biz && onSelectBusiness(biz)}
                      className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 overflow-hidden shrink-0 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center cursor-pointer"
                    >
                      {post.businessLogo ? (
                        <img src={post.businessLogo} alt={post.businessName} className="w-full h-full object-cover" />
                      ) : (
                        <Store className="w-5 h-5 text-emerald-600" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => biz && onSelectBusiness(biz)}
                          className="font-bold text-sm text-stone-900 dark:text-stone-100 hover:text-emerald-600 transition-colors cursor-pointer text-left"
                        >
                          {post.businessName}
                        </button>
                        <span title="Verified Zambian Merchant" className="inline-flex items-center">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        <span>{post.businessCity}</span>
                        <span>·</span>
                        <span className="font-mono">
                          {new Date(post.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Post Type Pill */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                        post.type === 'promotion' || post.type === 'flash_sale'
                          ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                          : post.type === 'new_product'
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      {post.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-4 sm:p-5 space-y-3">
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>

                  {/* Optional Featured Image */}
                  {post.imageUrl && (
                    <div className="rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 max-h-80 w-full mt-2 bg-stone-100 dark:bg-stone-950">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-101 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Promotion Deal Voucher Card */}
                  {post.discountCode && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 font-black text-xs">
                          <Tag className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                            {post.discountPercentage ? `${post.discountPercentage}% OFF` : 'Exclusive Follower Deal'}
                          </div>
                          <div className="text-[11px] text-amber-700 dark:text-amber-400 font-mono">
                            Use code: <span className="font-bold underline">{post.discountCode}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopyCode(post.discountCode!)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-amber-100 transition-colors cursor-pointer shrink-0"
                      >
                        {copiedCode === post.discountCode ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Voucher Code</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Post Footer Actions */}
                <div className="px-4 py-3 bg-stone-50/80 dark:bg-stone-950/60 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isLiked ? 'text-rose-600 font-bold' : 'text-stone-500 hover:text-rose-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{currentLikes}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (biz) onOpenChatWithBusiness(biz);
                      }}
                      className="flex items-center gap-1.5 text-stone-500 hover:text-emerald-600 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Chat with Merchant</span>
                    </button>
                  </div>

                  {biz && (
                    <button
                      onClick={() => onSelectBusiness(biz)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer text-xs"
                    >
                      <span>Visit Storefront</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
