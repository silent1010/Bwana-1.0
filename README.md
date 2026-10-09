# BWANA — Production-Grade Business Discovery Platform

**Primary Initial Market:** Zambia (Lusaka, Copperbelt/Kitwe, Ndola, Livingstone, Solwezi)  
**Future Target Market:** Southern Africa (SADC) & Pan-African Expansion  
**Platform Architecture:** Web Application, PWA, Native Mobile (React Native/Expo Ready), Cloud-Scale Real-Time Backend  
**Database:** Cloud Firestore & PostgreSQL/PostGIS Spatial Relational Architecture  

---

## 1. Executive Overview

**Bwana** is a production-grade, location-based business discovery platform engineered specifically for African commerce, urban mobility, and trade ecosystems. It combines the utility of Google Maps, Yelp, Yellow Pages, and verified professional registries with deep local adaptations:

- **Local Identification & Verification:** Cross-verification against PACRA registration and ZRA TPIN compliance to eliminate ghost businesses and scam listings.
- **Multimodal Communications:** Real-time WhatsApp direct messaging, cellular one-click dialing, and live GPS directions.
- **Spatial Proximity:** PostGIS `ST_DWithin` spatial indices with live coordinates, radius constraints, and neighborhood clustering.
- **Zero-Pill Accessibility:** Strict typography, accessible contrast, and instant tag filtering (e.g. `24/7 Open`, `Wheelchair Accessible`, `Delivery Available`, `Card & Mobile Money`).
- **Real-Time Data Layer:** Live Firestore database with bi-directional synchronization, optimistic updates, and multi-tenant security rules.

---

## 2. Technology Stack

- **Web Frontend:** React 19, TypeScript 5, Vite, Tailwind CSS, Lucide Icons
- **Real-Time Data Engine:** Cloud Firestore (`ai-studio-bwana-d9336748-f031-436d-bcac-cb70413ff046`), Security Rules 2.0
- **Spatial Engine Specification:** PostgreSQL 16 + PostGIS 3.4 (`GEOGRAPHY(Point, 4326)`), R-Tree GIST Spatial Index
- **API Contracts:** RESTful JSON API (`/api/v1/*`), OpenAPI/Swagger Schema Ready
- **PWA & Mobile:** Manifest v3, Service Worker caching, React Native/Expo shared type contracts

---

## 3. Core User Flows (End-to-End Functional)

### 3.1 Customer Discovery & Interaction
1. **Explore Nearby:** Select location (e.g., Kitwe, Parklands, Lusaka, Ndola).
2. **Search & Filter:** Search by keyword, category, city, or certified attribute tags (e.g., `24/7 Open`, `Wheelchair Accessible`).
3. **Map Experience:** Toggle between Grid view, Split map/list view, or Full interactive spatial map with GPS markers.
4. **Inspect Business Profile:** View catalog products, services with rates, operating hours, active promotions, and photo galleries.
5. **Action:** Call directly, start WhatsApp chat, calculate driving directions, copy permanent shortlink, or scan SVG QR code.
6. **Save to Favorites:** Bookmark businesses to access anytime in the dedicated `Saved` tab.
7. **Leave Verified Review:** Submit ratings (1–5 stars), detailed comments, helpful votes, and tag feedback with instant live persistence.

### 3.2 Business Owner Operations
1. **Register New Enterprise:** Submit business name, category, coordinates, phone, WhatsApp, and statutory compliance (PACRA / ZRA).
2. **Claim Existing Profile:** Initiate an ownership claim with supporting documentation.
3. **Manage Real-Time Catalog:** Update products, prices, services, operating hours, and promotions in real time.
4. **Customer Engagement:** Respond to verified customer reviews and inspect conversion analytics.

### 3.3 Administrative & Statutory Governance
1. **Verification Queue:** Review pending PACRA & ZRA filings with automated checksum checks.
2. **One-Click Approval/Rejection:** Instantly updates business status to `verified` and notifies the business owner in real time.
3. **Audit Trail:** Append-only compliance log recording timestamp, actor, role, IP, and target entities.

---

## 4. Local Development Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation & Run
```bash
# Clone the repository
git clone https://github.com/bwana/bwana-platform.git
cd bwana-platform

# Install dependencies
npm install

# Start development server
npm run dev

# Lint & Typecheck
npm run lint

# Compile production bundle
npm run build
```

The application runs on `http://localhost:3000`.

---

## 5. Architectural Deliverables Index

- [`ARCHITECTURE.md`](./ARCHITECTURE.md): System architecture, clean domain boundaries, and mobile shared contracts.
- [`DATABASE.md`](./DATABASE.md): Relational & Firestore schemas, PostGIS spatial queries, and indices.
- [`API.md`](./API.md): Versioned REST API specifications and response standards.
- [`SECURITY.md`](./SECURITY.md): RBAC matrix, token security, and Firestore security rules.
- [`DEPLOYMENT.md`](./DEPLOYMENT.md): Containerization, cloud infrastructure, and CI/CD pipelines.
- [`CONTRIBUTING.md`](./CONTRIBUTING.md): Engineering standards, SOLID principles, and testing guidelines.
