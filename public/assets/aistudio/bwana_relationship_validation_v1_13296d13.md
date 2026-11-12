# Bwana database relationship validation — V1.0

**Scope reviewed:** `bwana_postgresql_schema_v1.sql`  
**Target:** PostgreSQL 16+ and PostGIS 3.x  
**Review type:** Static schema and relational-integrity review. No PostgreSQL server/client or PostGIS runtime was available in the execution environment, so the SQL has **not** been installed or executed. Treat this as a design validation, not a successful database migration test.

## 1. ERD deliverables

- `bwana_erd_v1.mmd` — editable Mermaid ER diagram source.
- `bwana_erd_v1.svg` — rendered diagram for viewing.
- `bwana_postgresql_schema_v1.sql` — source schema reviewed.

## 2. Relationship inventory

| Relationship | Cardinality | Implementation | Review |
|---|---|---|---|
| Country → administrative areas | 1:N | `administrative_areas.country_id` | Valid FK |
| Administrative area → child areas | 1:N self-reference | `parent_id` | FK valid; cycle prevention missing |
| Country → locations | 1:N | `locations.country_id` | Valid FK |
| Administrative area → locations | 1:N optional | `locations.administrative_area_id` | Valid FK; country consistency not enforced |
| User → auth identities | 1:N | `auth_identities.user_id` | Valid FK; `UNIQUE(user_id, provider)` limits each user to one identity per provider |
| User ↔ roles | M:N | `user_roles` | Valid composite PK/FKs |
| Role ↔ permissions | M:N | `role_permissions` | Valid composite PK/FKs |
| User → media assets | 1:N optional owner | `media_assets.owner_user_id` | Valid FK |
| User → businesses | 1:N optional creator | `businesses.created_by` | Valid FK; creator is not automatically an owner/member |
| User ↔ businesses | M:N | `business_members` | Valid composite PK/FKs; owner invariants need enforcement |
| Business → branches | 1:N | `business_locations.business_id` | Valid FK |
| Location → business branches | 1:N | `business_locations.location_id` | Valid FK |
| Category → child categories | 1:N self-reference | `categories.parent_id` | FK valid; cycle prevention missing |
| Business ↔ categories | M:N | `business_categories` | Valid composite PK/FKs; one primary category enforced |
| Business → contact channels | 1:N | `business_contact_channels.business_id` | Valid FK; branch/business consistency missing |
| Business → catalog items | 1:N | `catalog_items.business_id` | Valid FK |
| Branch → catalog items | 1:N optional | `catalog_items.business_location_id` | FK valid; branch must belong to same business, not enforced |
| Catalog items ↔ media | M:N | `catalog_item_media` | Valid composite PK/FKs |
| Business → reviews | 1:N | `reviews.business_id` | Valid FK |
| User → reviews | 1:N | `reviews.author_user_id` | Valid FK; one review per user/business enforced |
| Branch → reviews | 1:N optional | `reviews.business_location_id` | FK valid; branch/business consistency missing |
| Review ↔ media | M:N | `review_media` | Valid composite PK/FKs |
| Review → response | 1:0..1 | unique `review_responses.review_id` | Cardinality valid; response business must match review business, not enforced |
| Business → promotions | 1:N | `promotions.business_id` | Valid FK |
| Branch → promotions | 1:N optional | `promotions.business_location_id` | FK valid; branch/business consistency missing |
| User ↔ saved businesses | M:N | `saved_businesses` | Valid composite PK/FKs |
| User ↔ followed businesses | M:N | `business_follows` | Valid composite PK/FKs |
| Business → verification requests | 1:N | `business_verification_requests.business_id` | Valid FK |
| User → verification submissions/reviews | 1:N | submitted/reviewer FKs | Valid FKs; submitter authorization not enforced |
| Verification request → documents | 1:N | `verification_documents.request_id` | Valid FK |
| Content report → reported target | Polymorphic | `target_type`, `target_id` | **Not referentially enforced** by a normal FK |
| User → audit events | 1:N optional actor | `audit_logs.actor_user_id` | Valid FK; append-only behavior is application policy only |

## 3. Issues to resolve before backend implementation

### Critical relational-integrity gaps

1. **Branch/business mismatch:** a catalog item, review, promotion, or contact channel can reference a branch belonging to a different business. Add composite unique keys and composite foreign keys, or enforce with database triggers.
2. **Review response mismatch:** `review_responses.business_id` can differ from the business on its referenced review. Prefer deriving the business from `review_id` and removing the redundant column, or add a composite FK.
3. **Country/administrative-area mismatch:** a location can reference an administrative area belonging to a different country. Enforce `(administrative_area_id, country_id)` against a unique key on `administrative_areas`.
4. **Administrative hierarchy cycles:** the self-parent check only prevents a row being its own immediate parent; it does not prevent longer cycles. Add a recursive validation trigger or manage hierarchy updates through a transaction-safe service function.
5. **Category hierarchy cycles:** same issue as administrative areas.
6. **Business owner invariant:** the schema permits a business with no active owner, or multiple owners. Define whether multiple owners are allowed; enforce at least one active owner with a controlled ownership-transfer workflow (a simple CHECK cannot enforce a cross-row rule).

### Important design choices to confirm

7. **Creator vs owner:** `businesses.created_by` does not create a `business_members` row. On business creation, create an active `owner` membership in the same transaction.
8. **Review lifecycle:** `UNIQUE(author_user_id, business_id)` means a user can only ever have one review per business, even after soft deletion. Confirm whether reviews may be edited/replaced or whether a user may review again after a defined period.
9. **Identity uniqueness:** `UNIQUE(user_id, provider)` permits only one linked identity for each provider. Remove it if users may link multiple accounts from the same identity provider.
10. **Content reports:** `target_id` has no FK because it is polymorphic. Add typed target tables or a trigger that validates target existence and handles deletion.
11. **Opening hours JSONB:** add a strict API schema and server-side validation for weekday/timezone/overnight/closed/holiday rules. JSONB itself does not enforce the intended structure.
12. **Catalog currency:** `currency_code` is stored per catalog item; validate against `countries`/supported currency reference data. Prices are integer minor units; document that ZMW uses ngwee and define rounding/display rules.
13. **Promotion discount:** `discount_type <> 'percent' OR discount_value <= 100` evaluates to NULL when `discount_type` is NULL, which CHECK accepts. This is acceptable only if a null discount type is intentionally allowed. Otherwise make it NOT NULL or require it when a value is supplied.
14. **Location coordinates:** `geography(Point,4326)` ensures geometry type/SRID but the application should validate longitude/latitude input order and reject out-of-range values. Add a geography non-empty check if required by import pathways.
15. **Audit immutability:** application convention alone does not make audit logs append-only. Restrict UPDATE/DELETE privileges for the app role; optionally add a trigger rejecting mutation and partition by time at scale.
16. **Media authorization:** private verification documents must never be served from public object URLs. Enforce authorization at the signed-URL/API layer and validate MIME type, size, malware scan state and ownership.

### Index / query observations

17. `businesses_name_trgm_idx` is correctly supported by `pg_trgm`, and the extension is created before the index in the reviewed file.
18. `locations_point_gix` is the required GiST index for `ST_DWithin`/nearby discovery.
19. Consider a GiST index on `administrative_areas` only if polygons/boundaries are later added; none exists in this schema yet.
20. Add operational indexes after measuring actual query plans: e.g. published catalog items by business, active promotions by date window, and business-location lookup by status. Avoid indexing every column pre-emptively.
21. For review rating display, introduce a maintained aggregate table or materialized view only after defining transaction-safe updates and cache invalidation. Do not rely on repeated full review scans at scale.

## 4. Schema omissions relative to the wider Bwana product vision

The current SQL is the core discovery/business schema, not the complete product database. It does not yet model:

- Professional profiles and skills.
- Events and event organizers/venues.
- Jobs, tenders, scholarships and other opportunities.
- Notification preferences, delivery attempts and device push tokens.
- Search analytics and business lead/call/directions events.
- Advertising campaigns, sponsored placement billing and subscription plans.
- Payments, invoices, receipts and payment-provider references.
- User saved searches and search alerts.
- Business claims and ownership disputes as a distinct workflow.
- Business hours exceptions and public holidays.

These should be separate domain modules/migrations, not overloaded into `businesses` or `catalog_items`.

## 5. Validation checklist for the real PostgreSQL environment

Run these in a disposable PostgreSQL 16 + PostGIS environment before approving the migration:

1. Apply the schema from an empty database using the actual migration runner.
2. Confirm installed versions: `SELECT version(); SELECT PostGIS_Full_Version();`.
3. Inspect constraints and indexes through `pg_constraint`, `pg_indexes`, and `information_schema`.
4. Insert a minimal valid country → area → location → user → business → branch → category → catalog item/review/promotion fixture.
5. Verify invalid FK references and CHECK violations fail.
6. Verify `ST_DWithin` uses the GiST index with `EXPLAIN (ANALYZE, BUFFERS)` on representative data.
7. Test concurrent ownership changes, review creation, promotion scheduling and soft deletion in transactions.
8. Test backup restore and migration rollback/forward strategy.
9. Run application-level authorization tests for every business membership role and platform role.

## 6. Approval status

**ERD relationship mapping:** complete for the tables currently present in V1.0.  
**Static relationship review:** complete; issues above remain.  
**Runtime SQL validation:** not performed; database runtime was unavailable.  
**Production readiness:** not approved until critical integrity gaps are addressed and migrations/tests pass on PostgreSQL + PostGIS.
