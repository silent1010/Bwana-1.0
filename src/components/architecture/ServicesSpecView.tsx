import React, { useState } from 'react';
import {
  Server,
  Shield,
  Compass,
  Building2,
  Cpu,
  ArrowRight,
  Database,
  Radio,
  Network,
  Terminal,
  Layers,
  Key,
  CheckCircle,
  FileCode,
  Copy,
  Check
} from 'lucide-react';

export const ServicesSpecView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'gateway' | 'discovery' | 'identity' | 'business' | 'protocols' | 'flow'>('gateway');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const protoDefinition = `// =========================================================================
// BWANA INTERNAL INTER-SERVICE PROTOBUF DEFINITIONS (v1alpha)
// High-throughput binary RPC over HTTP/2 between Gateway & Core Services
// =========================================================================
syntax = "proto3";

package bwana.v1;

// -------------------------------------------------------------
// 1. IDENTITY SERVICE PROTOBUF DEFINITION
// -------------------------------------------------------------
service IdentityService {
  rpc RequestPhoneOtp (PhoneOtpRequest) returns (PhoneOtpResponse);
  rpc VerifyPhoneOtp (VerifyPhoneOtpRequest) returns (AuthTokenResponse);
  rpc AuthenticateGoogle (GoogleAuthRequest) returns (AuthTokenResponse);
  rpc ValidateToken (TokenValidationRequest) returns (UserSessionClaims);
  rpc GetUserProfile (UserProfileRequest) returns (UserProfileResponse);
}

message PhoneOtpRequest {
  string phone_e164 = 1;      // e.g. "+260977481920"
  string client_ip = 2;
  string user_agent = 3;
}

message PhoneOtpResponse {
  string challenge_id = 1;
  int32 expires_in_seconds = 2; // Default: 300 (5 mins)
  bool test_mode = 3;
}

message VerifyPhoneOtpRequest {
  string challenge_id = 1;
  string otp_code = 2;         // 6-digit numeric string
}

message AuthTokenResponse {
  string access_token = 1;     // JWT (15 min expiry)
  string refresh_token = 2;    // Opaque Redis token (30 days)
  int64 expires_at = 3;
  UserSessionClaims user = 4;
}

message TokenValidationRequest {
  string access_token = 1;
}

message UserSessionClaims {
  string user_id = 1;
  string phone = 2;
  string email = 3;
  string role = 4;             // "customer", "business_owner", "professional", "staff", "admin"
  repeated string permissions = 5;
  string active_business_id = 6;
}

message UserProfileRequest {
  string user_id = 1;
}

message UserProfileResponse {
  string user_id = 1;
  string full_name = 2;
  string phone = 3;
  string email = 4;
  string role = 5;
  string avatar_url = 6;
  bool is_verified = 7;
}

// -------------------------------------------------------------
// 2. DISCOVERY SERVICE PROTOBUF DEFINITION
// -------------------------------------------------------------
service DiscoveryService {
  rpc SearchNearby (NearbySearchRequest) returns (NearbySearchResponse);
  rpc ParseNaturalQuery (NaturalQueryRequest) returns (ParsedQueryIntent);
  rpc AutocompleteLocations (AutocompleteRequest) returns (AutocompleteResponse);
}

message NearbySearchRequest {
  double user_latitude = 1;
  double user_longitude = 2;
  double radius_km = 3;        // default: 10.0
  string query = 4;            // text search e.g. "cement", "Shoprite"
  string category_id = 5;      // optional category filter
  bool only_verified = 6;
  bool only_open_now = 7;
  int32 page_limit = 8;        // default: 20
  int32 page_offset = 9;
}

message NearbySearchResponse {
  repeated DiscoveredBusinessItem items = 1;
  int32 total_matched = 2;
  string postgis_execution_ms = 3;
  ParsedQueryIntent parsed_intent = 4;
}

message DiscoveredBusinessItem {
  string business_id = 1;
  string name = 2;
  string tagline = 3;
  string category_name = 4;
  string area_name = 5;
  string city = 6;
  double distance_km = 7;
  double rating = 8;
  int32 reviews_count = 9;
  string verification_status = 10;
  bool is_open_now = 11;
  string phone = 12;
  string whatsapp = 13;
  string thumbnail_url = 14;
}

message NaturalQueryRequest {
  string raw_query = 1;
  double context_lat = 2;
  double context_lon = 3;
}

message ParsedQueryIntent {
  string intent_type = 1;     // "CATEGORY_BROWSE", "SPECIFIC_BUSINESS", "TRADE_PRO", "LOCAL_SERVICE"
  string detected_category = 2;
  string detected_location = 3;
  double detected_radius_km = 4;
  string sanitized_text = 5;
}

message AutocompleteRequest {
  string prefix = 1;
  string country_code = 2;    // "ZM"
}

message AutocompleteResponse {
  repeated string suggestions = 1;
}

// -------------------------------------------------------------
// 3. BUSINESS SERVICE PROTOBUF DEFINITION
// -------------------------------------------------------------
service BusinessService {
  rpc GetBusinessProfile (BusinessProfileRequest) returns (BusinessProfileResponse);
  rpc BatchGetSummaries (BatchSummariesRequest) returns (BatchSummariesResponse);
  rpc ClaimBusiness (ClaimBusinessRequest) returns (ClaimBusinessResponse);
  rpc ManageProducts (ManageProductsRequest) returns (ManageProductsResponse);
  rpc PublishPromotion (PublishPromotionRequest) returns (PublishPromotionResponse);
}

message BusinessProfileRequest {
  string business_id = 1;
  string viewer_user_id = 2;  // optional for analytics logging
}

message BusinessProfileResponse {
  string id = 1;
  string name = 2;
  string tagline = 3;
  string description = 4;
  string category_id = 5;
  string category_name = 6;
  string verification_status = 7;
  string phone = 8;
  string whatsapp = 9;
  string address = 10;
  string city = 11;
  string province = 12;
  double latitude = 13;
  double longitude = 14;
  repeated ProductItem products = 15;
  repeated ServiceItem services = 16;
  repeated PromotionItem active_promotions = 17;
  OpeningHoursWeekly hours = 18;
}

message ProductItem {
  string id = 1;
  string name = 2;
  double price_amount = 3;
  string currency = 4;        // "ZMW"
  string price_type = 5;      // "fixed", "starting_from"
  bool in_stock = 6;
  string category_label = 7;
}

message ServiceItem {
  string id = 1;
  string name = 2;
  double starting_price = 3;
  string currency = 4;
  string duration = 5;
}

message PromotionItem {
  string id = 1;
  string title = 2;
  string tagline = 3;
  int32 discount_percentage = 4;
  string valid_from = 5;
  string valid_until = 6;
}

message OpeningHoursWeekly {
  repeated DayHours days = 1;
}

message DayHours {
  string day = 1;
  string open_time = 2;
  string close_time = 3;
  bool is_closed = 4;
}

message BatchSummariesRequest {
  repeated string business_ids = 1;
}

message BatchSummariesResponse {
  repeated DiscoveredBusinessItem items = 1;
}

message ClaimBusinessRequest {
  string business_id = 1;
  string claimant_user_id = 2;
  string pacra_no = 3;
  string zra_tpin = 4;
  repeated string document_urls = 5;
}

message ClaimBusinessResponse {
  string verification_id = 1;
  string status = 2;          // "pending_review"
  string message = 3;
}

message ManageProductsRequest {
  string business_id = 1;
  string actor_user_id = 2;
  ProductItem product = 3;
}

message ManageProductsResponse {
  bool success = 1;
  string product_id = 2;
}

message PublishPromotionRequest {
  string business_id = 1;
  string actor_user_id = 2;
  PromotionItem promotion = 3;
}

message PublishPromotionResponse {
  bool success = 1;
  string promotion_id = 2;
}`;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                DISTRIBUTED MICROSERVICES SPECIFICATION
              </span>
              <span className="text-xs text-stone-400">·</span>
              <span className="text-xs text-stone-500">API Gateway, Discovery, Identity, Business</span>
            </div>
            <h3 className="text-lg font-bold font-display text-stone-900 mt-1">
              Service Boundaries, Communication Protocols & Data Routing
            </h3>
            <p className="text-xs text-stone-500 mt-0.5 max-w-3xl">
              Clean separation of concerns: The API Gateway terminates client TLS/HTTP/2 traffic, inspects JWT signatures, rate limits by IP/device, and orchestrates downstream gRPC binary calls to stateless domain services backed by PostgreSQL + PostGIS and Redis 7.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => copyCode(protoDefinition, 'proto')}
              className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              {copiedSnippet === 'proto' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSnippet === 'proto' ? 'Protobuf Copied!' : 'Copy Protobuf IDL'}</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Buttons */}
        <div className="flex items-center gap-1.5 border-b border-stone-200 pb-3 pt-2 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => setActiveSubTab('gateway')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'gateway'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>1. API Gateway</span>
          </button>

          <button
            onClick={() => setActiveSubTab('discovery')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'discovery'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-amber-500" />
            <span>2. Discovery Service</span>
          </button>

          <button
            onClick={() => setActiveSubTab('identity')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'identity'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-blue-500" />
            <span>3. Identity Service</span>
          </button>

          <button
            onClick={() => setActiveSubTab('business')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'business'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-purple-500" />
            <span>4. Business Service</span>
          </button>

          <button
            onClick={() => setActiveSubTab('protocols')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'protocols'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-cyan-600" />
            <span>Protobuf IDL & RPC Schema</span>
          </button>

          <button
            onClick={() => setActiveSubTab('flow')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'flow'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-rose-500" />
            <span>End-to-End Request Flow</span>
          </button>
        </div>
      </div>

      {/* 1. API GATEWAY SPEC */}
      {activeSubTab === 'gateway' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
              <h4 className="text-base font-bold font-display text-stone-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-600" />
                <span>Bwana API Gateway Architecture</span>
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                The API Gateway is the single public ingress point for Web, Android, and iOS clients. Built with a high-concurrency asynchronous runtime (Envoy or Node.js/Go proxy), it enforces security, low-bandwidth optimizations, and request orchestration before communicating with internal domain services.
              </p>

              {/* Responsibilities List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                  <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-600" />
                    <span>JWT & Auth Offloading</span>
                  </div>
                  <p className="text-stone-500 text-[11px]">
                    Validates Ed25519/RS256 JWT signatures at the edge. Injects sanitized <code className="text-stone-800">x-bwana-user-id</code> and <code className="text-stone-800">x-bwana-role</code> downstream.
                  </p>
                </div>

                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                  <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Token Bucket Rate Limiting</span>
                  </div>
                  <p className="text-stone-500 text-[11px]">
                    Prevents scraping and SMS OTP exhaustion. 60 req/min for public IP, 300 req/min for authenticated users via Redis sliding-window.
                  </p>
                </div>

                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                  <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Protocol Translation</span>
                  </div>
                  <p className="text-stone-500 text-[11px]">
                    Ingests REST/JSON & HTTP/2 from mobile devices; translates to compact internal gRPC/Protobuf RPCs for low inter-pod latency (&lt;2ms).
                  </p>
                </div>

                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                  <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Payload Compression & CDN</span>
                  </div>
                  <p className="text-stone-500 text-[11px]">
                    Enforces Brotli/Gzip compression for 3G/4G networks in Zambia. Edge caching for static categories and popular metro area lookups.
                  </p>
                </div>
              </div>
            </div>

            {/* Gateway Pipeline Flow Diagram */}
            <div className="p-6 bg-stone-950 text-stone-200 rounded-2xl border border-stone-800 font-mono text-xs space-y-3">
              <div className="text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
                // API Gateway Ingress Request Pipeline
              </div>
              <div className="text-stone-300 leading-relaxed text-[11px]">
                Incoming HTTPS Client Request (Mobile / Web)
                <br />&nbsp;&nbsp;│
                <br />&nbsp;&nbsp;├──► 1. TLS 1.3 Termination & WAF (SQLi / XSS screening)
                <br />&nbsp;&nbsp;├──► 2. Redis Rate Limiter (Check client IP / Device ID)
                <br />&nbsp;&nbsp;├──► 3. JWT Authentication (Decrypt token, verify expiry & revocation in Redis)
                <br />&nbsp;&nbsp;├──► 4. Location Context Injection (Derive GeoPoint from IP if client lat/lng missing)
                <br />&nbsp;&nbsp;├──► 5. Request Router & gRPC Multiplexer:
                <br />&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── /api/v1/discovery/*   ──► [Discovery Service:50051]
                <br />&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── /api/v1/auth/*        ──► [Identity Service:50052]
                <br />&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── /api/v1/businesses/*  ──► [Business Service:50053]
                <br />&nbsp;&nbsp;└──► 6. Response Formatter (JSON serialization, gzip, ETags)
              </div>
            </div>
          </div>

          {/* Right Column: Routing Table */}
          <div className="space-y-4">
            <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-3 text-xs">
              <h5 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                Gateway Route Mapping
              </h5>
              <div className="space-y-2">
                <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                  <div className="font-mono font-semibold text-stone-900">/api/v1/discovery/**</div>
                  <div className="text-stone-500 text-[11px] mt-0.5">Target: discovery-svc:50051</div>
                  <div className="text-emerald-700 text-[10px] font-mono mt-0.5">Public · Cached in Redis</div>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                  <div className="font-mono font-semibold text-stone-900">/api/v1/auth/**</div>
                  <div className="text-stone-500 text-[11px] mt-0.5">Target: identity-svc:50052</div>
                  <div className="text-amber-700 text-[10px] font-mono mt-0.5">Strict Rate Limit (SMS abuse guard)</div>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                  <div className="font-mono font-semibold text-stone-900">/api/v1/businesses/**</div>
                  <div className="text-stone-500 text-[11px] mt-0.5">Target: business-svc:50053</div>
                  <div className="text-blue-700 text-[10px] font-mono mt-0.5">Role: Owner, Staff or Public Read</div>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                  <div className="font-mono font-semibold text-stone-900">/api/v1/admin/**</div>
                  <div className="text-stone-500 text-[11px] mt-0.5">Target: business-svc & identity-svc</div>
                  <div className="text-rose-700 text-[10px] font-mono mt-0.5">Role: Admin / Staff Only</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1.5">
              <span className="font-bold text-emerald-950 uppercase tracking-wider text-[10px]">
                Low Latency Target
              </span>
              <p className="text-emerald-800 text-[11px] leading-relaxed">
                P95 latency through Gateway to internal gRPC microservices: <strong>&lt; 35ms</strong> over Zambian fiber backbones (Zamtel, Liquid, Airtel).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. DISCOVERY SERVICE SPEC */}
      {activeSubTab === 'discovery' && (
        <div className="space-y-6">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold font-display text-stone-900 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>Discovery Service (Spatial Search & Intent Engine)</span>
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Core mission: Answering "What is available around me, where is it, and how far?"
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                Port :50051 (gRPC)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
                <h5 className="font-bold text-stone-900">1. Spatial Execution Engine</h5>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  Leverages PostGIS spatial indexes (<code className="text-stone-800">GIST</code>) on <code className="text-stone-800">businesses.geom</code>. Executes spherical <code className="text-stone-800">ST_DWithin</code> and <code className="text-stone-800">ST_Distance</code> queries using WGS84 spheroids to avoid flat-earth distortion across Zambia.
                </p>
                <div className="text-[10px] font-mono text-emerald-700">Sub-millisecond query execution</div>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
                <h5 className="font-bold text-stone-900">2. Natural Language Parser (NLP)</h5>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  Tokenizes search terms (e.g. "Hardware in Kitwe", "Plumbers near me"). Distinguishes categorical intent (e.g. "food" &rarr; Food & Dining) from specific brand names (e.g. "Shoprite") and local trades.
                </p>
                <div className="text-[10px] font-mono text-emerald-700">Multi-intent fallback classifier</div>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
                <h5 className="font-bold text-stone-900">3. Hybrid Ranking Algorithm</h5>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  Sorts output using multi-factor scoring:
                  <br />• Distance weight (60%)
                  <br />• Verified Status badge (15%)
                  <br />• Average review rating (15%)
                  <br />• Currently open now bonus (10%)
                </p>
                <div className="text-[10px] font-mono text-emerald-700">Configurable relevance weights</div>
              </div>
            </div>

            {/* Downstream Data Dependency Callout */}
            <div className="p-4 bg-stone-100 rounded-xl border border-stone-200 text-xs flex items-center justify-between">
              <div>
                <span className="font-semibold text-stone-900">Data Access Pattern:</span>
                <span className="text-stone-600 ml-2">
                  Reads from PostgreSQL PostGIS read-replica; reads Geo-Hashes from Redis for 0-hop cache hits on hot city clusters (Kitwe, Lusaka).
                </span>
              </div>
              <span className="text-[11px] font-mono text-stone-500">Read-Heavy (92% Reads)</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. IDENTITY SERVICE SPEC */}
      {activeSubTab === 'identity' && (
        <div className="space-y-6">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold font-display text-stone-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>Identity Service (Auth, RBAC & Session Security)</span>
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Multi-method authentication supporting Zambian +260 SMS OTP, Google OAuth, and 5 platform roles.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
                Port :50052 (gRPC)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
                <h5 className="font-bold text-stone-900">Zambian Mobile OTP Pipeline</h5>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  Integrates with local telco SMS gateways (Airtel Zambia, MTN Zambia, Zamtel). Generates secure cryptographically random 6-digit tokens stored in Redis with 5-minute TTL. Protects against brute-force attacks by locking phone numbers after 3 incorrect attempts.
                </p>
                <div className="p-2.5 bg-white rounded border border-stone-200 text-[11px] font-mono">
                  TTL: 300s · Max Retries: 3 · Cooldown: 60s
                </div>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
                <h5 className="font-bold text-stone-900">5-Tier Role-Based Access Control (RBAC)</h5>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  Issues signed JWT access tokens containing explicit user role and verified tenant IDs:
                  <br />• <strong>customer:</strong> Search, rate, review, save, chat
                  <br />• <strong>business_owner:</strong> Manage own catalog, products, prices, promotions
                  <br />• <strong>professional:</strong> Manage skills, portfolio, rates, availability
                  <br />• <strong>bwana_staff:</strong> Review verification claims & moderate reviews
                  <br />• <strong>admin:</strong> Full platform configuration & security audit logs
                </p>
              </div>
            </div>

            {/* Token Security Specification */}
            <div className="p-4 bg-stone-950 text-stone-200 rounded-xl border border-stone-800 font-mono text-xs space-y-2">
              <div className="text-emerald-400 font-bold text-[11px]">Token Lifecycle & Secret Rotation:</div>
              <div className="text-stone-300 text-[11px] leading-relaxed">
                • Access Token: JWT (RS256 signed, 15 minutes lifetime, claims include user_id, role, active_business_id)
                <br />• Refresh Token: 256-bit cryptographically secure token stored in Redis with 30-day sliding expiry
                <br />• Password Hashing: bcrypt (cost factor 12) + per-user salt
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. BUSINESS SERVICE SPEC */}
      {activeSubTab === 'business' && (
        <div className="space-y-6">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold font-display text-stone-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <span>Business Service (Catalog, Pricing, Promotions & PACRA)</span>
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Manages core company profiles, Kwacha (ZMW) catalogs, promotion engine, and official verification workflows.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded">
                Port :50053 (gRPC)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
                <h5 className="font-bold text-stone-900">1. Catalog & Pricing Engine</h5>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  Supports granular Zambian Kwacha (ZMW) models: Fixed prices (Cement K145), Starting from (Solar K2,500), Range, and Contact for price. Emits invalidation signals to Redis cache on stock or price updates.
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
                <h5 className="font-bold text-stone-900">2. PACRA & ZRA TPIN Queue</h5>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  Handles business claims, statutory documentation upload, and review state machine (pending &rarr; approved &rarr; verified). Writes immutable audit logs on every officer decision.
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
                <h5 className="font-bold text-stone-900">3. Lead Analytics Collector</h5>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  Asynchronously aggregates profile views, phone dials, WhatsApp clicks, and map directions. Powers the business owner metrics panel without slowing down read queries.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. PROTOBUF IDL SCHEMA */}
      {activeSubTab === 'protocols' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold font-display text-stone-900">
                Protobuf Service Definition Contracts (bwana.v1)
              </h4>
              <p className="text-xs text-stone-500">
                Strict type contracts used by internal gRPC microservices and code generators (TypeScript / Go / Kotlin).
              </p>
            </div>
            <button
              onClick={() => copyCode(protoDefinition, 'proto2')}
              className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedSnippet === 'proto2' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSnippet === 'proto2' ? 'Copied' : 'Copy Protobuf'}</span>
            </button>
          </div>

          <div className="bg-stone-950 rounded-2xl p-5 border border-stone-800 overflow-x-auto max-h-[600px]">
            <pre className="text-xs font-mono text-stone-200 leading-relaxed">
              <code>{protoDefinition}</code>
            </pre>
          </div>
        </div>
      )}

      {/* 6. END-TO-END REQUEST FLOW */}
      {activeSubTab === 'flow' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-6">
          <div>
            <h4 className="text-base font-bold font-display text-stone-900">
              End-to-End Execution Sequence: "Hardware stores in Kitwe"
            </h4>
            <p className="text-xs text-stone-500 mt-0.5">
              Tracing a live query from mobile client through Gateway to Discovery and Business services.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-mono flex items-center justify-center text-xs shrink-0 font-bold">
                1
              </span>
              <div>
                <strong className="text-stone-900">Client Ingress:</strong> Mobile client sends HTTP/2 request:
                <div className="font-mono text-[11px] text-stone-700 bg-white p-2 rounded border border-stone-200 mt-1">
                  GET /api/v1/discovery/nearby?query=Hardware+stores+in+Kitwe&lat=-12.8024&lon=28.2132&radius=10
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-mono flex items-center justify-center text-xs shrink-0 font-bold">
                2
              </span>
              <div>
                <strong className="text-stone-900">Gateway Validation & Routing:</strong>
                <p className="text-stone-600 text-[11px] mt-0.5">
                  Gateway verifies rate limits in Redis, confirms client IP is not blacklisted, converts query into a <code className="text-stone-800">NearbySearchRequest</code> Protobuf message, and invokes gRPC call to <code className="text-stone-800">DiscoveryService.SearchNearby</code>.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-mono flex items-center justify-center text-xs shrink-0 font-bold">
                3
              </span>
              <div>
                <strong className="text-stone-900">Discovery NLP & PostGIS Query:</strong>
                <p className="text-stone-600 text-[11px] mt-0.5">
                  Discovery Service identifies intent ("Home & Construction" category, Kitwe coordinate center) and executes spatial query on PostgreSQL read-replica:
                </p>
                <div className="font-mono text-[10px] text-emerald-800 bg-emerald-50/60 p-2 rounded border border-emerald-200 mt-1">
                  WHERE ST_DWithin(geom, ST_SetSRID(ST_MakePoint(28.2132, -12.8024), 4326)::geography, 10000)
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-mono flex items-center justify-center text-xs shrink-0 font-bold">
                4
              </span>
              <div>
                <strong className="text-stone-900">Business Service Enrichment:</strong>
                <p className="text-stone-600 text-[11px] mt-0.5">
                  Discovered business IDs (<code className="text-stone-800">biz-abc-hardware</code>) are checked against Redis hot cache. Active promotions and opening hours status are attached.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono flex items-center justify-center text-xs shrink-0 font-bold">
                5
              </span>
              <div>
                <strong className="text-stone-900">Gateway Response Delivery:</strong>
                <p className="text-stone-600 text-[11px] mt-0.5">
                  Payload is serialized to JSON, compressed with Brotli (reducing response size by 78%), and returned to the mobile app in <strong>28ms</strong> total round-trip time.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
