# 🚀 Multi-Tenant SaaS Dashboard

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-Fargate%20%7C%20CloudFront%20%7C%20S3-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

A **production-grade, full-stack multi-tenant SaaS dashboard** built with React, Node.js, Express, and MongoDB — deployed on real AWS infrastructure (ECS Fargate, CloudFront, S3, SQS/SNS). Features JWT authentication, role-based access control (RBAC), real-time analytics, organization-based user management, and direct-to-S3 file uploads — mirroring the architecture of real-world SaaS platforms like Notion and Slack.

🌐 **Live Demo:** [https://d3sot9e00pp6q1.cloudfront.net](https://d3sot9e00pp6q1.cloudfront.net)

<img width="1919" height="826" alt="image" src="https://github.com/user-attachments/assets/32046e09-0f72-4846-8e39-48da2a03a0bd" />
<img width="1919" height="824" alt="image" src="https://github.com/user-attachments/assets/38f32039-fb54-419e-bd9b-3b15ce5fb2cf" />
<img width="1919" height="827" alt="image" src="https://github.com/user-attachments/assets/78ac36f7-3027-4067-87e1-4f3bf9d38d53" />
<img width="1919" height="827" alt="image" src="https://github.com/user-attachments/assets/ee948c2e-6582-4ed3-b55d-0220fd7c8d27" />
<img width="1919" height="829" alt="image" src="https://github.com/user-attachments/assets/636d0bab-7984-4459-aeab-08a8dcf2a30d" />


---

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
- CloudFront also proxies `/api/*` to an Application Load Balancer, which routes to the Express backend running as an ECS Fargate task.
- Organization logo uploads never pass through the backend: the client requests a **presigned S3 URL** from the API, then uploads the file **directly to S3** via a `PUT` request. This keeps the backend stateless and avoids proxying large file payloads.
- Certain backend events publish to an **SQS queue**; a worker process consumes the queue and triggers **SNS** to send email notifications — decoupling slow/unreliable email delivery from the main request path.
- All secrets (Mongo URI, JWT secret) are pulled from **Secrets Manager** at task startup rather than hardcoded or committed.
- IAM roles are scoped per service — the Fargate task role only has the specific S3/SQS/SNS/Secrets Manager permissions it needs.

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
| **App (frontend + API)** | https://d3sot9e00pp6q1.cloudfront.net |

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

Create a `.env` file in the `backend/` folder:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/saas_dashboard
JWT_SECRET=your_jwt_secret_here
PORT=5000
NODE_ENV=development

# AWS (only needed for logo upload + email worker features)
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_LOGO_BUCKET=your-bucket-name
SQS_QUEUE_URL=your_queue_url
SNS_TOPIC_ARN=your_topic_arn
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

Register via Postman or any API client:

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
| POST | `/api/users/invite` | Invite user to org |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analytics/track` | Track metrics for current period |
| GET | `/api/analytics/:orgId` | Get analytics history |

### Org / Uploads
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/org/logo/presign` | Request a presigned S3 URL for logo upload |
| PATCH | `/api/org/logo` | Save the uploaded logo's S3 URL to the org record |

---

## 🗂️ Project Structure

```
Multi-Tenant-Saas-Dashboard/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── middleware/
│   │   └── auth.js             # JWT middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Organization.js
│   │   └── Analytics.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── analytics.js
│   │   └── org.js              # presigned S3 URL + logo save routes
│   ├── workers/
│   │   └── emailWorker.js      # SQS consumer → SNS email trigger
│   ├── .env                    # ← not committed
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js        # Axios instance with auth header
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   └── RoleBadge.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx # JWT + org context
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Analytics.jsx
    │   │   ├── Users.jsx
    │   │   └── Settings.jsx    # includes logo upload card
    │   └── App.jsx
    └── .env                    # ← not committed
```

---

## 🧠 Architecture Highlights

- **Multi-tenancy** is implemented via `orgId` scoping — every user belongs to an organisation, and all data queries are filtered by `orgId`
- **RBAC** is enforced both on the backend (middleware checks `systemRole` and membership `role`) and on the frontend (UI elements conditionally rendered by role)
- **JWT tokens** are stored in `localStorage` and attached to every API request via an Axios interceptor
- **Analytics** are aggregated by `period` (YYYY-MM format), enabling month-over-month charting
- **File uploads bypass the backend entirely** — the API only issues a short-lived presigned S3 URL; the actual bytes go straight from the browser to S3, keeping the Fargate task stateless and reducing load
- **Async email delivery** — instead of sending email synchronously inside a request handler, events are pushed to SQS and processed by a separate worker, so a slow email provider can never block or fail an API response
- **Infrastructure is fully containerized and cloud-native** — no long-running servers to manage by hand; ECS Fargate handles scheduling, CloudWatch handles observability, and Secrets Manager handles credential rotation without code changes

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

MIT © [Harsh Upadhyay](https://github.com/harshupadhyay14)

---

> Built as a full-stack portfolio project demonstrating multi-tenant SaaS architecture on real AWS infrastructure — JWT auth, RBAC, direct-to-S3 uploads, async email via SQS/SNS, and real-time analytics.
