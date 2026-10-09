# BWANA — System Architecture Specification

## 1. High-Level System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|  +---------------------------+  +---------------------------+  +---------------+  |
|  |     Web Application       |  |  Progressive Web App      |  | Native Mobile |  |
|  | (React 19 / TypeScript 5) |  | (Service Worker/Manifest) |  | (React Native)|  |
|  +---------------------------+  +---------------------------+  +---------------+  |
+-----------------------------------------------------------------------------------+
                                         |
                                  HTTPS / WSS / gRPC
                                         v
+-----------------------------------------------------------------------------------+
|                         GATEWAY & SECURITY PROXY LAYER                           |
|  * TLS 1.3 Termination       * Rate Limiting (Token Bucket)  * CORS & WAF         |
|  * Session/JWT Validation    * PostGIS Spatial Query Router  * Audit Log Tap      |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                           BWANA APPLICATION CORE                                  |
|  +--------------------+  +--------------------+  +-----------------------------+  |
|  |  Identity & RBAC   |  |   Discovery Core   |  |      Merchant Portal        |  |
|  |  * Customer Auth   |  |   * Spatial Search |  |      * Product Catalog      |  |
|  |  * Merchant Roles  |  |   * Tag Filtering  |  |      * Service Rates        |  |
|  |  * Admin Audit     |  |   * Multi-City GPS |  |      * Operating Hours      |  |
|  +--------------------+  +--------------------+  +-----------------------------+  |
|  +--------------------+  +--------------------+  +-----------------------------+  |
|  | Reviews & Ratings  |  | Verification Queue |  |   Event & Deals Dispatch    |  |
|  | * Anti-Spam Check  |  | * PACRA Cross-Check|  |   * Time-to-Live Engine     |  |
|  | * Verified Visit   |  | * ZRA TPIN Validat.|  |   * Push Notifications      |  |
|  +--------------------+  +--------------------+  +-----------------------------+  |
+-----------------------------------------------------------------------------------+
                                         |
                     +-------------------+-------------------+
                     |                                       |
                     v                                       v
+---------------------------------------+  +---------------------------------------+
|        REAL-TIME DOCUMENT STORE       |  |       SPATIAL RELATIONAL STORE        |
|  Google Cloud Firestore               |  |  PostgreSQL 16 + PostGIS 3.4          |
|  * Real-time Snapshot Subscriptions   |  |  * ST_DWithin Radius Search           |
|  * Multi-Device Mutation Sync         |  |  * R-Tree GIST Geography Index        |
|  * Sub-10ms Read Latency              |  |  * Relational Constraints & ACID      |
+---------------------------------------+  +---------------------------------------+
```

---

## 2. Clean Architecture & Domain Boundaries

The application enforces strict separation of concerns across 4 architectural layers:

1. **Domain Layer (`src/types/index.ts`):**
   - Core entities: `Business`, `Category`, `Review`, `VerificationRequest`, `AuditLogEntry`, `SystemUser`, `LocationArea`.
   - Immutable domain rules (e.g. valid rating range `1 <= rating <= 5`, required ZRA/PACRA identifier formats, ISO 8601 timestamps).
   - Zero framework dependencies.

2. **Application Layer (`src/services/firebase.ts` & Domain Handlers):**
   - Real-time snapshot orchestrators (`subscribeToBusinesses`, `subscribeToReviews`, `subscribeToVerifications`).
   - Business use cases: registering an enterprise, approving PACRA verification, submitting verified reviews, voting on feedback helpfulness.
   - Cross-domain event emission (e.g. `VERIFICATION_APPROVED` triggers both business status update and an immutable audit log entry).

3. **Infrastructure Layer:**
   - Cloud Firestore driver with custom connection health test (`getDocFromServer`).
   - Security rule engine (`firestore.rules`) enforcing server-authoritative validation.
   - PWA caching engine and Web App Manifest.

4. **Presentation Layer (`src/components/*`):**
   - Pure, typed React components styled with Tailwind CSS without inline styles.
   - Domain-focused modules:
     - `discovery/`: `HomeScreen`, `SearchResults`, `SavedFavoritesView`
     - `business/`: `BusinessCard`, `BusinessProfileModal`, `BusinessDashboard`, `BusinessRegistrationPortal`
     - `admin/`: `AdminDashboard` with PACRA/ZRA review console
     - `layout/`: `Navbar`, `Footer` with theme switcher and location picker

---

## 3. Mobile Architecture Readiness (React Native / Expo)

The system is designed with a universal TypeScript contract:

```
packages/
  ├── types/            # Shared TypeScript domain models & DTOs
  ├── api-client/       # Shared REST/Firestore client with retry logic
  ├── validation/       # Shared Zod / validation schemas
apps/
  ├── web/              # Current Vite / Next.js web application
  └── mobile/           # React Native / Expo application
```

Mobile applications reuse identical business interfaces, review algorithms, coordinates models, and validation logic without code duplication.
