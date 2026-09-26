import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  PhoneCall,
  MessageSquare,
  ShieldCheck,
  CheckCircle,
  FileText,
  Upload,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Store,
  DollarSign,
  Plus,
  Trash2,
  AlertCircle,
  BadgeCheck,
  Clock,
  Eye
} from 'lucide-react';
import { Business, VerificationRequest, PriceType, BusinessProduct, BusinessService } from '../../types';
import { LOCATIONS } from '../../data/mockData';

interface BusinessRegistrationPortalProps {
  onRegisterBusiness: (business: Business, verification: VerificationRequest) => void;
  onNavigateToAdmin: () => void;
  onNavigateToDiscovery: (businessId?: string) => void;
}

export const BusinessRegistrationPortal: React.FC<BusinessRegistrationPortalProps> = ({
  onRegisterBusiness,
  onNavigateToAdmin,
  onNavigateToDiscovery,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [createdBusinessId, setCreatedBusinessId] = useState<string>('');
  const [createdRefCode, setCreatedRefCode] = useState<string>('');

  // Step 1: Business Identity
  const [businessName, setBusinessName] = useState('');
  const [tagline, setTagline] = useState('');
  const [categoryId, setCategoryId] = useState('home-construction');
  const [description, setDescription] = useState('');
  const [yearFounded, setYearFounded] = useState<number>(2022);

  // Step 2: Location
  const [selectedCity, setSelectedCity] = useState('Kitwe');
  const [selectedProvince, setSelectedProvince] = useState('Copperbelt');
  const [area, setArea] = useState('Parklands');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number>(-12.8024);
  const [longitude, setLongitude] = useState<number>(28.2132);

  // Step 3: Direct Connectivity (Calls & WhatsApp)
  const [phone, setPhone] = useState('+260 97 ');
  const [whatsapp, setWhatsapp] = useState('+260 97 ');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');

  // Step 4: Statutory Compliance & Documents (PACRA & ZRA)
  const [applicantName, setApplicantName] = useState('');
  const [applicantRole, setApplicantRole] = useState('Managing Director');
  const [applicantNrc, setApplicantNrc] = useState('');
  const [pacraNumber, setPacraNumber] = useState('');
  const [tpinNumber, setTpinNumber] = useState('');
  const [uploadedPacra, setUploadedPacra] = useState<string>('PACRA_Certificate_Incorporation.pdf');
  const [uploadedTpin, setUploadedTpin] = useState<string>('ZRA_TPIN_Registration_TaxClearance.pdf');
  const [uploadedStorefront, setUploadedStorefront] = useState<string>('Storefront_Facility_Kitwe.jpg');

  // Step 5: Initial Kwacha Offerings
  const [products, setProducts] = useState<Array<{ name: string; price: number; category: string }>>([
    { name: 'Standard Fabrication Service (Per Meter)', price: 450, category: 'Services' },
    { name: 'Heavy Duty Security Grills & Gates', price: 3200, category: 'Building Materials' }
  ]);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState<number>(250);

  // Sample data filler for fast testing
  const handleFillSample = () => {
    setBusinessName('Copperbelt Precision Fabricators Ltd');
    setTagline('Certified structural steel, custom industrial gates, and on-site welding solutions.');
    setCategoryId('home-construction');
    setDescription('Registered engineering and metal fabrication firm supplying construction contractors, commercial estates, and residential builds across Kitwe, Ndola, and Kalulushi.');
    setYearFounded(2021);

    setSelectedCity('Kitwe');
    setSelectedProvince('Copperbelt');
    setArea('Industrial Area');
    setAddress('Plot 1044, Eshowe Road, Heavy Industrial Area, Kitwe');
    setLatitude(-12.8150);
    setLongitude(28.2040);

    setPhone('+260 97 819 2200');
    setWhatsapp('+260 96 410 8899');
    setEmail('info@copperbeltfabricators.co.zm');
    setWebsite('https://copperbeltfabricators.co.zm');

    setApplicantName('Chileshe Mwape');
    setApplicantRole('Principal Engineer & Director');
    setApplicantNrc('392014/11/1');
    setPacraNumber('PACRA-1200984102');
    setTpinNumber('1008492019');
  };

  const handleAddOffering = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;
    setProducts([...products, { name: newProductName.trim(), price: Number(newProductPrice), category: 'General' }]);
    setNewProductName('');
    setNewProductPrice(250);
  };

  const handleRemoveOffering = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const bizId = `biz-${Date.now()}`;
    const refCode = `REG-BWANA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const categoryNames: Record<string, string> = {
      'home-construction': 'Home & Construction',
      'automotive': 'Automotive & Mechanics',
      'food-dining': 'Food & Dining',
      'shopping-retail': 'Shopping & Retail',
      'health-medical': 'Health & Medical',
      'professional-services': 'Professional Services',
      'accommodation': 'Accommodation & Hotels',
      'technology': 'Technology & IT'
    };

    const newBusinessProducts: BusinessProduct[] = products.map((p, idx) => ({
      id: `prod-${bizId}-${idx}`,
      businessId: bizId,
      name: p.name,
      price: p.price,
      priceType: 'fixed',
      currency: 'ZMW',
      inStock: true,
      category: p.category
    }));

    const newBusiness: Business = {
      id: bizId,
      name: businessName.trim() || 'Zambian Enterprise Ltd',
      tagline: tagline.trim() || 'Verified supplier on Bwana Discovery',
      description: description.trim() || 'Quality services and products delivered with reliability across Zambia.',
      categoryId: categoryId,
      categoryName: categoryNames[categoryId] || 'General Business',
      verificationStatus: 'unverified', // Awaiting Admin verification!
      rating: 5.0,
      reviewsCount: 0,
      phone: phone.trim() || '+260 97 000 0000',
      whatsapp: whatsapp.trim() || '+260 97 000 0000',
      email: email.trim(),
      website: website.trim(),
      address: address.trim() || `${area}, ${selectedCity}`,
      area: area.trim() || 'Central',
      city: selectedCity,
      province: selectedProvince,
      coordinates: {
        latitude: latitude || -12.8024,
        longitude: longitude || 28.2132
      },
      coverImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80'
      ],
      isOpenNow: true,
      hours: [
        { day: 'Monday – Friday', open: '08:00', close: '17:00' },
        { day: 'Saturday', open: '08:30', close: '13:00' },
        { day: 'Sunday', open: 'Closed', close: 'Closed', isClosed: true }
      ],
      products: newBusinessProducts,
      createdYear: yearFounded || 2022
    };

    const newVerification: VerificationRequest = {
      id: `ver-${Date.now()}`,
      businessId: bizId,
      businessName: newBusiness.name,
      applicantName: applicantName.trim() || 'Authorized Applicant',
      applicantEmail: email.trim() || 'applicant@bwana.africa',
      applicantPhone: phone.trim() || '+260 97 000 0000',
      pacraRegistrationNo: pacraNumber.trim() || 'PACRA-1200921448',
      tpinNumber: tpinNumber.trim() || '1004928172',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'pending', // PENDING IN ADMIN QUEUE
      notes: `Online Registration via Bwana Portal. Role: ${applicantRole}. NRC: ${applicantNrc || 'Verified in person'}.`,
      documents: [
        { type: 'PACRA Incorporation Certificate', name: uploadedPacra, status: 'uploaded' },
        { type: 'ZRA TPIN Tax Registration', name: uploadedTpin, status: 'uploaded' },
        { type: 'Storefront & GPS Verification', name: uploadedStorefront, status: 'uploaded' }
      ]
    };

    onRegisterBusiness(newBusiness, newVerification);
    setCreatedBusinessId(bizId);
    setCreatedRefCode(refCode);
    setIsSubmitted(true);
  };

  // SUCCESS CONFIRMATION VIEW
  if (isSubmitted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white border border-stone-200 rounded-3xl p-8 sm:p-12 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-semibold">
              Registration Received · Pending Admin Verification
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-stone-900 tracking-tight">
              {businessName || 'Your Business'} is Registered!
            </h2>
            <p className="text-sm text-stone-500 max-w-lg mx-auto">
              Your application has been registered with reference{' '}
              <strong className="font-mono text-stone-800">{createdRefCode}</strong> and queued for Bwana Verification Officers.
            </p>
          </div>

          {/* Registration Dossier Summary Card */}
          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 text-left text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Company Registered</div>
                <div className="text-sm font-bold text-stone-900">{businessName}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Verification Queue</div>
                <span className="text-xs font-mono font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  Pending Review
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Location</span>
                <span className="font-medium text-stone-800">{area}, {selectedCity}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">PACRA Certificate</span>
                <span className="font-mono font-medium text-stone-800">{pacraNumber || 'PACRA-1200984102'}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">ZRA TPIN</span>
                <span className="font-mono font-medium text-stone-800">{tpinNumber || '1008492019'}</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-start gap-3">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-stone-600 text-[11px] leading-relaxed">
                <strong>What happens next?</strong> Bwana compliance staff cross-references your PACRA incorporation and ZRA tax records. Once verified, your business profile receives the official green <strong>Verified Badge (✓)</strong> and priority ranking across Zambia.
              </div>
            </div>
          </div>

          {/* Action Callouts */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onNavigateToAdmin}
              className="w-full sm:w-auto px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Open Admin Verification Side (Review & Verify Now)</span>
            </button>

            <button
              onClick={() => onNavigateToDiscovery(createdBusinessId)}
              className="w-full sm:w-auto px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-stone-500" />
              <span>Preview on Bwana Discovery</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header Banner */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-10 mb-8 border border-stone-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800 font-semibold">
                Bwana Partner Portal · Zambia
              </span>
              <span className="text-xs text-stone-400">·</span>
              <span className="text-xs text-stone-300">Official Merchant Onboarding</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold font-display text-white tracking-tight">
              Register Your Business on Bwana
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl leading-relaxed">
              Connect with customers in Kitwe, Lusaka, Ndola, Livingstone, and across Zambia. Receive direct phone calls, WhatsApp inquiries, and earn the official Bwana Verified Badge (✓).
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={handleFillSample}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-emerald-300 border border-emerald-600/40 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Autofill realistic Zambian business details"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fill Sample Zambian Business</span>
            </button>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-5 gap-2 mt-8 pt-6 border-t border-stone-800 text-xs">
          {[
            { step: 1, title: '1. Identity' },
            { step: 2, title: '2. Location' },
            { step: 3, title: '3. Leads' },
            { step: 4, title: '4. Compliance' },
            { step: 5, title: '5. Catalog' },
          ].map((s) => (
            <button
              key={s.step}
              type="button"
              onClick={() => setCurrentStep(s.step)}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                currentStep === s.step
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                  : currentStep > s.step
                  ? 'bg-stone-950/40 border-emerald-800/40 text-stone-300'
                  : 'bg-stone-950/20 border-stone-800 text-stone-500'
              }`}
            >
              <span className="block text-[11px] truncate">{s.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Registration Form Container */}
      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-2xs space-y-8">
        {/* STEP 1: BUSINESS IDENTITY */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold font-display text-stone-900">
                Step 1: Business Identity & Overview
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Tell prospective customers your business trading name, sector, and core focus.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Official Business / Trading Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Copperbelt Precision Fabricators Ltd"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs sm:text-sm focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Primary Business Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs sm:text-sm focus:border-emerald-600 focus:outline-none bg-white"
                >
                  <option value="home-construction">Home & Construction</option>
                  <option value="automotive">Automotive & Mechanics</option>
                  <option value="food-dining">Food & Dining</option>
                  <option value="shopping-retail">Shopping & Retail</option>
                  <option value="health-medical">Health & Medical</option>
                  <option value="professional-services">Professional Services</option>
                  <option value="accommodation">Accommodation & Hotels</option>
                  <option value="technology">Technology & IT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Year Established
                </label>
                <input
                  type="number"
                  placeholder="2021"
                  value={yearFounded}
                  onChange={(e) => setYearFounded(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs sm:text-sm focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Catchy Business Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Quality welding, custom gates, and structural steel in Kitwe"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs sm:text-sm focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  About the Business / Description *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your products, trade experience, and delivery options for Zambian customers..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs sm:text-sm focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION & GEOGRAPHY */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold font-display text-stone-900">
                Step 2: Location & Physical Storefront
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Bwana is location-driven. Accurate areas allow nearby search (e.g. "within 10km") to route customers to your door.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">Province *</label>
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs sm:text-sm focus:border-emerald-600 focus:outline-none bg-white"
                >
                  <option value="Copperbelt">Copperbelt Province</option>
                  <option value="Lusaka">Lusaka Province</option>
                  <option value="Southern">Southern Province</option>
                  <option value="North-Western">North-Western Province</option>
                  <option value="Eastern">Eastern Province</option>
                  <option value="Central">Central Province</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">City / Town *</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs sm:text-sm focus:border-emerald-600 focus:outline-none bg-white"
                >
                  <option value="Kitwe">Kitwe</option>
                  <option value="Ndola">Ndola</option>
                  <option value="Lusaka">Lusaka</option>
                  <option value="Livingstone">Livingstone</option>
                  <option value="Solwezi">Solwezi</option>
                  <option value="Chipata">Chipata</option>
                  <option value="Kabwe">Kabwe</option>
                  <option value="Kalulushi">Kalulushi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">Area / Suburb *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Parklands, Town Centre, Riverside, Industrial Area"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs sm:text-sm focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">Full Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Plot 418, Independence Avenue or Shop #12"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs sm:text-sm focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">GPS Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs sm:text-sm focus:border-emerald-600 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">GPS Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs sm:text-sm focus:border-emerald-600 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: DIRECT LEADS & CONTACT */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold font-display text-stone-900">
                Step 3: Direct Lead Channels (Phone & WhatsApp)
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Bwana cards feature prominent <strong>'Call'</strong> and <strong>'WhatsApp'</strong> buttons for rapid local customer interaction.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Primary Business Phone (+260) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+260 97 819 2200"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs sm:text-sm focus:border-emerald-600 focus:outline-none font-mono"
                />
                <span className="text-[11px] text-stone-400 mt-1 block">Airtel, MTN, or Zamtel voice line.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  WhatsApp Business Number (+260) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+260 96 410 8899"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs sm:text-sm focus:border-emerald-600 focus:outline-none font-mono"
                />
                <span className="text-[11px] text-emerald-700 mt-1 block">Receives quotation requests and photo inquiries.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">Business Email</label>
                <input
                  type="email"
                  placeholder="contact@mycompany.co.zm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs sm:text-sm focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">Website (Optional)</label>
                <input
                  type="url"
                  placeholder="https://mycompany.co.zm"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs sm:text-sm focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: STATUTORY COMPLIANCE (PACRA & ZRA) */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 font-semibold">
                  Official Verification Dossier
                </span>
              </div>
              <h2 className="text-xl font-bold font-display text-stone-900 mt-1">
                Step 4: PACRA Incorporation & ZRA Tax Compliance
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Submitting verifiable Zambian registration numbers qualifies your profile for the <strong>Verified Badge (✓)</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  PACRA Business Registration No. *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PACRA-1200984102 or BN/189201"
                  value={pacraNumber}
                  onChange={(e) => setPacraNumber(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs sm:text-sm focus:border-emerald-600 focus:outline-none font-mono"
                />
                <span className="text-[11px] text-stone-400 mt-1 block">Cross-referenced against PACRA e-registry.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  ZRA TPIN (10 Digits) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1008492019"
                  value={tpinNumber}
                  onChange={(e) => setTpinNumber(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs sm:text-sm focus:border-emerald-600 focus:outline-none font-mono"
                />
                <span className="text-[11px] text-stone-400 mt-1 block">Taxpayer Identification Number.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Authorized Representative Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chileshe Mwape"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs sm:text-sm focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Position / Role in Company *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Managing Director, Owner, Operations Head"
                  value={applicantRole}
                  onChange={(e) => setApplicantRole(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs sm:text-sm focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  National Registration Card (NRC Number)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 392014/11/1"
                  value={applicantNrc}
                  onChange={(e) => setApplicantNrc(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs sm:text-sm focus:border-emerald-600 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Document Upload Simulator */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <div className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Attached Verification Proofs
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="truncate">
                    <span className="font-semibold block truncate">{uploadedPacra}</span>
                    <span className="text-[10px] text-stone-400">PACRA Certificate</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="truncate">
                    <span className="font-semibold block truncate">{uploadedTpin}</span>
                    <span className="text-[10px] text-stone-400">ZRA Tax Clearance</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="truncate">
                    <span className="font-semibold block truncate">{uploadedStorefront}</span>
                    <span className="text-[10px] text-stone-400">Physical Signboard</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: INITIAL CATALOG (KWACHA PRICING) */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold font-display text-stone-900">
                Step 5: Initial Offerings & Kwacha (ZMW) Pricing
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Merchants with prices listed in Zambian Kwacha receive 4.2x more WhatsApp quotes from discovery users.
              </p>
            </div>

            {/* Existing offerings list */}
            <div className="space-y-2">
              {products.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-semibold text-stone-900">{item.name}</span>
                      <span className="text-stone-400 ml-2">({item.category})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-emerald-700 text-sm">
                      ZMW {item.price.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveOffering(idx)}
                      className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add new offering form */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-3">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Add Another Product or Service
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Product or service name (e.g. Steel Security Door)"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Price (ZMW)"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddOffering}
                    className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-500 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Final Submission Notice */}
            <div className="p-4 bg-stone-900 text-stone-200 rounded-2xl text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Ready for Bwana Verification Submission</span>
              </div>
              <p className="text-stone-400 leading-relaxed text-[11px]">
                By submitting, your application will be routed to Bwana verification officers for PACRA registry check and telephone verification. You will be able to review and approve this directly from the Admin Portal.
              </p>
            </div>
          </div>
        )}

        {/* Stepper Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-stone-200">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>Continue to Step {currentStep + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Complete Registration & Submit for Verification</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
