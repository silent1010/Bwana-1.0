# BWANA — Security Specification & Hardening Guide

## 1. Role-Based Access Control (RBAC) Matrix

| Resource / Action | Customer (`user`) | Business Owner (`business`) | Administrator (`admin`) |
| :--- | :---: | :---: | :---: |
| **Search & Discovery** | Read | Read | Read |
| **View Profiles & Catalog** | Read | Read | Read |
| **Create Review** | Write (Own UID) | Blocked (Self-Review) | Write |
| **Vote Review Helpful** | Write | Write | Write |
| **Edit Own Business Profile** | Blocked | Write (Owned Biz) | Write |
| **Manage Catalog & Products** | Blocked | Write (Owned Biz) | Write |
| **Respond to Customer Reviews** | Blocked | Write (Owned Biz) | Write |
| **Submit Verification Claim** | Write | Write | Write |
| **Approve/Reject Verification** | Blocked | Blocked | **Write** |
| **View Compliance Audit Logs** | Blocked | Blocked | **Read** |
| **Inspect System Logs** | Blocked | Blocked | **Read** |

---

## 2. Threat Modeling & Mitigation (The Dirty Dozen)

1. **Rating Tampering:** Security rules reject reviews with `rating < 1` or `rating > 5`.
2. **Review Hijacking:** Review ownership validation ensures updates can only be performed by the author or for merchant responses.
3. **Spoofed Audit Entries:** `/auditLogs` path is strictly append-only; updates and deletions are rejected by rule.
4. **Forged Verification Approvals:** Only accounts matching administrative criteria (`m.mumba8@gmail.com` or `/admins/{uid}`) can set verification status to `approved`.
5. **Path Traversal & Massive String Floods:** Identifier strings and business names have length limits (`size() <= 200`).
6. **SQL / Injection Defense:** Parameterized queries and strict Firestore type boundaries prevent injection attacks.
7. **Cross-Site Scripting (XSS):** React JSX default sanitization combined with strict schema validation prevents script injection in reviews or product descriptions.
8. **Statutory Document Privacy:** PACRA certificates and ZRA tax clearance documentation are restricted to the claimant and verified administrative officers.
