import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, collection, writeBatch } from 'firebase/firestore';
import cfg from '../../firebase-applet-config.json' with { type: 'json' };
import { Business, Category } from '../types';

const app = getApps().length === 0 ? initializeApp(cfg) : getApp();
const db = getFirestore(app, cfg.firestoreDatabaseId);

export const DATABASE_CATEGORIES: Category[] = [
  {
    id: 'cat-hospital',
    name: 'Hospital',
    slug: 'hospital',
    iconName: 'Hospital',
    description: 'Referral hospitals, surgical centres, trauma units & 24/7 emergency facilities',
    count: 48,
  },
  {
    id: 'cat-private-clinic',
    name: 'Private Clinic',
    slug: 'private-clinic',
    iconName: 'HeartPulse',
    description: 'Private outpatient clinics, family medicine, dental & specialized healthcare suites',
    count: 85,
  },
  {
    id: 'cat-food',
    name: 'Food & Dining',
    slug: 'food-dining',
    iconName: 'Utensils',
    description: 'Restaurants, grills, cafes, bakeries & traditional food',
    count: 342,
  },
  {
    id: 'cat-shopping',
    name: 'Shopping & Retail',
    slug: 'shopping-retail',
    iconName: 'ShoppingBag',
    description: 'Supermarkets, electronics, fashion, markets',
    count: 520,
  },
  {
    id: 'cat-services',
    name: 'Trade & Services',
    slug: 'services',
    iconName: 'Wrench',
    description: 'Plumbing, electrical, repairs, cleaning & crafts',
    count: 418,
  },
  {
    id: 'cat-auto',
    name: 'Automotive',
    slug: 'automotive',
    iconName: 'Car',
    description: 'Mechanics, spare parts, panel beaters, tyres, car wash',
    count: 264,
  },
  {
    id: 'cat-health',
    name: 'Health & Medical',
    slug: 'health-medical',
    iconName: 'HeartPulse',
    description: 'Pharmacies, chemists, optics & wellness dispensaries',
    count: 189,
  },
  {
    id: 'cat-home',
    name: 'Home & Construction',
    slug: 'home-construction',
    iconName: 'Home',
    description: 'Hardware, cement, roofing, timber, painting',
    count: 310,
  },
  {
    id: 'cat-pros',
    name: 'Professionals',
    slug: 'professionals',
    iconName: 'Briefcase',
    description: 'Lawyers, accountants, developers, consultants',
    count: 215,
  },
  {
    id: 'cat-hotels',
    name: 'Accommodation',
    slug: 'accommodation',
    iconName: 'Hotel',
    description: 'Hotels, guest houses, lodges, safari camps',
    count: 176,
  },
  {
    id: 'cat-events',
    name: 'Events & Leisure',
    slug: 'events',
    iconName: 'Calendar',
    description: 'Conferences, expos, concerts, workshops, sports',
    count: 98,
  },
  {
    id: 'cat-edu',
    name: 'Education & Training',
    slug: 'education',
    iconName: 'GraduationCap',
    description: 'Schools, colleges, skill academies, tutoring',
    count: 142,
  },
  {
    id: 'cat-tech',
    name: 'Technology & IT',
    slug: 'technology',
    iconName: 'Laptop',
    description: 'Software houses, networking, hardware repair, printing',
    count: 133,
  },
  {
    id: 'cat-agri',
    name: 'Agriculture & Agro-Dealer',
    slug: 'agriculture',
    iconName: 'Wheat',
    description: 'Seed, fertilizers, farming equipment, veterinary',
    count: 205,
  },
];

export const DATABASE_HOSPITALS_AND_CLINICS: Partial<Business>[] = [
  // -------------------------------------------------------------
  // HOSPITALS (cat-hospital)
  // -------------------------------------------------------------
  {
    id: 'gmp-medland-hospital',
    name: 'Medland Hospital',
    tagline: 'Leading private multi-speciality tertiary hospital in Zambia',
    description:
      'State-of-the-art private hospital in Lusaka offering comprehensive emergency care, cardiology, oncology, pediatric ICU, advanced laparoscopy, in-house laboratory, radiology (MRI/CT), and 24-hour pharmacy.',
    categoryId: 'cat-hospital',
    categoryName: 'Hospital',
    verificationStatus: 'verified',
    verificationTier: 'bwana_verified',
    rating: 4.8,
    reviewsCount: 340,
    phone: '+260 211 430 000',
    whatsapp: '+260 762 430 000',
    email: 'info@medlandhospital.com',
    website: 'https://medlandhospital.com',
    address: 'Corner United Nations Ave & Brentwood Drive, Longacres, Lusaka',
    city: 'Lusaka',
    province: 'Lusaka Province',
    district: 'Lusaka District',
    area: 'Longacres',
    country: 'Zambia',
    countryCode: 'ZM',
    coordinates: {
      latitude: -15.4192,
      longitude: 28.3125,
    },
    coverImage:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
    ],
    isOpenNow: true,
    isFeatured: true,
    tags: ['Hospital', 'Private Hospital', 'Emergency 24/7', 'Cardiology', 'ICU', 'MRI/CT Scan', 'Maternity'],
    attributes: ['24/7 Emergency', 'Ambulance Service', 'Medical Insurance Accepted', 'Wheelchair Access'],
  },
  {
    id: 'gmp-fairview-hospital',
    name: 'Fairview Hospital',
    tagline: 'Private clinical excellence, maternity, and surgical care',
    description:
      'Renowned private hospital in Lusaka established for over 30 years. Provides general surgery, obstetrics & gynecology, pediatrics, dental, optometry, executive wellness checks, and an around-the-clock emergency room.',
    categoryId: 'cat-hospital',
    categoryName: 'Hospital',
    verificationStatus: 'verified',
    verificationTier: 'bwana_verified',
    rating: 4.6,
    reviewsCount: 480,
    phone: '+260 211 253 808',
    whatsapp: '+260 977 253 808',
    email: 'fairview@fairviewhospital.co.zm',
    address: 'Church Road, Fairview, Lusaka',
    city: 'Lusaka',
    province: 'Lusaka Province',
    district: 'Lusaka District',
    area: 'Fairview',
    country: 'Zambia',
    countryCode: 'ZM',
    coordinates: {
      latitude: -15.4158,
      longitude: 28.2936,
    },
    coverImage:
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
    ],
    isOpenNow: true,
    isFeatured: true,
    tags: ['Hospital', 'Private Hospital', 'Maternity', 'Surgery', 'Pediatrics', '24/7 Outpatient'],
    attributes: ['Medical Insurance Accepted', 'Pharmacy On-Site', 'Specialist Clinics'],
  },
  {
    id: 'gmp-kitwe-teaching-hospital',
    name: 'Kitwe Teaching Hospital (KTH)',
    tagline: 'Principal referral and tertiary medical centre of the Copperbelt',
    description:
      'Major government teaching referral hospital equipped with trauma center, eye clinic, surgical units, renal dialysis unit, oncology services, and intensive care catering to Copperbelt and Northern Zambia.',
    categoryId: 'cat-hospital',
    categoryName: 'Hospital',
    verificationStatus: 'verified',
    verificationTier: 'bwana_verified',
    rating: 4.3,
    reviewsCount: 920,
    phone: '+260 212 222 344',
    whatsapp: '+260 977 222 344',
    address: 'Kuomboka Drive, Kitwe',
    city: 'Kitwe',
    province: 'Copperbelt Province',
    district: 'Kitwe District',
    area: 'Central Hospital Zone',
    country: 'Zambia',
    countryCode: 'ZM',
    coordinates: {
      latitude: -12.8028,
      longitude: 28.2162,
    },
    coverImage:
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
    ],
    isOpenNow: true,
    isFeatured: true,
    tags: ['Hospital', 'Referral Hospital', 'Trauma Centre', 'Emergency 24/7', 'Dialysis', 'Teaching Facility'],
    attributes: ['Emergency Trauma Unit', 'Blood Bank', 'Public & High-Cost Wards'],
  },
  {
    id: 'gmp-coptic-hospital',
    name: 'Coptic Hospital Lusaka',
    tagline: 'Affordable, compassionate 24/7 hospital, dental, and eye care',
    description:
      'Renowned mission hospital in Northmead, Lusaka renowned for highly experienced ophthalmology (eye surgeries), comprehensive dental clinic, round-the-clock emergency room, and compassionate general inpatient care.',
    categoryId: 'cat-hospital',
    categoryName: 'Hospital',
    verificationStatus: 'verified',
    verificationTier: 'bwana_verified',
    rating: 4.7,
    reviewsCount: 680,
    phone: '+260 211 292 238',
    whatsapp: '+260 966 292 238',
    address: 'Manchinchi Road, Northmead, Lusaka',
    city: 'Lusaka',
    province: 'Lusaka Province',
    district: 'Lusaka District',
    area: 'Northmead',
    country: 'Zambia',
    countryCode: 'ZM',
    coordinates: {
      latitude: -15.3995,
      longitude: 28.298,
    },
    coverImage:
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
    ],
    isOpenNow: true,
    isFeatured: true,
    tags: ['Hospital', 'Eye Clinic', 'Dental', 'Emergency 24/7', 'Maternity'],
    attributes: ['Affordable Fees', 'Emergency Department', 'Surgical Theatres'],
  },
  {
    id: 'gmp-progress-medical-centre',
    name: 'Progress Medical Centre & Hospital',
    tagline: 'Leading private specialist hospital and diagnostic facility in Kitwe',
    description:
      'Premier private hospital on the Copperbelt offering 24-hour outpatient consultations, modern surgical theatre, high-definition digital ultrasound, biochemistry lab, pediatric ward, and dedicated ambulance response.',
    categoryId: 'cat-hospital',
    categoryName: 'Hospital',
    verificationStatus: 'verified',
    verificationTier: 'bwana_verified',
    rating: 4.6,
    reviewsCount: 295,
    phone: '+260 212 221 440',
    whatsapp: '+260 966 221 440',
    email: 'info@progressmedical.co.zm',
    address: 'Kuomboka Drive, Parklands, Kitwe',
    city: 'Kitwe',
    province: 'Copperbelt Province',
    district: 'Kitwe District',
    area: 'Parklands',
    country: 'Zambia',
    countryCode: 'ZM',
    coordinates: {
      latitude: -12.7985,
      longitude: 28.2215,
    },
    coverImage:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    ],
    isOpenNow: true,
    isFeatured: true,
    tags: ['Hospital', 'Private Hospital', 'Diagnostics Lab', 'Surgeries', 'Ultrasound', 'Copperbelt 24/7'],
    attributes: ['Medical Aid Accepted', 'Inpatient Rooms', 'Emergency Dispatch'],
  },
  {
    id: 'gmp-apex-medical-university',
    name: 'Lusaka Apex Medical University Hospital',
    tagline: 'University clinical teaching hospital, surgery, and diagnostics',
    description:
      'Modern university medical centre providing specialist doctor clinics, radiology, physiotherapy, pathology, maternity care, and pediatric trauma services.',
    categoryId: 'cat-hospital',
    categoryName: 'Hospital',
    verificationStatus: 'verified',
    verificationTier: 'bwana_verified',
    rating: 4.5,
    reviewsCount: 310,
    phone: '+260 211 845 000',
    whatsapp: '+260 977 845 000',
    address: 'Apex Campus, Off Kasama Road, Chalala, Lusaka',
    city: 'Lusaka',
    province: 'Lusaka Province',
    district: 'Lusaka District',
    area: 'Chalala',
    country: 'Zambia',
    countryCode: 'ZM',
    coordinates: {
      latitude: -15.452,
      longitude: 28.341,
    },
    coverImage:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    ],
    isOpenNow: true,
    isFeatured: true,
    tags: ['Hospital', 'University Hospital', 'Maternity', 'Pediatrics', '24/7 Emergency'],
    attributes: ['University Lecturers & Specialists', 'Emergency Care', 'Modern Theatres'],
  },
  {
    id: 'biz-copperbelt-referral-hospital',
    name: 'Copperbelt Referral Hospital & Trauma Center',
    tagline: '24/7 Acute trauma, surgical suites, and intensive care',
    description:
      'Major private trauma centre in Kitwe providing around-the-clock emergency medical response, advanced intensive care, digital CT/MRI imaging, and specialist surgical theatres.',
    categoryId: 'cat-hospital',
    categoryName: 'Hospital',
    verificationStatus: 'verified',
    verificationTier: 'bwana_verified',
    rating: 4.8,
    reviewsCount: 320,
    phone: '+260 212 228 900',
    whatsapp: '+260 977 228 900',
    email: 'admissions@copperbelthospital.co.zm',
    address: 'Plot 102, Independence Avenue, Parklands, Kitwe',
    city: 'Kitwe',
    province: 'Copperbelt Province',
    district: 'Kitwe District',
    area: 'Parklands',
    country: 'Zambia',
    countryCode: 'ZM',
    coordinates: {
      latitude: -12.8015,
      longitude: 28.2198,
    },
    coverImage:
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
    ],
    isOpenNow: true,
    isFeatured: true,
    tags: ['Hospital', 'Trauma Center', 'Emergency 24/7', 'ICU', 'Surgery', 'Ambulance'],
    attributes: ['Helipad Access', 'Dedicated Trauma Unit', 'Direct Insurance Billing'],
  },
  {
    id: 'gmp-ndola-teaching-hospital',
    name: 'Ndola Teaching Hospital',
    tagline: 'Premier tertiary referral hospital and medical school of Ndola',
    description:
      'Principal teaching and referral medical facility serving Ndola and the Copperbelt with 24/7 casualty, maternal-fetal medicine, surgical wards, and intensive dialysis unit.',
    categoryId: 'cat-hospital',
    categoryName: 'Hospital',
    verificationStatus: 'verified',
    verificationTier: 'bwana_verified',
    rating: 4.3,
    reviewsCount: 750,
    phone: '+260 212 612 200',
    whatsapp: '+260 966 612 200',
    address: 'Broadway Avenue, Central Business District, Ndola',
    city: 'Ndola',
    province: 'Copperbelt Province',
    district: 'Ndola District',
    area: 'Central Business District',
    country: 'Zambia',
    countryCode: 'ZM',
    coordinates: {
      latitude: -12.968,
      longitude: 28.643,
    },
    coverImage:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    ],
    isOpenNow: true,
    isFeatured: true,
    tags: ['Hospital', 'Teaching Hospital', 'Emergency 24/7', 'Renal Unit', 'Maternity'],
    attributes: ['Emergency Trauma Care', 'Blood Bank', 'Public & Specialist Wards'],
  },
  {
    id: 'gmp-levy-mwanawasa-hospital',
    name: 'Levy Mwanawasa University Teaching Hospital',
    tagline: 'Modern tertiary university hospital along Great East Road',
    description:
      'Ultra-modern 800-bed university teaching hospital equipped with advanced infectious disease units, cardiology, pediatrics, oncology radiotherapy, and specialized surgical theaters.',
    categoryId: 'cat-hospital',
    categoryName: 'Hospital',
    verificationStatus: 'verified',
    verificationTier: 'bwana_verified',
    rating: 4.5,
    reviewsCount: 890,
    phone: '+260 211 289 110',
    whatsapp: '+260 977 289 110',
    address: 'Great East Road, Chainama, Lusaka',
    city: 'Lusaka',
    province: 'Lusaka Province',
    district: 'Lusaka District',
    area: 'Chainama',
    country: 'Zambia',
    countryCode: 'ZM',
    coordinates: {
      latitude: -15.389,
      longitude: 28.345,
    },
    coverImage:
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
    ],
    isOpenNow: true,
    isFeatured: true,
    tags: ['Hospital', 'Teaching Hospital', 'Emergency 24/7', 'Infectious Disease', 'ICU'],
    attributes: ['Level 1 Trauma', 'Oncology Radiotherapy', 'Helipad'],
  },

  // -------------------------------------------------------------
  // PRIVATE CLINICS (cat-private-clinic)
  // -------------------------------------------------------------
  {
    id: 'gmp-care-for-you-clinic',
    name: 'Care For You Medical Clinic',
    tagline: 'Private community outpatient clinic, family medicine, & dental practice',
    description:
      'Convenient private clinic located in Kitwe CBD offering general practitioner consultations, dental procedures, antenatal wellness, minor surgical procedures, and accredited clinical diagnostic laboratory tests.',
    categoryId: 'cat-private-clinic',
    categoryName: 'Private Clinic',
    verificationStatus: 'verified',
    verificationTier: 'bwana_verified',
    rating: 4.5,
    reviewsCount: 190,
    phone: '+260 212 227 100',
    whatsapp: '+260 977 227 100',
    address: 'Independence Avenue, City Centre, Kitwe',
    city: 'Kitwe',
    province: 'Copperbelt Province',
    district: 'Kitwe District',
    area: 'City Centre',
    country: 'Zambia',
    countryCode: 'ZM',
    coordinates: {
      latitude: -12.812,
      longitude: 28.211,
    },
    coverImage:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    ],
    isOpenNow: true,
    tags: ['Private Clinic', 'Dental Clinic', 'Blood Testing', 'Family Doctor', 'Prescriptions'],
    attributes: ['Fast Track Appointments', 'Medical Aid Accepted', 'Discreet Consultations'],
  },
  {
    id: 'gmp-corpmed-medical',
    name: 'Corpmed Medical Centre',
    tagline: 'Private corporate wellness, emergency response, and diagnostics',
    description:
      'Executive private clinic in Rhodes Park, Lusaka catering to corporate organizations and private families. Features corporate health surveillance, private physician consultations, ultrasound, ECG, and vaccine center.',
    categoryId: 'cat-private-clinic',
    categoryName: 'Private Clinic',
    verificationStatus: 'verified',
    verificationTier: 'bwana_verified',
    rating: 4.7,
    reviewsCount: 210,
    phone: '+260 211 256 000',
    whatsapp: '+260 977 256 000',
    address: 'Addis Ababa Drive, Rhodes Park, Lusaka',
    city: 'Lusaka',
    province: 'Lusaka Province',
    district: 'Lusaka District',
    area: 'Rhodes Park',
    country: 'Zambia',
    countryCode: 'ZM',
    coordinates: {
      latitude: -15.411,
      longitude: 28.3045,
    },
    coverImage:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    ],
    isOpenNow: true,
    tags: ['Private Clinic', 'Corporate Health', 'Vaccines', 'ECG Diagnostics', 'Executive Wellness'],
    attributes: ['Dedicated Doctor Consultations', 'Direct Insurance Billing', 'Modern Lab'],
  },
  {
    id: 'gmp-bauleni-health',
    name: 'Bauleni Community Health Care Clinic',
    tagline: 'Family outpatient consultations, antenatal checks, and pharmacy',
    description:
      'Accessible community primary care clinic in Bauleni, Lusaka providing family doctor check-ups, infant immunizations, laboratory blood screenings, and chronic medication refills.',
    categoryId: 'cat-private-clinic',
    categoryName: 'Private Clinic',
    verificationStatus: 'verified',
    verificationTier: 'bwana_verified',
    rating: 4.4,
    reviewsCount: 145,
    phone: '+260 211 267 890',
    whatsapp: '+260 966 267 890',
    address: 'Plot 45, Leopard’s Hill Road, Bauleni, Lusaka',
    city: 'Lusaka',
    province: 'Lusaka Province',
    district: 'Lusaka District',
    area: 'Bauleni',
    country: 'Zambia',
    countryCode: 'ZM',
    coordinates: {
      latitude: -15.438,
      longitude: 28.358,
    },
    coverImage:
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
    ],
    isOpenNow: true,
    tags: ['Private Clinic', 'Community Health', 'Antenatal Care', 'Vaccines', 'Pharmacy'],
    attributes: ['Primary Care Walk-in', 'Prescription Dispensary', 'Nurse Consultations'],
  },
  {
    id: 'biz-parklands-family-clinic',
    name: 'Parklands Family Health Clinic',
    tagline: 'Compassionate general practice, pediatrics, and diagnostic care',
    description:
      'Modern private family clinic in Parklands, Kitwe offering general practitioner consultations, wellness checkups, digital pathology tests, ultrasound scans, and preventative healthcare for the whole family.',
    categoryId: 'cat-private-clinic',
    categoryName: 'Private Clinic',
    verificationStatus: 'verified',
    verificationTier: 'bwana_verified',
    rating: 4.7,
    reviewsCount: 165,
    phone: '+260 212 225 110',
    whatsapp: '+260 977 225 110',
    email: 'info@parklandsclinic.co.zm',
    address: 'Kuomboka Drive, Parklands, Kitwe',
    city: 'Kitwe',
    province: 'Copperbelt Province',
    district: 'Kitwe District',
    area: 'Parklands',
    country: 'Zambia',
    countryCode: 'ZM',
    coordinates: {
      latitude: -12.799,
      longitude: 28.2205,
    },
    coverImage:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    ],
    isOpenNow: true,
    tags: ['Private Clinic', 'General Practice', 'Pediatrics', 'Laboratory', 'Dental'],
    attributes: ['Same-Day Appointments', 'Child Wellness Hub', 'Card & Mobile Money'],
  },
  {
    id: 'gmp-pearl-medical-clinic',
    name: 'Pearl Medical Diagnostic Clinic',
    tagline: 'Private family medicine, imaging diagnostics, & executive wellness',
    description:
      'Established private clinic in Kansenshi, Ndola. Offers comprehensive general practitioner consultations, 4D ultrasound, hematology lab, corporate physicals, and specialized women’s wellness services.',
    categoryId: 'cat-private-clinic',
    categoryName: 'Private Clinic',
    verificationStatus: 'verified',
    verificationTier: 'bwana_verified',
    rating: 4.6,
    reviewsCount: 130,
    phone: '+260 212 615 330',
    whatsapp: '+260 977 615 330',
    address: 'Kansenshi Shopping Area, Ndola',
    city: 'Ndola',
    province: 'Copperbelt Province',
    district: 'Ndola District',
    area: 'Kansenshi',
    country: 'Zambia',
    countryCode: 'ZM',
    coordinates: {
      latitude: -12.959,
      longitude: 28.632,
    },
    coverImage:
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
    ],
    isOpenNow: true,
    tags: ['Private Clinic', 'Family Medicine', 'Ultrasound', 'Pharmacy', 'General Practitioner'],
    attributes: ['Fast Lab Results', 'Insurance Accepted', 'Doctor on Call'],
  },
  {
    id: 'gmp-lusaka-south-clinic',
    name: 'Lusaka South Wellness & Medical Clinic',
    tagline: 'Outpatient clinical consultations, minor theatre, and pathology',
    description:
      'Premier private medical suite located in Woodlands, Lusaka. Staffed by senior medical consultants, offering fast-track consultations, routine health checks, clinical pathology, and minor surgical procedures.',
    categoryId: 'cat-private-clinic',
    categoryName: 'Private Clinic',
    verificationStatus: 'verified',
    verificationTier: 'bwana_verified',
    rating: 4.8,
    reviewsCount: 180,
    phone: '+260 211 263 440',
    whatsapp: '+260 966 263 440',
    address: 'Woodlands Shopping Complex, Lusaka',
    city: 'Lusaka',
    province: 'Lusaka Province',
    district: 'Lusaka District',
    area: 'Woodlands',
    country: 'Zambia',
    countryCode: 'ZM',
    coordinates: {
      latitude: -15.441,
      longitude: 28.327,
    },
    coverImage:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    ],
    isOpenNow: true,
    tags: ['Private Clinic', 'Wellness', 'Pediatrics', 'Dental', 'Full Blood Count'],
    attributes: ['Dedicated Specialist Care', 'Direct Medical Aid Billing', 'Ample Parking'],
  },
  {
    id: 'gmp-rhodes-park-clinic',
    name: 'Rhodes Park Medical Suite & Dental Clinic',
    tagline: 'Boutique private medical, dental, and eye wellness center',
    description:
      'Exclusive private clinic on Bishop’s Road in Rhodes Park, Lusaka providing personalized doctor consultations, advanced restorative dentistry, optical refraction, and preventive corporate screenings.',
    categoryId: 'cat-private-clinic',
    categoryName: 'Private Clinic',
    verificationStatus: 'verified',
    verificationTier: 'bwana_verified',
    rating: 4.7,
    reviewsCount: 195,
    phone: '+260 211 251 120',
    whatsapp: '+260 977 251 120',
    address: 'Bishop’s Road, Rhodes Park, Lusaka',
    city: 'Lusaka',
    province: 'Lusaka Province',
    district: 'Lusaka District',
    area: 'Rhodes Park',
    country: 'Zambia',
    countryCode: 'ZM',
    coordinates: {
      latitude: -15.413,
      longitude: 28.309,
    },
    coverImage:
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
    ],
    isOpenNow: true,
    tags: ['Private Clinic', 'Dentistry', 'Orthodontics', 'Specialist Physician', 'Echo'],
    attributes: ['Private Suites', 'Digital Dental X-Ray', 'Express Appointments'],
  },
  // -------------------------------------------------------------
  // CORE ENTERPRISES & ANCHOR STORES
  // -------------------------------------------------------------
  {
    id: 'biz-abc-hardware',
    name: 'ABC Hardware & Construction',
    tagline: 'Everything you need for construction, renovation, and industrial maintenance.',
    description:
      'ABC Hardware is Kitwe’s premier supplier of certified building supplies, Portland cement, steel reinforcement, chromadek roofing sheets, plumbing fixtures, and power tools. Serving both large civil contractors and residential builders across the Copperbelt since 2011.',
    categoryId: 'cat-home',
    categoryName: 'Home & Construction',
    secondaryCategories: ['Trade & Services', 'Shopping & Retail'],
    verificationStatus: 'verified',
    verificationTier: 'bwana_verified',
    rating: 4.7,
    reviewsCount: 142,
    phone: '+260 97 748 1920',
    whatsapp: '260977481920',
    email: 'sales@abchardwarekitwe.co.zm',
    website: 'https://abchardware.co.zm',
    address: 'Plot 418, Independence Avenue, Parklands',
    area: 'Parklands',
    city: 'Kitwe',
    province: 'Copperbelt',
    coordinates: { latitude: -12.8041, longitude: 28.2145 },
    coverImage:
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    ],
    isOpenNow: true,
    isFeatured: true,
    tags: [
      'Wheelchair Accessible',
      'Delivery Available',
      'Card & Mobile Money',
      'Customer Parking',
      'ZABS Compliant',
      'Bulk Pricing',
    ],
    products: [
      {
        id: 'prod-1',
        businessId: 'biz-abc-hardware',
        name: 'Portland Cement (50kg Bag, 32.5R)',
        description: 'High-strength structural cement conforming to ZABS standards. Pallet discounts available.',
        price: 145,
        priceType: 'fixed',
        currency: 'ZMW',
        inStock: true,
        category: 'Building Materials',
      },
      {
        id: 'prod-2',
        businessId: 'biz-abc-hardware',
        name: 'Chromadek Roofing Sheets (0.4mm, 6m)',
        description: 'Weather-resistant corrugated metal roofing available in Brunswick Green, Traffic Red, and Slate Grey.',
        price: 350,
        priceType: 'fixed',
        currency: 'ZMW',
        inStock: true,
        category: 'Roofing',
      },
      {
        id: 'prod-3',
        businessId: 'biz-abc-hardware',
        name: 'DeWalt 18V Cordless Impact Drill',
        description: 'Heavy-duty brushless hammer drill with two 4.0Ah batteries and tough system carry case.',
        price: 2450,
        priceType: 'fixed',
        currency: 'ZMW',
        inStock: true,
        category: 'Power Tools',
      },
    ],
  },
];

export const DATABASE_BUSINESSES: Business[] = DATABASE_HOSPITALS_AND_CLINICS as Business[];

/**
 * Synchronizes database collections directly in Firestore.
 * Adds specialized categories: cat-hospital, cat-private-clinic
 * Seeds and updates all hospitals, clinics, and businesses.
 */
export async function seedDatabaseData(): Promise<void> {
  console.log('Synchronizing Firestore categories and businesses...');

  // 1. Seed/Update Categories in Firestore
  for (const cat of DATABASE_CATEGORIES) {
    const docRef = doc(db, 'categories', cat.id);
    await setDoc(docRef, cat, { merge: true });
  }
  console.log(`Successfully verified ${DATABASE_CATEGORIES.length} categories in Firestore.`);

  // 2. Seed/Update Hospitals, Clinics, and Anchor Businesses in Firestore
  for (const biz of DATABASE_HOSPITALS_AND_CLINICS) {
    if (!biz.id) continue;
    const docRef = doc(db, 'businesses', biz.id);
    await setDoc(docRef, biz, { merge: true });
  }
  console.log(`Successfully verified ${DATABASE_HOSPITALS_AND_CLINICS.length} hospitals, clinics, and core enterprises in Firestore.`);
}

// Allow direct CLI execution: `npx tsx src/services/dbSeeder.ts`
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('dbSeeder')) {
  seedDatabaseData()
    .then(() => {
      console.log('Database seeding completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Database seeding failed:', err);
      process.exit(1);
    });
}
