# Security Specification: Bwana Real-Time Verification Platform

## 1. Data Invariants
1. **Public Read Directory**: Businesses and Reviews are publicly readable so Zambian customers can browse, search, and verify enterprises without an account barrier.
2. **Business Ownership & Modification**: Business documents can be created by authenticated users or system bootstrap, and only modified by the registered owner (`claimedByUserId`), an authorized admin, or during verified claim workflows.
3. **Review Integrity**: Reviews must have a valid `rating` between 1 and 5, must include a non-empty `comment`, and cannot modify original `businessId` or `userId`.
4. **Verification Submissions**: Anyone can submit a claim or verification request with valid email, but only platform administrators (`m.mumba8@gmail.com` or admin role) can change `status` to `'approved'` or `'rejected'`.
5. **Audit Trail**: Audit log entries are append-only; existing logs can never be deleted or altered.

## 2. Dirty Dozen Threat Payloads (Blocked by Security Rules)
1. **Payload 1 (Zero-rating review)**: `{ "rating": 0, "comment": "Bad" }` -> Fails rating boundary.
2. **Payload 2 (Rating above 5)**: `{ "rating": 6, "comment": "Good" }` -> Fails rating boundary.
3. **Payload 3 (Spoofed Review ID)**: Injected malicious path variable -> Fails `isValidId`.
4. **Payload 4 (Unauthorized Business Overwrite)**: Non-owner overwriting `claimedByUserId` -> Blocked.
5. **Payload 5 (Audit Log Mutation)**: Attempt to update or delete `/auditLogs/{logId}` -> Blocked.
6. **Payload 6 (Self-Approval of Verification)**: Regular user updating verification status to `approved` -> Blocked.
7. **Payload 7 (Massive String Flood Attack)**: Name containing 50,000 characters -> Fails string size constraint.
8. **Payload 8 (Orphan Review)**: Review without `businessId` -> Fails required key check.
9. **Payload 9 (Forged Owner UID)**: Attempting to claim a business with another user's email/id -> Blocked.
10. **Payload 10 (Null Comment Review)**: Review without comment -> Fails type check.
11. **Payload 11 (Malicious HTML/Script Payload)**: Exceeding property length limits -> Blocked.
12. **Payload 12 (Blanket Collection Write)**: Arbitrary collection write to unknown paths -> Blocked by default-deny catch-all.
