# Bwana Business Insights, Dual-Side Authentication, Refined Brand Logo & 5km Flash Deals

A comprehensive enhancement to the Bwana platform introducing a dedicated **Business Insights** analytics suite in the merchant dashboard (featuring both Recharts trends and bespoke D3 engagement heatmaps), an elevated authentic Zambian marketplace **Logo & Brand Identity**, a complete **Customer & Business Login & Registration** ecosystem with Firebase authentication, and a high-conversion **Flash Deals** engine delivering active, time-sensitive promotions within 5km of the user.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and UX choices have been confirmed through Phase 1 clarification:
> - **Visualization Engine**: Both **Recharts** (for interactive responsive line/area engagement curves and review growth trajectory) and **D3** (for bespoke hourly visitor engagement radar/heatmap distribution and conversion funnels) will be integrated side-by-side in the Business Insights tab.
> - **Authentication & Registration Architecture**: An all-inclusive approach combining:
>   1. A **Unified Auth Modal** with clean tabbed switching between "Customer Account" and "Business Partner", supporting both Login and multi-step Registration with validation;
>   2. A **Dedicated Business Portal Gateway** ("Bwana for Business") with standalone business onboarding, PACRA registration check, and merchant credentials;
>   3. **Google One-Tap / Firebase Popup** authentication with automated role resolution.
> - **Flash Deals Delivery**: Both interactive **Live Countdown Cards** (with real-time ticking timers, % discount badges, voucher claims, and direct in-app merchant chat) and an **Interactive Voucher Carousel / Grid** with copyable coupon codes and 1-click in-app directions map navigation.

---

## 1. Overview & Core Concept

- **What It Does**:
  1. **Business Insights View**: Merchants access real-time visual analytics within their Business Dashboard. They can toggle between Recharts 30-day/90-day engagement trends (profile impressions, click-to-call, click-to-chat, directions requests) and custom D3 visitor engagement distribution charts alongside weekly review acquisition and average sentiment velocity.
  2. **Refined Bwana Brand Mark & Logo**: Modernizes the Bwana brand asset into a distinguished vector mark embodying Zambian commerce—interlocking the letter "B" with commerce compass geometries and an emerald sovereign seal, paired with balanced display typography.
  3. **Dual-Side Authentication & Merchant Registration**: Provides dedicated registration pipelines for general Zambian shoppers (phone/email/NRC verification) and commercial enterprises (business name, category, city/province, PACRA registration number, contact person, working hours, and password credentials) backed by Firestore persistence.
  4. **5km Geofenced Flash Deals**: Computes real-time Haversine distance from the user's selected location (Lusaka, Kitwe, Ndola, etc.) to showcase active, time-limited promotions expiring within hours or days, featuring live ticking second-by-second countdowns and direct claim triggers.

- **Target Audience / Persona**:
  - **Local Merchants & Shop Owners**: Hardware suppliers, clinics, grocers, and service providers who need actionable analytics on how customers discover them and a straightforward way to claim and manage their digital storefront.
  - **Zambian Shoppers**: Residents searching for verified services nearby who want instant access to exclusive time-sensitive bargains and direct in-app communication without leaving the platform.

- **Key Value**:
  Transforms Bwana from a directory into a high-utility commercial operating system: merchants gain transparency into footfall and digital leads, while shoppers discover hyper-local discounts with zero redirection to external platforms.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Merchant Insights Discovery**:
   - Merchant navigates to **Business Dashboard** $\rightarrow$ clicks the new **"Insights & Analytics"** tab.
   - Merchant selects time horizons (**7 Days**, **30 Days**, **90 Days**).
   - Recharts visualizes dual-axis visitor engagement curves (Profile Impressions vs. High-Intent Actions like Calls, Directions, and In-App Chats).
   - Beside it, an interactive D3 Heatmap/Arc renders peak visitor hours and customer sentiment distribution from weekly reviews.
   - A weekly review growth trajectory chart highlights customer feedback velocity and response rates.

2. **Dual-Side Registration & Authentication Flow**:
   - Visitor clicks **"Sign In"** or **"Register Business"** in the navigation header.
   - The user selects their intent: **"Customer Account"** (personal favorites, order tracking, direct chats) or **"Business Merchant"** (store listing, inventory, promotions, and analytics).
   - In **Business Registration Mode**, a 2-step onboarding wizard collects:
     - *Step 1: Business Identity* (Legal Name, Trading Name, Category, City, District/Area, Physical Address).
     - *Step 2: Owner Credentials & Verification* (Owner/Manager Name, Phone, Official Email, Password, Optional PACRA number).
   - Upon completion, the business document is stored in Firestore with an assigned owner ID, automatically unlocking the Business Dashboard.

3. **Hyper-Local 5km Flash Deals Flow**:
   - Customer opens **HomeScreen** $\rightarrow$ right below the Hero Discovery search, a prominent **"⚡ Flash Deals Within 5km"** banner highlights live deals.
   - If no deals exist within strict 5km, an intelligent dynamic radius expansion badge ("Expanding to 10km...") seamlessly surfaces the closest merchant offers.
   - Each card features:
     - Live countdown clock (`04h 32m 18s`) updating every second.
     - Discount pill (`25% OFF`) and merchant badge with verified checkmark.
     - "Claim Voucher" button that copies the voucher code and launches **Bwana In-App Direct Chat** with the merchant pre-populated with deal redemption details.
     - "Directions" button that triggers in-app route navigation on the embedded map.

### Visual Identity & Theme

- **Aesthetic Direction**: Contemporary African Commerce Minimalist. Clean, authoritative, uncluttered, and enterprise-grade.
- **Refined Logo Composition**:
  - A bespoke SVG geometric emblem: Interlocking emerald prism forming an architectural "B" and open door motif, symbolizing transparent Zambian commerce.
  - Paired with crisp wordmark: **Bwana** in `Plus Jakarta Sans` bold, accented by a subtle copper/gold dot honoring Zambia's Copperbelt heritage, with subtitle "Commercial Directory & Marketplace".
- **Color Tokens**:
  - Dominant Canvas: `bg-stone-50 dark:bg-stone-950`
  - Structural Surfaces: `bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800`
  - Emerald Primary Accent: `text-emerald-700 bg-emerald-600 hover:bg-emerald-700`
  - Copper/Amber Urgency Accent: `text-amber-600 bg-amber-500/10 border-amber-500/30` for time-sensitive deals
- **Typography**:
  - Display & Headings: `Plus Jakarta Sans` (tight tracking, balanced wrap)
  - Body & Form Controls: `Plus Jakarta Sans` / `DM Sans`
  - Telemetry, Timers & Tabular Metrics: `font-mono tabular-nums`

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Visualization Architecture (Recharts + Bespoke D3)**:
  - *Chosen Approach*: Utilize Recharts for standard responsive time-series charts (smoothened Area and Composed Line/Bar charts for views and conversion actions), paired with a custom React-wrapped D3 component for circular engagement distribution and day/hour heatmaps.
  - *Why*: Recharts delivers flawless SVG responsiveness and accessible tooltips out-of-the-box, while D3 provides granular mathematical control over custom radial and matrix charts without chart template limitations.

- **Decision 2: Business Registration & Auth Persistence**:
  - *Chosen Approach*: Provide a unified modal that toggles between Customer and Business personas, plus a dedicated "Register Your Business" portal page. Persist businesses in the Firestore `businesses` collection, linking the authenticated user's UID to `ownerId` and setting their session role to `business_owner`.
  - *Why*: Allows immediate operational capability without forcing business owners into a separate app, while maintaining strict Role-Based Access Control (RBAC).

- **Decision 3: Flash Deals Distance Filtering (Haversine 5km)**:
  - *Chosen Approach*: Calculate exact spherical distances using latitude and longitude from the user's active `currentLocation` to the business coordinates. Deals are ranked by urgency (closest expiration) and proximity ($\le 5\text{km}$).
  - *Why*: Ensures deals are actionable locally—a shopper in Kitwe Riverside will not see a flash promotion for a bakery in Lusaka Woodlands unless they specifically switch locations.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Bwana Application Shell                         │
├───────────────────────────────────┬────────────────────────────────────┤
│           Top Navbar              │          HomeScreen                │
│  - Refined Bwana Vector Logo      │  - 5km Flash Deals Section         │
│  - Dual-Auth Trigger (User/Biz)   │    * Real-time Countdown Timer     │
│  - Location & Search Bar          │    * 1-Click Voucher Claim         │
│                                   │    * In-App Direct Chat Launch     │
├───────────────────────────────────┼────────────────────────────────────┤
│       Business Dashboard          │       Authentication System        │
│  - "Business Insights" Tab        │  - Unified Auth Modal              │
│    * Recharts Engagement Trends   │    * Tab 1: Customer (Phone/Email) │
│    * Recharts Weekly Review Growth│    * Tab 2: Business (Store info)  │
│    * D3 Hourly Activity Heatmap   │  - Dedicated Business Onboarding   │
│  - Customer Chats & Orders        │  - Firebase Auth + Firestore Link  │
└───────────────────────────────────┴────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Firestore Database Services                       │
│  - /businesses/{businessId}          (Stores listing & ownerId)        │
│  - /businesses/{businessId}/promos   (Active time-bounded deals)       │
│  - /users/{userId}                   (Customer & Merchant profiles)    │
│  - /conversations/{convoId}          (In-app user-to-merchant chat)    │
└────────────────────────────────────────────────────────────────────────┘
```

### Component & State Mapping

1. **`BwanaLogo.tsx`**:
   - Reusable scalable SVG component supporting `compact`, `full`, and `monochrome` variations with light/dark optical balance.
2. **`BusinessInsightsView.tsx`**:
   - Renders inside `BusinessDashboard`.
   - Manages state for time filter range (`7d`, `30d`, `90d`).
   - Renders Recharts `AreaChart` and `BarChart` for visitor interactions (views, calls, WhatsApp clicks, directions).
   - Renders D3 `HourlyHeatmapCanvas` for customer peak engagement hours.
   - Renders Recharts `ComposedChart` for weekly review ratings trend and cumulative volume.
3. **`FlashDealsSection.tsx`**:
   - Computes distance against `currentLocation` (lat/lng).
   - Runs a 1-second `setInterval` clock computing remaining hours, minutes, and seconds.
   - Provides direct trigger to `DirectChatModal` with promo code pre-pended.
4. **`BusinessAuthModal.tsx` & `Navbar.tsx` Integration**:
   - Connects to Firebase authentication (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `signInWithGooglePopup`).
   - Registers business document in Firestore when new business signs up.
