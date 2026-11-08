import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquare,
  Building2,
  Clock,
  ChevronRight,
  Search,
  ShieldCheck
} from 'lucide-react';
import { Business, ChatConversation, UserAccount } from '../../types';
import { subscribeToUserConversations } from '../../services/firebase';

interface UserConversationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  businesses: Business[];
  onSelectConversation: (business: Business) => void;
}

export const UserConversationsDrawer: React.FC<UserConversationsDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  businesses,
  onSelectConversation
}) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [searchFilter, setSearchFilter] = useState('');

  const effectiveUserId = React.useMemo(() => {
    if (currentUser?.id) return currentUser.id;
    return localStorage.getItem('bwana_chat_guest_id') || '';
  }, [currentUser]);

  useEffect(() => {
    if (!isOpen || !effectiveUserId) return;

    const unsubscribe = subscribeToUserConversations(effectiveUserId, (convos) => {
      setConversations(convos);
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen, effectiveUserId]);

  if (!isOpen) return null;

  const filteredConversations = conversations.filter((c) => {
    if (!searchFilter.trim()) return true;
    const query = searchFilter.toLowerCase();
    return (
      c.businessName.toLowerCase().includes(query) ||
      c.lastMessage.toLowerCase().includes(query) ||
      c.businessCity?.toLowerCase().includes(query)
    );
  });

  const handleOpenChat = (convo: ChatConversation) => {
    // Find business in businesses list or reconstruct minimal business
    const found = businesses.find((b) => b.id === convo.businessId);
    if (found) {
      onSelectConversation(found);
    } else {
      // Reconstruct minimal business
      const fallbackBiz: Business = {
        id: convo.businessId,
        name: convo.businessName,
        tagline: '',
        description: 'Direct Chat Merchant',
        categoryName: 'General Business',
        categoryId: 'cat-retail',
        address: convo.businessArea || 'Zambia',
        area: convo.businessArea || '',
        city: convo.businessCity || 'Lusaka',
        coordinates: { latitude: -15.4167, longitude: 28.2833 },
        phone: convo.businessPhone || '',
        whatsapp: '',
        email: '',
        website: '',
        province: 'Lusaka',
        rating: 4.8,
        reviewsCount: 1,
        verificationStatus: 'verified',
        verificationTier: 'bwana_verified',
        isOpenNow: convo.businessIsOpenNow ?? true,
        hours: [
          { day: 'Monday - Friday', open: '08:00', close: '18:00', isOpen: true },
          { day: 'Saturday', open: '08:00', close: '14:00', isOpen: true }
        ],
        coverImage: convo.businessLogo || 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
        galleryImages: [],
        photos: convo.businessLogo ? [convo.businessLogo] : [],
        logoUrl: convo.businessLogo,
        products: [],
        services: [],
        tags: []
      };
      onSelectConversation(fallbackBiz);
    }
    onClose();
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const now = new Date();
      if (d.toDateString() === now.toDateString()) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white dark:bg-stone-900 w-full max-w-md h-full shadow-2xl flex flex-col border-l border-stone-200 dark:border-stone-800 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 dark:text-white text-base">Direct Messages</h2>
              <p className="text-[11px] text-stone-500">In-app chats with Zambian businesses & clinics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-stone-400 flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                {conversations.length === 0 ? 'No messages yet' : 'No matching chats found'}
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-xs leading-relaxed">
                {conversations.length === 0
                  ? 'Click "Chat with Business" on any hospital, clinic, or hardware supplier to start a direct in-app conversation.'
                  : 'Try a different search term.'}
              </p>
            </div>
          ) : (
            filteredConversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => handleOpenChat(convo)}
                className="w-full p-4 flex items-start gap-3 hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-colors text-left group cursor-pointer"
              >
                <div className="relative shrink-0 mt-0.5">
                  {convo.businessLogo ? (
                    <img
                      src={convo.businessLogo}
                      alt={convo.businessName}
                      className="w-11 h-11 rounded-xl object-cover border border-stone-200 dark:border-stone-700 shadow-2xs"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                      <Building2 className="w-5 h-5" />
                    </div>
                  )}
                  {convo.unreadCountForUser > 0 && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-emerald-600 text-white rounded-full text-[10px] font-bold shadow-xs">
                      {convo.unreadCountForUser}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-xs font-bold text-stone-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {convo.businessName}
                    </h3>
                    <span className="text-[10px] text-stone-400 shrink-0">
                      {formatTime(convo.lastMessageTimestamp)}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-300 truncate mt-1">
                    {convo.lastMessage || 'Direct inquiry started'}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-1.5">
                    {convo.businessCity && <span>{convo.businessCity}</span>}
                    {convo.businessIsOpenNow && (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Open
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-600 dark:group-hover:text-stone-200 transition-transform group-hover:translate-x-0.5 shrink-0 self-center" />
              </button>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 text-[11px] text-stone-500 flex items-center justify-between">
          <span>Direct In-App Messages</span>
          <span className="text-emerald-600 font-medium">Bwana Live Sync</span>
        </div>
      </div>
    </div>
  );
};
