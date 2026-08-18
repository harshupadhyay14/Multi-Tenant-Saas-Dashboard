# 🚀 Multi-Tenant SaaS Dashboard

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-Fargate%20%7C%20CloudFront%20%7C%20S3-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

A **production-grade, full-stack multi-tenant SaaS dashboard** built with React, Node.js, Express, and MongoDB — deployed on real AWS infrastructure (ECS Fargate, CloudFront, S3, SQS/SNS). Features JWT authentication, role-based access control (RBAC), real-time analytics, organization-based user management, and direct-to-S3 file uploads — mirroring the architecture of real-world SaaS platforms like Notion and Slack.

🌐 **Live Frontend:** [https://d3sot9e00pp6q1.cloudfront.net](https://d3sot9e00pp6q1.cloudfront.net)
🔗 **Live API:** [https://dscmlp496tr1b.cloudfront.net/api](https://dscmlp496tr1b.cloudfront.net/api)

<img width="1919" height="826" alt="Screenshot 2026-08-18 005849" src="https://github.com/user-attachments/assets/940820dd-ed67-447b-8076-51e57f3af0b1" />
<img width="1919" height="824" alt="Screenshot 2026-08-18 005913" src="https://github.com/user-attachments/assets/07c73d21-3c98-4043-b2e3-7cdaefad36a1" />
<img width="1919" height="827" alt="Screenshot 2026-08-18 005941" src="https://github.com/user-attachments/assets/f33fccbd-0c98-405f-9ab0-88078e1cc1e0" />
<img width="1919" height="827" alt="Screenshot 2026-08-18 010000" src="https://github.com/user-attachments/assets/7aa2e794-e852-4e14-9f52-7f11d52ee143" />
<img width="1919" height="829" alt="Screenshot 2026-08-18 010025" src="https://github.com/user-attachments/assets/0f8affd8-1452-4157-b92d-67a4d0562633" />

## ✨ Features

- 🔐 **JWT Authentication** — Secure login/register with token-based sessions
- 🏢 **Multi-Tenant Architecture** — Organisation-scoped data isolation per tenant
- 👥 **Role-Based Access Control** — `super_admin`, `org_admin`, `member`, `viewer` roles
- 📊 **Live Analytics Dashboard** — Sessions, revenue, active users, and signups — charted with Recharts
- 👤 **User Management** — Invite users by email, assign roles, track status
- 🖼️ **Organization Logo Upload** — Direct browser-to-S3 upload via presigned URLs, no file ever touches the backend
- 📧 **Async Email Notifications** — SQS-backed worker triggers SNS emails on key events, decoupled from the request/response cycle
- 📈 **KPI Cards** — Real-time metrics pulled from MongoDB
- 🌐 **RESTful API** — Clean Express backend with protected routes and middleware
- 🗄️ **MongoDB Atlas** — Cloud database with indexed collections

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT (JSON Web Tokens), bcrypt |
| File Storage | AWS S3 (presigned PUT uploads) |
| Async Processing | AWS SQS (queue) → worker → AWS SNS (email) |
| Compute | AWS ECS Fargate behind an Application Load Balancer |
| CDN / Edge | AWS CloudFront (serves frontend + proxies API) |
| Secrets | AWS Secrets Manager |
| Logging | AWS CloudWatch Logs |
| IAM | Scoped task roles (least-privilege per service) |
| Styling | Inline CSS (dark futuristic theme) |
| Icons | Lucide React |
| Dev Tools | Nodemon, ESLint |

---

## ☁️ AWS Architecture

```
                        ┌─────────────────────┐
                        │   AWS CloudFront     │
                        │  (CDN + API proxy)   │
                        └──────────┬───────────┘
                                   │
                 ┌─────────────────┴─────────────────┐
                 │                                    │
        ┌────────▼────────┐                ┌──────────▼──────────┐
        │  S3 (frontend)   │                │   ALB → ECS Fargate │
        │  static React    │                │   (Express backend) │
        │  build           │                └──────────┬──────────┘
        └──────────────────┘                            │
                                     ┌────────────────────┼───────────────────┐
                                     │                    │                   │
                            ┌────────▼───────┐   ┌────────▼────────┐ ┌────────▼────────┐
                            │  MongoDB Atlas  │   │  S3 (org logos)  │ │   AWS SQS queue  │
                            │                 │   │  presigned PUT   │ │  → worker → SNS  │
                            └─────────────────┘   └──────────────────┘ └──────────────────┘

        Secrets Manager → injects DB URI / JWT secret into the Fargate task
        CloudWatch Logs → captures backend + worker logs
        IAM task roles  → scoped per-service (S3 PutObject, SQS, SNS, Secrets read)
```

**Request flow highlights:**
- The React build is served as a static site from S3, fronted by CloudFront.
- A second CloudFront distribution sits in front of the ALB purely to terminate HTTPS for the API — this avoids needing a custom domain + ACM certificate just for a demo deployment.
- Organization logo uploads never pass through the backend: the client requests a **presigned S3 URL** from the API, then uploads the file **directly to S3** via a `PUT` request. This keeps the backend stateless and avoids proxying large file payloads.
- Certain backend events publish to an **SQS queue** (with a dead-letter queue for messages that fail 3 times); a worker process consumes the queue and triggers **SNS** to send email notifications — decoupling slow/unreliable email delivery from the main request path.
- All secrets (Mongo URI, JWT secret, bucket name, queue URL, topic ARN) are pulled from **Secrets Manager** at task startup rather than hardcoded or committed.
- IAM roles are scoped per service — the Fargate task role only has the specific S3/SQS/SNS/CloudWatch permissions it needs; a separate execution role handles image pulls and secrets fetching.

---

## 📸 Screenshots

> Dashboard with real-time sessions chart, KPI cards, and multi-page navigation

| Page | Description |
|------|-------------|
| **Login** | JWT-secured login with validation |
| **Dashboard** | KPI cards + live sessions chart |
| **Analytics** | Revenue, Active Users, Sessions — 3 Recharts graphs |
| **Users** | Member table with role badges, invite modal |
| **Settings** | Org settings panel + logo upload (direct-to-S3) |

---

## 🔴 Live Demo

| | URL |
|-|-----|
| **Frontend** | https://d3sot9e00pp6q1.cloudfront.net |
| **Backend API** | https://dscmlp496tr1b.cloudfront.net/api |

**Demo credentials:**
```
Email:    testuser@example.com
Password: TestPass123!
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (free tier works)
- AWS account (for S3 presigned uploads and SQS/SNS features — optional if you just want core auth/dashboard/analytics working locally)
- npm

### 1. Clone the repo

```bash
git clone https://github.com/harshupadhyay14/Multi-Tenant-Saas-Dashboard.git
cd Multi-Tenant-Saas-Dashboard
```

### 2. Set up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder (see `.env.example` for the full list):

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/saas_dashboard
JWT_SECRET=your_jwt_secret_here
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# AWS (only needed for logo upload + email worker features)
AWS_REGION=ap-south-1
S3_BUCKET_NAME=your-bucket-name
SQS_INVITE_QUEUE_URL=your_queue_url
SNS_INVITE_TOPIC_ARN=your_topic_arn
```

Start the backend:

```bash
npm run dev
```

You should see:
```
🚀 Server running on port 5000 [development]
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
```

### 3. Set up the Frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` folder:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm start
```

Go to → **http://localhost:3000**

---

## 🔑 Creating Your First User

Register via the UI at `/login`, or via Postman/any API client:

```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@acme.com",
  "password": "password",
  "orgName": "Acme Corp"
}
```

Then log in at `localhost:3000` with those credentials.

To upgrade to `super_admin`, go to **MongoDB Atlas → Collections → users** → find your document → change `systemRole: "user"` to `systemRole: "super_admin"` → Save. This unlocks the Organizations page and Invite User button.

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user + create org |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user + org |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/org/:orgId` | List org members |
| POST | `/api/users/invite` | Invite user to org (queues SQS job) |
| PATCH | `/api/users/:userId/role` | Change a user's role |
| DELETE | `/api/users/:userId/org/:orgId` | Remove user from org |

### Organizations / Uploads
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/organizations/mine` | Orgs the current user belongs to |
| POST | `/api/organizations/:orgId/logo-upload-url` | Request a presigned S3 URL for logo upload |
| PATCH | `/api/organizations/:orgId/logo` | Save the uploaded logo's S3 URL to the org record |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analytics/track` | Track metrics for current period |
| GET | `/api/analytics/org/:orgId` | Get analytics history |

---

## 🗂️ Project Structure

```
Multi-Tenant-Saas-Dashboard/
├── backend/
│   ├── config/
│   │   ├── aws.js              # shared AWS SDK client setup
│   │   ├── db.js                # MongoDB connection
│   │   ├── s3.js                 # S3 client + presign helpers
│   │   ├── sns.js                # SNS client
│   │   └── sqs.js                # SQS client
│   ├── middleware/
│   │   └── auth.js              # JWT middleware
│   ├── models/
│   │   ├── Analytics.js
│   │   ├── Organization.js
│   │   └── User.js
│   ├── routes/
│   │   ├── analytics.js
│   │   ├── auth.js
│   │   ├── organizations.js     # presigned S3 URL + logo save routes
│   │   └── users.js
│   ├── scripts/
│   │   └── seedAnalytics.js     # local dev data seeding
│   ├── .dockerignore
│   ├── .env                     # ← not committed
│   ├── Dockerfile
│   ├── server.js
│   └── worker.js                # SQS consumer → SNS email trigger
│
├── frontend/
│   ├── public/                  # CRA default static assets
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js         # Axios instance with auth header
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── RoleBadge.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # JWT + org context
│   │   ├── pages/
│   │   │   ├── Analytics.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Organizations.jsx
│   │   │   ├── Settings.jsx     # includes logo upload card
│   │   │   └── Users.jsx
│   │   └── App.js
│   └── .env                     # ← not committed
│
└── infra/
    ├── DEPLOY.md
    ├── ecs-task-definition.json
    ├── frontend-bucket-policy.json
    ├── iam-execution-role-secrets-policy.json
    ├── iam-task-role-permissions-policy.json
    └── iam-task-role-trust-policy.json
```

---

## 🧠 Architecture Highlights

- **Multi-tenancy** is implemented via `orgId` scoping — every user belongs to an organisation, and all data queries are filtered by `orgId`
- **RBAC** is enforced both on the backend (middleware checks `systemRole` and membership `role`) and on the frontend (UI elements conditionally rendered by role)
- **JWT tokens** are stored in `localStorage` and attached to every API request via an Axios interceptor
- **Analytics** are aggregated by `period` (YYYY-MM format), enabling month-over-month charting
- **File uploads bypass the backend entirely** — the API only issues a short-lived presigned S3 URL; the actual bytes go straight from the browser to S3, keeping the Fargate task stateless and reducing load
- **Async email delivery** — instead of sending email synchronously inside a request handler, events are pushed to SQS and processed by a separate worker, so a slow email provider can never block or fail an API response. A dead-letter queue catches messages that fail repeatedly.
- **Infrastructure is fully containerized and cloud-native** — no long-running servers to manage by hand; ECS Fargate handles scheduling, CloudWatch handles observability, and Secrets Manager handles credential rotation without code changes

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

MIT © [Harsh Upadhyay](https://github.com/harshupadhyay14)

---

> Built as a full-stack portfolio project demonstrating multi-tenant SaaS architecture on real AWS infrastructure — JWT auth, RBAC, direct-to-S3 uploads, async email via SQS/SNS, and real-time analytics.
