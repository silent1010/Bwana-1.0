# BWANA — Cloud Deployment & DevOps Guide

## 1. Production Architecture (AWS High Availability & Load Balancing)

```
                     +---------------------------------------+
                     |    Amazon Route 53 (DNS / Anycast)    |
                     +---------------------------------------+
                                         |
                                         v
                     +---------------------------------------+
                     | Amazon CloudFront (Global Edge CDN)   |
                     | * Edge PoPs: Johannesburg & Cape Town |
                     | * Static Assets, Imagery & DDoS Shield|
                     +---------------------------------------+
                                         | HTTPS (TLS 1.3)
                                         v
                     +---------------------------------------+
                     |    AWS Application Load Balancer      |
                     |    * Dual-Stack (IPv4 / IPv6)         |
                     |    * Multi-AZ Target Group (/api/*)   |
                     |    * Health Checks: /api/health (200) |
                     +---------------------------------------+
                                         |
                        +----------------+----------------+
                        |                                 |
                        v                                 v
         +-----------------------------+   +-----------------------------+
         |  ECS Fargate Task (AZ-a)    |   |  ECS Fargate Task (AZ-b)    |
         |  * Container Port 3000      |   |  * Container Port 3000      |
         |  * Auto-scales 2 to 20 tasks|   |  * Auto-scales 2 to 20 tasks|
         +-----------------------------+   +-----------------------------+
                        |                                 |
                        +----------------+----------------+
                                         |
                   +---------------------+---------------------+
                   |                                           |
                   v                                           v
       +-----------------------+                   +-----------------------+
       | Amazon RDS / Cloud SQL|                   | Amazon ElastiCache    |
       | * PostgreSQL 16+      |                   | * Redis Cluster v7    |
       | * PostGIS Spatial Ext |                   | * Geo-hash Hot Cache  |
       | * Multi-AZ Failover   |                   | * Rate-limiting Token |
       +-----------------------+                   +-----------------------+
```

---

## 2. CI/CD Pipeline Workflow

```
[ Git Push to main ]
         |
         v
1. Lint & Format Check       ---> `npm run lint`
         |
2. Type Safety Verification  ---> `tsc --noEmit`
         |
3. Security Audit & Rules    ---> Validate firestore.rules
         |
4. Build Production Bundle   ---> `npm run build`
         |
5. Containerization          ---> Docker image build & scan
         |
6. Deploy to Google Cloud    ---> Cloud Run continuous deployment
```

---

## 3. Environment Variables Reference (`.env.example`)

```bash
# Application Environment
NODE_ENV=production
PORT=3000
VITE_APP_URL=https://bwana.africa

# Firebase Live Firestore
VITE_FIREBASE_PROJECT_ID=waking-continuity-fvk22
VITE_FIRESTORE_DATABASE_ID=ai-studio-bwana-d9336748-f031-436d-bcac-cb70413ff046

# Regional Settings
VITE_DEFAULT_COUNTRY=ZMB
VITE_DEFAULT_CURRENCY=ZMW
```
