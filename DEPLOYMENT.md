# BWANA — Cloud Deployment & DevOps Guide

## 1. Production Architecture (Scalable Modular Monolith)

```
                    +---------------------------+
                    |    Cloudflare CDN / DNS   |
                    +---------------------------+
                                  |
                                  v
                    +---------------------------+
                    |  Application Load Balancer|
                    +---------------------------+
                                  |
                   +--------------+--------------+
                   |                             |
                   v                             v
     +---------------------------+ +---------------------------+
     |   Bwana Web Instance 1    | |   Bwana Web Instance 2    |
     |   (Cloud Run / Container) | |   (Cloud Run / Container) |
     +---------------------------+ +---------------------------+
                   |                             |
                   +--------------+--------------+
                                  |
            +---------------------+---------------------+
            |                                           |
            v                                           v
+-----------------------+                   +-----------------------+
| Managed Cloud Firestore|                  | Cloud SQL PostgreSQL  |
| * Real-time Document  |                   | * PostGIS Spatial Ext |
| * Multi-Zone Replica  |                   | * Read Replicas       |
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
