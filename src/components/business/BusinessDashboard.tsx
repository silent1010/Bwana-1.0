import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Store,
  Eye,
  PhoneCall,
  Navigation,
  MessageSquare,
  Plus,
  ShieldCheck,
  Tag,
  Star,
  Flame,
  CheckCircle,
  Clock,
  Layers,
  Save,
  Trash2,
  AlertCircle,
  ShoppingBag,
  Printer,
  PackageCheck,
  XCircle,
  Truck,
  LogOut,
  Send,
  User,
  CheckCheck,
  TrendingUp,
  BarChart3,
  Volume2,
  VolumeX,
  BellRing,
  Users,
  Radio,
  Sparkles
} from 'lucide-react';
import {
  Business,
  BusinessProduct,
  BusinessService,
  BusinessPromotion,
  BusinessReview,
  PriceType,
  ChatConversation,
  ChatMessage,
  ProductVariant
} from '../../types';
import { EngagementAnalyticsChart } from './EngagementAnalyticsChart';
import { BusinessInsightsView } from './BusinessInsightsView';
import { useCart, Order } from '../../context/CartContext';
import { playNewOrderChime } from '../../utils/audioAlerts';
import { createBusinessPost } from '../../services/followService';
import {
  subscribeToBusinessConversations,
  subscribeToMessages,
  sendMessageToBusiness,
  markConversationAsRead
} from '../../services/firebase';

interface BusinessDashboardProps {
  business: Business;
  onUpdateBusiness: (updated: Business) => void;
  onSwitchView: (tab: string) => void;
  reviews?: BusinessReview[];
  onRespondToReview?: (reviewId: string, comment: string, responderName: string) => void;
  onSignOut?: () => void;
}

export const BusinessDashboard: React.FC<BusinessDashboardProps> = ({
  business,
  onUpdateBusiness,
  onSwitchView,
  reviews = [],
  onRespondToReview,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'messages' | 'orders' | 'products' | 'services' | 'promotions' | 'broadcasts' | 'verification' | 'reviews' | 'settings'>('orders');
  const { orders, updateOrderStatus } = useCart();
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [responderName, setResponderName] = useState(`${business.name} Management`);

  // Audio Alerts & Kanban Orders state
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState(true);
  const [ordersViewMode, setOrdersViewMode] = useState<'kanban' | 'table'>('kanban');

  // Broadcasts & Followers state
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastType, setBroadcastType] = useState<'announcement' | 'promotion' | 'new_product' | 'flash_sale'>('promotion');
  const [broadcastDiscountCode, setBroadcastDiscountCode] = useState('');
  const [broadcastDiscountPct, setBroadcastDiscountPct] = useState<number>(15);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Product variants & stock state
  const [productStock, setProductStock] = useState<number>(30);
  const [productComparePrice, setProductComparePrice] = useState<string>('');
  const [productVariantsList, setProductVariantsList] = useState<ProductVariant[]>([]);
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantPriceAdj, setNewVariantPriceAdj] = useState<number>(0);
  const [newVariantStock, setNewVariantStock] = useState<number>(10);

  // Direct Customer Chats state
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
  const [convoMessages, setConvoMessages] = useState<ChatMessage[]>([]);
  const [merchantReplyText, setMerchantReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const convoEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to business conversations
  useEffect(() => {
    const unsub = subscribeToBusinessConversations(business.id, (convos) => {
      setConversations(convos);
      setSelectedConvoId((prev) => {
        if (prev && convos.some((c) => c.id === prev)) return prev;
        return convos.length > 0 ? convos[0].id : null;
      });
    });
    return () => unsub();
  }, [business.id]);

  // Subscribe to messages in active conversation
  useEffect(() => {
    if (!selectedConvoId) {
      setConvoMessages([]);
      return;
    }
    const unsub = subscribeToMessages(selectedConvoId, (msgs) => {
      setConvoMessages(msgs);
    });
    markConversationAsRead(selectedConvoId, 'business').catch(() => {});
    return () => unsub();
  }, [selectedConvoId]);

  useEffect(() => {
    if (activeTab === 'messages') {
      convoEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [convoMessages, activeTab]);

  const activeConversation = conversations.find((c) => c.id === selectedConvoId);
  const totalUnreadMessages = conversations.reduce((acc, c) => acc + (c.unreadCountForBusiness || 0), 0);

  const handleSendMerchantReply = async () => {
    if (!merchantReplyText.trim() || isSendingReply || !activeConversation) return;

    setIsSendingReply(true);
    const text = merchantReplyText.trim();
    setMerchantReplyText('');

    try {
      await sendMessageToBusiness(
        {
          businessId: business.id,
          businessName: business.name,
          businessLogo: business.logoUrl || business.photos?.[0] || '',
          businessPhone: business.phone,
          businessCity: business.city,
          businessArea: business.area,
          businessIsOpenNow: business.isOpenNow,
          userId: activeConversation.userId,
          userName: activeConversation.userName,
          userPhone: activeConversation.userPhone || ''
        },
        {
          senderId: business.id,
          senderName: `${business.name} (Support)`,
          senderRole: 'business',
          text
        }
      );
    } catch (err) {
      console.error('Failed to send merchant reply:', err);
    } finally {
      setIsSendingReply(false);
    }
  };

  // Filter reviews for this business
  const businessReviews = useMemo(() => {
    return reviews.filter((r) => r.businessId === business.id);
  }, [reviews, business.id]);

  // Orders for this merchant with live fallback demo
  const merchantOrders = useMemo(() => {
    const direct = orders.filter((o) => o.businessId === business.id || o.businessName === business.name);
    if (direct.length > 0) return direct;
    return [
      {
        id: 'ORD-KTW-8812',
        businessId: business.id,
        businessName: business.name,
        items: [
          {
            product: business.products?.[0] || {
              id: 'p-1',
              businessId: business.id,
              name: 'Store Inventory Item',
              price: 150,
              priceType: 'fixed',
              currency: 'ZMW',
              inStock: true
            },
            businessId: business.id,
            businessName: business.name,
            quantity: 2
          }
        ],
        subtotal: 300,
        deliveryFee: 40,
        platformSplitFee: 3.00,
        merchantPayout: 297.00,
        total: 340,
        customerName: 'Mwamba Chisanga',
        customerPhone: '+260 97 711 8330',
        deliveryAddress: 'Plot 418, Riverside Ext, Kitwe',
        paymentMethod: 'mtn_momo' as const,
        paymentStatus: 'paid' as const,
        orderStatus: 'received' as const,
        trackingNumber: 'BW-9941-KTW',
        createdAt: '2026-10-09T08:30:00Z'
      }
    ];
  }, [orders, business]);

  // Stats matching PRD section 11
  const [stats] = useState({
    profileViews: 4821,
    phoneCalls: 286,
    directions: 419,
    whatsapp: 193,
  });

  // Product form state
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState<number>(100);
  const [productCategory, setProductCategory] = useState('Building Materials');
  const [productDesc, setProductDesc] = useState('');

  // Service form state
  const [showAddService, setShowAddService] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState<number>(500);
  const [servicePriceType, setServicePriceType] = useState<PriceType>('starting_from');
  const [serviceDuration, setServiceDuration] = useState('1-2 days');

  // Promotion form state
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [promoTitle, setPromoTitle] = useState('Weekend Flash Discount');
  const [promoTagline, setPromoTagline] = useState('15% OFF all electrical fittings and wiring');
  const [promoDiscount, setPromoDiscount] = useState<number>(15);
  const [promoFrom, setPromoFrom] = useState('2026-10-02');
  const [promoUntil, setPromoUntil] = useState('2026-10-04');

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    const newProd: BusinessProduct = {
      id: `prod-${Date.now()}`,
      businessId: business.id,
      name: productName.trim(),
      description: productDesc.trim(),
      price: Number(productPrice),
      compareAtPrice: productComparePrice ? Number(productComparePrice) : undefined,
      priceType: 'fixed',
      currency: 'ZMW',
      inStock: productStock > 0,
      stockQuantity: Number(productStock),
      lowStockThreshold: 5,
      category: productCategory,
      variants: productVariantsList.length > 0 ? [...productVariantsList] : undefined,
    };

    const updated = {
      ...business,
      products: [...(business.products || []), newProd],
    };
    onUpdateBusiness(updated);
    setProductName('');
    setProductDesc('');
    setProductStock(30);
    setProductComparePrice('');
    setProductVariantsList([]);
    setShowAddProduct(false);
  };

  const handleBroadcastPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastContent.trim()) return;

    createBusinessPost(business.id, business.name, business.logoUrl, business.city, {
      title: broadcastTitle.trim(),
      content: broadcastContent.trim(),
      type: broadcastType,
      discountCode: broadcastDiscountCode.trim() || undefined,
      discountPercentage: broadcastDiscountPct ? Number(broadcastDiscountPct) : undefined,
    });

    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 3000);
    setBroadcastTitle('');
    setBroadcastContent('');
    setBroadcastDiscountCode('');
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) return;

    const newServ: BusinessService = {
      id: `serv-${Date.now()}`,
      businessId: business.id,
      name: serviceName.trim(),
      price: Number(servicePrice),
      priceType: servicePriceType,
      currency: 'ZMW',
      duration: serviceDuration,
      category: 'Specialized Trade',
    };

    const updated = {
      ...business,
      services: [...(business.services || []), newServ],
    };
    onUpdateBusiness(updated);
    setServiceName('');
    setShowAddService(false);
  };

  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoTitle.trim()) return;

    const newPromo: BusinessPromotion = {
      id: `promo-${Date.now()}`,
      businessId: business.id,
      businessName: business.name,
      title: promoTitle.trim(),
      tagline: promoTagline.trim(),
      discountPercentage: Number(promoDiscount),
      validFrom: promoFrom,
      validUntil: promoUntil,
      terms: 'Applicable in-store or over WhatsApp payment confirmation.',
      isFeatured: true,
    };

    const updated = {
      ...business,
      promotions: [newPromo, ...(business.promotions || [])],
    };
    onUpdateBusiness(updated);
    setShowAddPromo(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Banner Header */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 mb-8 border border-stone-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Bwana Business Pro
              </span>
              <span className="text-xs text-stone-400">·</span>
              <span className="text-xs text-stone-300">
                {business.area}, {business.city} ({business.province})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight flex items-center gap-2">
              <span>{business.name}</span>
              {business.verificationStatus === 'verified' && (
                <span className="text-emerald-400 text-xl font-bold" title="Verified business">
                  ✓
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl">
              Control panel for managing your catalog, pricing, promotions, and incoming customer leads across Zambia.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => onSwitchView('businesses')}
              className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              Public Profile Preview
            </button>
            <div className="p-2 sm:p-2.5 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-center">
              <div className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">Listing Status</div>
              <div className="text-xs font-bold text-white mt-0.5 flex items-center justify-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified ✓ Active</span>
              </div>
            </div>
            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                className="px-3.5 py-2 bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs group"
                title="Log out of business merchant portal"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>

        {/* PRD Section 11 Lead Statistics Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-stone-800 text-center">
          <div className="p-4 bg-stone-950/60 rounded-xl border border-stone-800/80">
            <div className="flex items-center justify-center gap-1.5 text-stone-400 text-xs mb-1">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Profile Views</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
              {stats.profileViews.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-400 mt-1">+18% this month</div>
          </div>

          <div className="p-4 bg-stone-950/60 rounded-xl border border-stone-800/80">
            <div className="flex items-center justify-center gap-1.5 text-stone-400 text-xs mb-1">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>Phone Calls</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
              {stats.phoneCalls.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-400 mt-1">Direct inquiries</div>
          </div>

          <div className="p-4 bg-stone-950/60 rounded-xl border border-stone-800/80">
            <div className="flex items-center justify-center gap-1.5 text-stone-400 text-xs mb-1">
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>Directions</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
              {stats.directions.toLocaleString()}
            </div>
            <div className="text-[10px] text-stone-400 mt-1">Physical footfall</div>
          </div>

          <div className="p-4 bg-stone-950/60 rounded-xl border border-stone-800/80">
            <div className="flex items-center justify-center gap-1.5 text-stone-400 text-xs mb-1">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Leads</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
              {stats.whatsapp.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-400 mt-1">High conversion</div>
          </div>
        </div>

        {/* 30 & 90-Day Recharts Engagement & CTR Strip */}
        <div className="mt-6 pt-5 border-t border-stone-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-200">
                Lead Conversion & CTR Analytics (Call & WhatsApp)
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                30D & 90D Trends
              </span>
            </div>
            <button
              onClick={() => setActiveTab('analytics')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View Full Interactive Recharts Breakdown</span>
              <span>→</span>
            </button>
          </div>
          <EngagementAnalyticsChart compact={true} />
        </div>
      </div>

      {/* Dashboard Sub-Navigation */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-3 mb-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'analytics'
              ? 'bg-emerald-600 text-white shadow-xs font-bold'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Business Insights</span>
          <span className="text-[10px] font-mono bg-emerald-950/40 text-emerald-300 dark:text-emerald-200 px-1.5 py-0.2 rounded">
            D3+Recharts
          </span>
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'messages'
              ? 'bg-emerald-600 text-white shadow-xs font-bold'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Customer Chats</span>
          {totalUnreadMessages > 0 ? (
            <span className="bg-emerald-500 text-white font-bold text-[10px] px-1.5 py-0.2 rounded-full font-mono animate-pulse">
              {totalUnreadMessages}
            </span>
          ) : (
            <span className="bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {conversations.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-emerald-600 text-white shadow-xs font-bold'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5 text-emerald-300" />
          <span>Orders & Invoices</span>
          <span className="bg-emerald-500 text-stone-950 font-bold text-[10px] px-1.5 py-0.2 rounded-full font-mono">
            {merchantOrders.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'products'
              ? 'bg-emerald-600 text-white shadow-xs font-bold'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700'
          }`}
        >
          <span>Products Catalog</span>
          <span className="bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
            {business.products?.length || 0}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'services'
              ? 'bg-emerald-600 text-white shadow-xs font-bold'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700'
          }`}
        >
          <span>Services & Rates</span>
          <span className="bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
            {business.services?.length || 0}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('promotions')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'promotions'
              ? 'bg-emerald-600 text-white shadow-xs font-bold'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Active Promotions</span>
          <span className="bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
            {business.promotions?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('broadcasts')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'broadcasts'
              ? 'bg-emerald-600 text-white shadow-xs font-bold'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-amber-400" />
          <span>Followers & Broadcasts</span>
          <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] px-1.5 py-0.2 rounded-full font-mono">
            New
          </span>
        </button>
        <button
          onClick={() => setActiveTab('verification')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'verification'
              ? 'bg-emerald-600 text-white shadow-xs font-bold'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>PACRA & Verification</span>
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'reviews'
              ? 'bg-emerald-600 text-white shadow-xs font-bold'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700'
          }`}
        >
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <span>Reviews & Ratings</span>
          <span className="bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
            {businessReviews.length}
          </span>
        </button>
      </div>

      {/* TAB CONTENT: Direct Customer Chats (No WhatsApp required) */}
      {activeTab === 'messages' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-display text-stone-900 dark:text-white">
                  Direct In-App Customer Chats
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Live Firestore Sync
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Respond to customer product inquiries, consultation appointments, and quotes directly on Bwana without external WhatsApp.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-2xs min-h-[560px]">
            {/* Left 4 Cols: Conversations List */}
            <div className="lg:col-span-4 border-r border-stone-200 dark:border-stone-800 flex flex-col bg-stone-50/50 dark:bg-stone-950/40">
              <div className="p-3.5 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  Inquiries ({conversations.length})
                </span>
                {totalUnreadMessages > 0 && (
                  <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                    {totalUnreadMessages} unread
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800/80">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-stone-400 flex flex-col items-center justify-center h-full">
                    <MessageSquare className="w-8 h-8 text-stone-300 dark:text-stone-700 mb-2" />
                    <p className="text-xs font-semibold text-stone-600 dark:text-stone-400">No customer chats yet</p>
                    <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 max-w-[200px]">
                      Customer inquiries from search and your business profile appear here in real time.
                    </p>
                  </div>
                ) : (
                  conversations.map((convo) => {
                    const isSelected = convo.id === selectedConvoId;
                    return (
                      <button
                        key={convo.id}
                        onClick={() => setSelectedConvoId(convo.id)}
                        className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-l-4 border-emerald-600'
                            : 'hover:bg-stone-100/60 dark:hover:bg-stone-800/50'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center shrink-0 font-bold text-xs">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs text-stone-900 dark:text-white truncate">
                              {convo.userName || 'Bwana Customer'}
                            </span>
                            {convo.unreadCountForBusiness > 0 && (
                              <span className="px-1.5 py-0.2 bg-emerald-600 text-white text-[10px] font-bold rounded-full">
                                {convo.unreadCountForBusiness}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5">
                            {convo.lastMessage || 'New inquiry'}
                          </p>
                          <span className="text-[10px] text-stone-400 font-mono mt-1 block">
                            {convo.lastMessageTimestamp
                              ? new Date(convo.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : ''}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right 8 Cols: Active Chat Thread */}
            <div className="lg:col-span-8 flex flex-col h-full bg-white dark:bg-stone-900">
              {activeConversation ? (
                <>
                  {/* Thread Header */}
                  <div className="p-3.5 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white flex items-center gap-1.5">
                        <span>{activeConversation.userName || 'Bwana Customer'}</span>
                        <span className="text-[10px] text-stone-500 font-normal">
                          (Direct Bwana In-App Chat)
                        </span>
                      </h4>
                      {activeConversation.userPhone && (
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Phone: <strong>{activeConversation.userPhone}</strong>
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      Merchant Response Channel
                    </span>
                  </div>

                  {/* Message Stream */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[340px] max-h-[460px] bg-stone-50/30 dark:bg-stone-900/40">
                    {convoMessages.map((msg) => {
                      const isMerchant = msg.senderRole === 'business';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMerchant ? 'items-end' : 'items-start'}`}
                        >
                          <span className="text-[10px] text-stone-400 mb-0.5">
                            {isMerchant ? `${business.name} (Official Reply)` : activeConversation.userName || 'Customer'}
                          </span>
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                              isMerchant
                                ? 'bg-emerald-600 text-white rounded-br-xs'
                                : 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 rounded-bl-xs'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-stone-400 mt-1">
                            <span>
                              {msg.timestamp
                                ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : ''}
                            </span>
                            {isMerchant && <CheckCheck className="w-3 h-3 text-emerald-600" />}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={convoEndRef} />
                  </div>

                  {/* Reply Composer */}
                  <div className="p-3 sm:p-4 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Reply directly to ${activeConversation.userName || 'Customer'}...`}
                      value={merchantReplyText}
                      onChange={(e) => setMerchantReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSendMerchantReply();
                        }
                      }}
                      className="flex-1 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={handleSendMerchantReply}
                      disabled={!merchantReplyText.trim() || isSendingReply}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 dark:disabled:bg-stone-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Reply</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400">
                  <MessageSquare className="w-10 h-10 text-stone-300 dark:text-stone-700 mb-2" />
                  <p className="text-sm font-semibold text-stone-600 dark:text-stone-400">
                    Select a conversation to reply
                  </p>
                  <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                    Direct on-platform inquiries will display here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Seller Orders & Invoices (Live Kanban Board with Audio Alerts) */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold font-display text-stone-900 dark:text-white">
                  Live Merchant Order Board
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Real-Time Dispatch
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Kanban fulfillment pipeline with instant sound alerts for incoming customer orders across Kitwe, Lusaka & Copperbelt.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              {/* Sound Alert Toggle */}
              <button
                type="button"
                onClick={() => setSoundAlertsEnabled(!soundAlertsEnabled)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                  soundAlertsEnabled
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-500'
                }`}
                title="Toggle Web Audio sound alerts on new orders"
              >
                {soundAlertsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{soundAlertsEnabled ? 'Sound Alerts: ON' : 'Muted'}</span>
              </button>

              {/* Test Chime Button */}
              <button
                type="button"
                onClick={() => playNewOrderChime()}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer flex items-center gap-1"
                title="Play test order chime"
              >
                <BellRing className="w-3.5 h-3.5 text-amber-500" />
                <span>Test Chime</span>
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
                <button
                  type="button"
                  onClick={() => setOrdersViewMode('kanban')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    ordersViewMode === 'kanban'
                      ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white font-bold shadow-xs'
                      : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  Kanban Board
                </button>
                <button
                  type="button"
                  onClick={() => setOrdersViewMode('table')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    ordersViewMode === 'table'
                      ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white font-bold shadow-xs'
                      : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  Table List
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs">
              <span className="text-[11px] text-stone-400 block uppercase font-semibold">Total Orders</span>
              <span className="text-xl font-bold font-mono text-stone-900 dark:text-white">
                {merchantOrders.length}
              </span>
            </div>
            <div className="p-3.5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs">
              <span className="text-[11px] text-amber-500 block uppercase font-semibold">Action Needed</span>
              <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
                {merchantOrders.filter((o) => o.orderStatus === 'received' || o.orderStatus === 'accepted').length}
              </span>
            </div>
            <div className="p-3.5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs">
              <span className="text-[11px] text-sky-500 block uppercase font-semibold">In Transit</span>
              <span className="text-xl font-bold font-mono text-sky-600 dark:text-sky-400">
                {merchantOrders.filter((o) => o.orderStatus === 'in_transit').length}
              </span>
            </div>
            <div className="p-3.5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs">
              <span className="text-[11px] text-emerald-600 block uppercase font-semibold">99% Payout Revenue</span>
              <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
                ZMW {merchantOrders.reduce((sum, o) => sum + (o.merchantPayout || 0), 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* KANBAN BOARD VIEW */}
          {ordersViewMode === 'kanban' ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              {/* Lane 1: Received / Pending */}
              <div className="bg-stone-50 dark:bg-stone-900/60 rounded-2xl p-3 border border-stone-200 dark:border-stone-800 flex flex-col space-y-3 min-h-[480px]">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                      1. New / Received
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
                    {merchantOrders.filter((o) => o.orderStatus === 'received').length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {merchantOrders.filter((o) => o.orderStatus === 'received').map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3.5 bg-white dark:bg-stone-800 rounded-xl border-2 border-amber-300 dark:border-amber-700 shadow-xs space-y-2.5 text-xs animate-in fade-in"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold font-mono text-stone-900 dark:text-white">#{ord.id}</span>
                        <span className="text-[10px] font-mono text-stone-400 font-semibold">{ord.paymentMethod.toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-stone-900 dark:text-stone-100">{ord.customerName}</div>
                        <div className="text-[11px] text-stone-500 truncate">{ord.deliveryAddress}</div>
                      </div>
                      <div className="py-1 px-2 rounded bg-stone-50 dark:bg-stone-900/80 text-[11px] space-y-1">
                        {ord.items.map((item, i) => (
                          <div key={i} className="flex justify-between">
                            <span className="truncate">{item.quantity}x {item.product.name}</span>
                            <span className="font-mono font-bold shrink-0 ml-1">K{item.product.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-700/60">
                        <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          Payout: K{ord.merchantPayout.toFixed(0)}
                        </span>
                        <button
                          onClick={() => {
                            updateOrderStatus(ord.id, 'accepted');
                            playNewOrderChime();
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                        >
                          Accept & Prepare →
                        </button>
                      </div>
                    </div>
                  ))}
                  {merchantOrders.filter((o) => o.orderStatus === 'received').length === 0 && (
                    <div className="p-6 text-center text-stone-400 text-xs italic">
                      No pending orders waiting.
                    </div>
                  )}
                </div>
              </div>

              {/* Lane 2: Preparing / Packaging */}
              <div className="bg-stone-50 dark:bg-stone-900/60 rounded-2xl p-3 border border-stone-200 dark:border-stone-800 flex flex-col space-y-3 min-h-[480px]">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                      2. Preparing Goods
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">
                    {merchantOrders.filter((o) => o.orderStatus === 'accepted' || o.orderStatus === 'preparing').length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {merchantOrders.filter((o) => o.orderStatus === 'accepted' || o.orderStatus === 'preparing').map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3.5 bg-white dark:bg-stone-800 rounded-xl border border-blue-200 dark:border-blue-900/80 shadow-xs space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold font-mono text-stone-900 dark:text-white">#{ord.id}</span>
                        <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold uppercase">Preparing</span>
                      </div>
                      <div>
                        <div className="font-semibold text-stone-900 dark:text-stone-100">{ord.customerName}</div>
                        <div className="text-[11px] text-stone-500 truncate">{ord.deliveryAddress}</div>
                      </div>
                      <div className="py-1 px-2 rounded bg-stone-50 dark:bg-stone-900/80 text-[11px] space-y-1">
                        {ord.items.map((item, i) => (
                          <div key={i} className="flex justify-between">
                            <span className="truncate">{item.quantity}x {item.product.name}</span>
                            <span className="font-mono font-bold shrink-0 ml-1">K{item.product.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-700/60">
                        <a href={`tel:${ord.customerPhone}`} className="text-[11px] text-emerald-600 hover:underline">
                          Call Buyer
                        </a>
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'in_transit')}
                          className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <Truck className="w-3 h-3" />
                          <span>Dispatch Courier →</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {merchantOrders.filter((o) => o.orderStatus === 'accepted' || o.orderStatus === 'preparing').length === 0 && (
                    <div className="p-6 text-center text-stone-400 text-xs italic">
                      No orders currently being packed.
                    </div>
                  )}
                </div>
              </div>

              {/* Lane 3: In Transit */}
              <div className="bg-stone-50 dark:bg-stone-900/60 rounded-2xl p-3 border border-stone-200 dark:border-stone-800 flex flex-col space-y-3 min-h-[480px]">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                    <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                      3. Out for Delivery
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-bold bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 px-2 py-0.5 rounded-full">
                    {merchantOrders.filter((o) => o.orderStatus === 'in_transit').length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {merchantOrders.filter((o) => o.orderStatus === 'in_transit').map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3.5 bg-white dark:bg-stone-800 rounded-xl border border-sky-300 dark:border-sky-800 shadow-xs space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold font-mono text-stone-900 dark:text-white">#{ord.id}</span>
                        <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 font-bold uppercase">{ord.trackingNumber}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-stone-900 dark:text-stone-100">{ord.customerName}</div>
                        <div className="text-[11px] text-stone-500 truncate">{ord.deliveryAddress}</div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-700/60">
                        <span className="text-[11px] text-stone-500 font-mono">Courier: Active</span>
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'delivered')}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                        >
                          Confirm Delivery ✓
                        </button>
                      </div>
                    </div>
                  ))}
                  {merchantOrders.filter((o) => o.orderStatus === 'in_transit').length === 0 && (
                    <div className="p-6 text-center text-stone-400 text-xs italic">
                      No active courier dispatches.
                    </div>
                  )}
                </div>
              </div>

              {/* Lane 4: Delivered / Completed */}
              <div className="bg-stone-50 dark:bg-stone-900/60 rounded-2xl p-3 border border-stone-200 dark:border-stone-800 flex flex-col space-y-3 min-h-[480px]">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                      4. Completed & Paid
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                    {merchantOrders.filter((o) => o.orderStatus === 'delivered').length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {merchantOrders.filter((o) => o.orderStatus === 'delivered').map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 shadow-xs space-y-2 text-xs opacity-90"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold font-mono text-stone-900 dark:text-white">#{ord.id}</span>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">PAID (99%)</span>
                      </div>
                      <div className="text-[11px] text-stone-600 dark:text-stone-300">
                        {ord.customerName} · Net: <span className="font-bold font-mono text-emerald-700 dark:text-emerald-300">K{ord.merchantPayout.toFixed(2)}</span>
                      </div>
                      <button
                        onClick={() => window.print()}
                        className="w-full py-1 bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 rounded text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Receipt / Invoice</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // TABLE VIEW
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 text-stone-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Order</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Items</th>
                    <th className="p-3.5 font-mono">Total (ZMW)</th>
                    <th className="p-3.5 font-mono">Net 99%</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {merchantOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/50">
                      <td className="p-3.5 font-bold font-mono text-stone-900 dark:text-white">#{ord.id}</td>
                      <td className="p-3.5 font-semibold text-stone-800 dark:text-stone-200">{ord.customerName}</td>
                      <td className="p-3.5 text-stone-500">{ord.items.length} items</td>
                      <td className="p-3.5 font-mono font-bold">K{ord.total.toFixed(2)}</td>
                      <td className="p-3.5 font-mono font-bold text-emerald-600">K{ord.merchantPayout.toFixed(2)}</td>
                      <td className="p-3.5">
                        <span className="capitalize px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                          {ord.orderStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => updateOrderStatus(ord.id, ord.orderStatus === 'received' ? 'accepted' : 'delivered')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold cursor-pointer"
                        >
                          Advance State
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Followers & Broadcasts */}
      {activeTab === 'broadcasts' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-display text-stone-900 dark:text-white">
                  Follower Network & Broadcasts
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] font-bold uppercase tracking-wider">
                  Direct Marketing
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Broadcast new product drops, flash discount vouchers, and announcements directly to customers who follow {business.name}.
              </p>
            </div>

            <button
              onClick={() => setShowBroadcastForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Broadcast</span>
            </button>
          </div>

          {/* Follower Stats Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs">
              <div className="flex items-center gap-2 text-stone-500 text-xs mb-1 font-semibold">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Active Followers</span>
              </div>
              <div className="text-2xl font-bold font-mono text-stone-900 dark:text-white">
                348 Citizens
              </div>
              <div className="text-[11px] text-emerald-600 mt-1 font-medium">+14 new this week</div>
            </div>

            <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs">
              <div className="flex items-center gap-2 text-stone-500 text-xs mb-1 font-semibold">
                <Radio className="w-4 h-4 text-amber-500" />
                <span>Broadcast Feed Reach</span>
              </div>
              <div className="text-2xl font-bold font-mono text-stone-900 dark:text-white">
                1,820 Impressions
              </div>
              <div className="text-[11px] text-stone-400 mt-1">Across Discovery feed</div>
            </div>

            <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs">
              <div className="flex items-center gap-2 text-stone-500 text-xs mb-1 font-semibold">
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>Voucher Redemptions</span>
              </div>
              <div className="text-2xl font-bold font-mono text-stone-900 dark:text-white">
                42 Redemptions
              </div>
              <div className="text-[11px] text-emerald-600 mt-1">High conversion rate</div>
            </div>
          </div>

          {/* Success Notification */}
          {broadcastSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Broadcast published successfully! Your followers will see this in their Following feed now.</span>
              </div>
              <span className="font-mono text-[10px] text-emerald-700">Live in Feed</span>
            </div>
          )}

          {/* Broadcast Composer Form */}
          {showBroadcastForm && (
            <form
              onSubmit={handleBroadcastPost}
              className="p-5 bg-white dark:bg-stone-900 border border-emerald-400 dark:border-emerald-700 rounded-2xl shadow-sm space-y-4 animate-in fade-in"
            >
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                <h4 className="font-bold text-xs uppercase tracking-wider text-stone-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Compose Broadcast to Followers</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowBroadcastForm(false)}
                  className="text-xs text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Broadcast Title / Headline
                  </label>
                  <input
                    type="text"
                    required
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="e.g. ⚡ Flash Weekend Sale: 15% Off All Power Tools!"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Broadcast Type
                  </label>
                  <select
                    value={broadcastType}
                    onChange={(e) => setBroadcastType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="promotion">Special Promotion / Deal</option>
                    <option value="new_product">New Product Arrival</option>
                    <option value="announcement">Store Notice / Hours Update</option>
                    <option value="flash_sale">Flash Sale</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Message Content / Details
                </label>
                <textarea
                  required
                  rows={3}
                  value={broadcastContent}
                  onChange={(e) => setBroadcastContent(e.target.value)}
                  placeholder="Describe your promotion, new product inventory, or holiday hours for your customers..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-100 dark:border-stone-800">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Optional Voucher Code
                  </label>
                  <input
                    type="text"
                    value={broadcastDiscountCode}
                    onChange={(e) => setBroadcastDiscountCode(e.target.value.toUpperCase())}
                    placeholder="e.g. FLASH15"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    value={broadcastDiscountPct}
                    onChange={(e) => setBroadcastDiscountPct(Number(e.target.value))}
                    placeholder="15"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Send Broadcast Now</span>
                </button>
              </div>
            </form>
          )}

          {/* Past Broadcasts List */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Recent Broadcast History
            </h4>
            <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
              <div className="py-3 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 dark:text-white">Fresh Consignment: Dangote Cement</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">New Product</span>
                  </div>
                  <p className="text-stone-500 mt-1 line-clamp-1">1,200 bags of Dangote 42.5N cement arrived. Special price of K145.</p>
                </div>
                <span className="text-[11px] text-stone-400 font-mono shrink-0">Today · 38 likes</span>
              </div>

              <div className="py-3 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 dark:text-white">Power Backup Solar Inverters & Batteries</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-700 uppercase">Notice</span>
                  </div>
                  <p className="text-stone-500 mt-1 line-clamp-1">Load shedding solutions: hybrid 5kW solar inverters with lithium batteries.</p>
                </div>
                <span className="text-[11px] text-stone-400 font-mono shrink-0">Yesterday · 89 likes</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Products Manager (PRD Section 12) */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold font-display text-stone-900">
                Products & Inventory Catalog
              </h3>
              <p className="text-xs text-stone-500">
                Add building materials, tools, and retail items. Customers search these directly in Bwana.
              </p>
            </div>
            <button
              onClick={() => setShowAddProduct(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Add Product Modal/Form */}
          {showAddProduct && (
            <form
              onSubmit={handleAddProduct}
              className="p-5 bg-white border border-emerald-300 rounded-xl shadow-xs space-y-4 animate-in fade-in"
            >
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                New Product Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-stone-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Portland Cement (50kg)"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Base Price (ZMW / K)</label>
                  <input
                    type="number"
                    required
                    placeholder="145"
                    value={productPrice}
                    onChange={(e) => setProductPrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Compare-at Price (K)</label>
                  <input
                    type="number"
                    placeholder="e.g. 175"
                    value={productComparePrice}
                    onChange={(e) => setProductComparePrice(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Category</label>
                  <select
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                  >
                    <option value="Building Materials">Building Materials</option>
                    <option value="Roofing">Roofing</option>
                    <option value="Paint & Finishes">Paint & Finishes</option>
                    <option value="Power Tools">Power Tools</option>
                    <option value="Hardware & Fasteners">Hardware & Fasteners</option>
                    <option value="Food & Beverages">Food & Beverages</option>
                    <option value="Agro & Farming">Agro & Farming</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Initial Stock Quantity</label>
                  <input
                    type="number"
                    required
                    placeholder="30"
                    value={productStock}
                    onChange={(e) => setProductStock(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Specifications / Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. ZABS approved, pallet rates"
                    value={productDesc}
                    onChange={(e) => setProductDesc(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Multi-Variant Creator */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Product Variants (Optional Sizes, Packs, or Colors)
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {productVariantsList.length} configured
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Variant Name (e.g. 1kg Bag, Large)"
                    value={newVariantName}
                    onChange={(e) => setNewVariantName(e.target.value)}
                    className="px-2.5 py-1 text-xs border border-stone-300 rounded-lg bg-white sm:col-span-2"
                  />
                  <input
                    type="number"
                    placeholder="Price Adj (e.g. +20 or 0)"
                    value={newVariantPriceAdj}
                    onChange={(e) => setNewVariantPriceAdj(Number(e.target.value))}
                    className="px-2.5 py-1 text-xs border border-stone-300 rounded-lg bg-white"
                  />
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      placeholder="Stock"
                      value={newVariantStock}
                      onChange={(e) => setNewVariantStock(Number(e.target.value))}
                      className="w-16 px-2 py-1 text-xs border border-stone-300 rounded-lg bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newVariantName.trim()) return;
                        setProductVariantsList((prev) => [
                          ...prev,
                          {
                            id: `var-${Date.now()}-${prev.length}`,
                            name: newVariantName.trim(),
                            priceAdjustment: Number(newVariantPriceAdj),
                            stock: Number(newVariantStock),
                          },
                        ]);
                        setNewVariantName('');
                        setNewVariantPriceAdj(0);
                        setNewVariantStock(10);
                      }}
                      className="px-3 py-1 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Added Variants Pills */}
                {productVariantsList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {productVariantsList.map((v, idx) => (
                      <span
                        key={v.id}
                        className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] flex items-center gap-1.5"
                      >
                        <strong>{v.name}</strong>
                        <span>({v.priceAdjustment >= 0 ? `+K${v.priceAdjustment}` : `-K${Math.abs(v.priceAdjustment)}`} · {v.stock} in stock)</span>
                        <button
                          type="button"
                          onClick={() => setProductVariantsList((prev) => prev.filter((_, i) => i !== idx))}
                          className="hover:text-rose-700 ml-1 font-bold cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Save Product to Catalog
                </button>
              </div>
            </form>
          )}

          {/* Current Products Table */}
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Product Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5 font-mono">Price (ZMW)</th>
                  <th className="p-3.5">Variants</th>
                  <th className="p-3.5">Inventory Stock</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {business.products?.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/50">
                    <td className="p-3.5 font-semibold text-stone-900">
                      {p.name}
                      {p.description && (
                        <div className="text-[11px] text-stone-400 font-normal">{p.description}</div>
                      )}
                    </td>
                    <td className="p-3.5 text-stone-600">{p.category}</td>
                    <td className="p-3.5 font-mono font-bold text-stone-900">
                      K{p.price.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-stone-600">
                      {p.variants && p.variants.length > 0 ? (
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                          {p.variants.length} variants
                        </span>
                      ) : (
                        <span className="text-stone-400 text-[11px]">Standard</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-bold">
                        {p.stockQuantity !== undefined ? `${p.stockQuantity} in stock` : 'Active In Stock'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          const updated = {
                            ...business,
                            products: business.products?.filter((item) => item.id !== p.id),
                          };
                          onUpdateBusiness(updated);
                        }}
                        className="text-stone-400 hover:text-rose-600 p-1 rounded"
                        title="Remove product"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Services Manager (PRD Section 12) */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold font-display text-stone-900">
                Services & Trade Quotations
              </h3>
              <p className="text-xs text-stone-500">
                Electrical installations, solar PV, deliveries, and on-site works.
              </p>
            </div>
            <button
              onClick={() => setShowAddService(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Service</span>
            </button>
          </div>

          {showAddService && (
            <form
              onSubmit={handleAddService}
              className="p-5 bg-white border border-emerald-300 rounded-xl shadow-xs space-y-4 animate-in fade-in"
            >
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                New Service Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Service Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Solar PV Turnkey Installation"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Base Price (ZMW / K)</label>
                  <input
                    type="number"
                    required
                    placeholder="2500"
                    value={servicePrice}
                    onChange={(e) => setServicePrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Pricing Model</label>
                  <select
                    value={servicePriceType}
                    onChange={(e) => setServicePriceType(e.target.value as PriceType)}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                  >
                    <option value="starting_from">Starting from</option>
                    <option value="fixed">Fixed</option>
                    <option value="price_range">Price range</option>
                    <option value="contact_for_price">Contact for price</option>
                    <option value="negotiable">Negotiable</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddService(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                >
                  Add Service
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {business.services?.map((s) => (
              <div
                key={s.id}
                className="p-4 bg-white border border-stone-200 rounded-xl flex items-center justify-between gap-4"
              >
                <div>
                  <div className="font-semibold text-stone-900 text-sm">{s.name}</div>
                  <div className="text-xs text-stone-500 mt-0.5">{s.description}</div>
                  <div className="text-[11px] text-stone-400 mt-1">
                    Model: <span className="capitalize">{s.priceType.replace('_', ' ')}</span> · Duration: {s.duration || 'Flexible'}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-base font-bold text-stone-900">
                    K{s.price.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-stone-400 uppercase tracking-wider">
                    {s.priceType === 'starting_from' ? 'Starting From' : 'Rate'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Promotions Manager (PRD Section 13) */}
      {activeTab === 'promotions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold font-display text-stone-900">
                Promotions & Limited Deals
              </h3>
              <p className="text-xs text-stone-500">
                Publish weekend offers, seasonal sales, and flash clearances to attract local footfall.
              </p>
            </div>
            <button
              onClick={() => setShowAddPromo(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Promotion</span>
            </button>
          </div>

          {showAddPromo && (
            <form
              onSubmit={handleAddPromo}
              className="p-5 bg-amber-50/60 border border-amber-300 rounded-xl shadow-xs space-y-4 animate-in fade-in"
            >
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Create Promotional Campaign
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Offer Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WEEKEND BUILDERS OFFER"
                    value={promoTitle}
                    onChange={(e) => setPromoTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Discount %</label>
                  <input
                    type="number"
                    required
                    placeholder="20"
                    value={promoDiscount}
                    onChange={(e) => setPromoDiscount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Offer Tagline / Summary</label>
                <input
                  type="text"
                  required
                  placeholder="20% OFF selected roofing sheets, paint, and power tools."
                  value={promoTagline}
                  onChange={(e) => setPromoTagline(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Valid From</label>
                  <input
                    type="date"
                    value={promoFrom}
                    onChange={(e) => setPromoFrom(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Valid Until</label>
                  <input
                    type="date"
                    value={promoUntil}
                    onChange={(e) => setPromoUntil(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPromo(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold"
                >
                  Publish Promotion
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {business.promotions?.map((p) => (
              <div
                key={p.id}
                className="p-5 bg-white border border-amber-200 rounded-xl flex items-center justify-between gap-4 shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" />
                      {p.title}
                    </span>
                    <span className="text-xs text-stone-400">·</span>
                    <span className="text-xs text-stone-500">
                      Valid: {p.validFrom} to {p.validUntil}
                    </span>
                  </div>
                  <h4 className="font-semibold text-stone-900 text-sm mt-1">{p.tagline}</h4>
                  <p className="text-xs text-stone-500 mt-1">{p.terms}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-black font-mono text-amber-600">
                    {p.discountPercentage}% OFF
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    Live on Bwana Discovery
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Verification Status (PRD Section 9) */}
      {activeTab === 'verification' && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-stone-200 rounded-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Business Verification Status: VERIFIED
                </h3>
                <p className="text-xs text-stone-500">
                  ABC Hardware & Construction holds an official Bwana Verified Badge.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-100 text-xs">
              <div className="p-3 bg-stone-50 rounded-lg">
                <div className="text-stone-400 uppercase tracking-wider text-[10px]">PACRA Registration</div>
                <div className="font-mono font-semibold text-stone-900 mt-0.5">PACRA-1200921448</div>
                <div className="text-emerald-700 text-[11px] mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Validated with PACRA Registry</span>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-lg">
                <div className="text-stone-400 uppercase tracking-wider text-[10px]">ZRA TPIN Number</div>
                <div className="font-mono font-semibold text-stone-900 mt-0.5">1004928172</div>
                <div className="text-emerald-700 text-[11px] mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Tax Clearance Valid</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Business Insights (Recharts + D3) */}
      {activeTab === 'analytics' && (
        <BusinessInsightsView business={business} reviews={businessReviews} />
      )}
      {/* TAB CONTENT: Customer Reviews Management */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold font-display text-stone-900">
                Customer Reviews & Reputation Console
              </h3>
              <p className="text-xs text-stone-500">
                Real feedback from customers who transacted with {business.name}. Respond officially to build trust.
              </p>
            </div>
            <button
              onClick={() => onSwitchView && onSwitchView('businesses')}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span>Preview Public Business Profile</span>
              <span>→</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-2xs">
              <span className="text-[11px] font-semibold text-stone-400 block uppercase">Overall Rating</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-bold font-mono text-stone-900">{business.rating.toFixed(1)}</span>
                <span className="text-xs text-stone-400">/ 5.0</span>
              </div>
              <div className="flex text-amber-400 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= Math.round(business.rating) ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-2xs">
              <span className="text-[11px] font-semibold text-stone-400 block uppercase">Total Reviews</span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-stone-900 mt-1">
                {businessReviews.length}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">100% Verified visits</span>
            </div>

            <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-2xs">
              <span className="text-[11px] font-semibold text-stone-400 block uppercase">Customer Satisfaction</span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-stone-900 mt-1">
                {businessReviews.length > 0
                  ? Math.round(
                      (businessReviews.filter((r) => r.rating >= 4).length / businessReviews.length) * 100
                    )
                  : 100}
                %
              </div>
              <span className="text-[11px] text-stone-500 font-medium">Rated 4★ or 5★</span>
            </div>

            <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-2xs">
              <span className="text-[11px] font-semibold text-stone-400 block uppercase">Response Rate</span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 mt-1">
                {businessReviews.length > 0
                  ? Math.round(
                      (businessReviews.filter((r) => Boolean(r.response)).length / businessReviews.length) * 100
                    )
                  : 100}
                %
              </div>
              <span className="text-[11px] text-stone-500 font-medium">Merchant replies</span>
            </div>
          </div>

          {/* Reviews List for Owner */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Customer Feedback Feed ({businessReviews.length})
            </h4>

            {businessReviews.length === 0 ? (
              <div className="p-10 text-center bg-white border border-stone-200 rounded-2xl space-y-2">
                <Star className="w-8 h-8 text-stone-300 mx-auto" />
                <h5 className="font-bold text-stone-800 text-sm">No Customer Reviews Yet</h5>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  When clients discover {business.name} and share feedback, their ratings and comments will appear here.
                </p>
              </div>
            ) : (
              businessReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 bg-white border border-stone-200 rounded-2xl space-y-3.5 shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-xs">
                        {rev.userName[0]?.toUpperCase() || 'C'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 text-sm">{rev.userName}</span>
                          {rev.verifiedVisit && (
                            <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                              <span>Verified Customer</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-stone-400 font-mono">{rev.createdAt}</span>
                      </div>
                    </div>

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
                      <span className="text-xs font-mono font-bold text-stone-800">{rev.rating}.0</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {rev.tags && rev.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-0 sm:pl-12">
                      {rev.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md"
                        >
                          ✓ {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Comment */}
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed pl-0 sm:pl-12">
                    "{rev.comment}"
                  </p>

                  {/* Existing Owner Response */}
                  {rev.response ? (
                    <div className="ml-0 sm:ml-12 p-3.5 bg-stone-50 rounded-xl border-l-3 border-emerald-600 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-emerald-950">
                          Official Reply from {rev.response.responderName}
                        </span>
                        <span className="text-stone-400 font-mono">{rev.response.respondedAt}</span>
                      </div>
                      <p className="text-stone-600 leading-relaxed">{rev.response.comment}</p>
                    </div>
                  ) : (
                    /* Reply Button or Form */
                    <div className="pl-0 sm:pl-12 pt-2 border-t border-stone-100">
                      {replyingReviewId === rev.id ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!replyText.trim() || !onRespondToReview) return;
                            onRespondToReview(rev.id, replyText.trim(), responderName.trim());
                            setReplyText('');
                            setReplyingReviewId(null);
                          }}
                          className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-3 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-900">
                              Write Official Merchant Response
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingReviewId(null);
                                setReplyText('');
                              }}
                              className="text-stone-400 hover:text-stone-700 text-xs"
                            >
                              Cancel
                            </button>
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                              Responder Title
                            </label>
                            <input
                              type="text"
                              value={responderName}
                              onChange={(e) => setResponderName(e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                              placeholder="e.g. ABC Hardware Management"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                              Response Message
                            </label>
                            <textarea
                              rows={3}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={`Thank ${rev.userName} for their feedback or explain how you are addressing their comments...`}
                              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                              required
                            />
                          </div>

                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setReplyingReviewId(null)}
                              className="px-3 py-1.5 text-stone-600 hover:text-stone-900"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={!replyText.trim()}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-300 text-white rounded-lg font-bold"
                            >
                              Post Official Response
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingReviewId(rev.id);
                            setReplyText('');
                          }}
                          className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1.5 hover:underline cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Reply to Customer Review</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
