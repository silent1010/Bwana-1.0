import React, { useState, useMemo } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { Business, BusinessProduct, BusinessService, BusinessPromotion, BusinessReview, PriceType } from '../../types';
import { EngagementAnalyticsChart } from './EngagementAnalyticsChart';

interface BusinessDashboardProps {
  business: Business;
  onUpdateBusiness: (updated: Business) => void;
  onSwitchView: (tab: string) => void;
  reviews?: BusinessReview[];
  onRespondToReview?: (reviewId: string, comment: string, responderName: string) => void;
}

export const BusinessDashboard: React.FC<BusinessDashboardProps> = ({
  business,
  onUpdateBusiness,
  onSwitchView,
  reviews = [],
  onRespondToReview,
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'services' | 'promotions' | 'verification' | 'reviews' | 'settings'>('analytics');
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [responderName, setResponderName] = useState(`${business.name} Management`);

  // Filter reviews for this business
  const businessReviews = useMemo(() => {
    return reviews.filter((r) => r.businessId === business.id);
  }, [reviews, business.id]);

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
      priceType: 'fixed',
      currency: 'ZMW',
      inStock: true,
      category: productCategory,
    };

    const updated = {
      ...business,
      products: [...(business.products || []), newProd],
    };
    onUpdateBusiness(updated);
    setProductName('');
    setProductDesc('');
    setShowAddProduct(false);
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

          <div className="flex items-center gap-3">
            <button
              onClick={() => onSwitchView('businesses')}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium transition-colors"
            >
              Public Profile Preview
            </button>
            <div className="p-3 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-center">
              <div className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">Listing Status</div>
              <div className="text-xs font-bold text-white mt-0.5 flex items-center justify-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified ✓ Active</span>
              </div>
            </div>
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
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3 mb-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'analytics'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          Performance & Leads
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'products'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <span>Products Catalog</span>
          <span className="bg-stone-200 text-stone-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
            {business.products?.length || 0}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'services'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <span>Services & Rates</span>
          <span className="bg-stone-200 text-stone-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
            {business.services?.length || 0}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('promotions')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'promotions'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>Active Promotions</span>
          <span className="bg-stone-200 text-stone-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
            {business.promotions?.length || 0}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('verification')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'verification'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>PACRA & Verification</span>
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'reviews'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Star className="w-3.5 h-3.5 text-amber-500" />
          <span>Reviews & Ratings</span>
          <span className="bg-stone-200 text-stone-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
            {businessReviews.length}
          </span>
        </button>
      </div>

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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
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
                  <label className="block text-xs font-medium text-stone-700 mb-1">Price (ZMW / K)</label>
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
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Specifications / Packaging</label>
                <input
                  type="text"
                  placeholder="e.g. Conforming to ZABS standards. Pallet discounts available."
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
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
                  <th className="p-3.5">Status</th>
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
                    <td className="p-3.5">
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-medium">
                        Active In Stock
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

      {/* TAB CONTENT: Performance / Inquiries */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Main 30-Day Recharts Lead Conversion & CTR Engine */}
          <EngagementAnalyticsChart />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white border border-stone-200 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Discovery Channel Breakdown
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-stone-600 mb-1">
                    <span>Nearby Search ("Hardware near me")</span>
                    <span className="font-mono font-semibold">58%</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full w-[58%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-stone-600 mb-1">
                    <span>Category Browsing ("Home & Construction")</span>
                    <span className="font-mono font-semibold">27%</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[27%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-stone-600 mb-1">
                    <span>Promotions & Weekend Deals</span>
                    <span className="font-mono font-semibold">15%</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[15%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border border-stone-200 rounded-xl space-y-3">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Direct Lead Conversion
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                In the last 30 days, customers triggered <strong>286 direct phone calls</strong> and <strong>193 WhatsApp chats</strong> directly from your Bwana verified card.
              </p>
              <div className="p-3 bg-emerald-50 rounded-lg text-emerald-900 text-xs border border-emerald-200">
                <strong>Pro Tip:</strong> Businesses that list prices in Zambian Kwacha (ZMW) for at least 5 products receive 4.2x more WhatsApp quotes.
              </div>
            </div>
          </div>
        </div>
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
