# 🚀 Multi-Tenant SaaS Dashboard

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

A **production-grade, full-stack multi-tenant SaaS dashboard** built with React, Node.js, Express, and MongoDB. Features JWT authentication, role-based access control (RBAC), real-time analytics, and organization-based user management — mirroring the architecture of real-world SaaS platforms like Notion and Slack.

🌐 **Live Demo:** [https://saas-dashboard-frontend-jdyf.onrender.com](https://saas-dashboard-frontend-jdyf.onrender.com)
🔗 **Backend API:** [https://saas-dashboard-backend-84ds.onrender.com](https://saas-dashboard-backend-84ds.onrender.com)

> ⚠️ Hosted on Render free tier — first load may take 30–60 seconds to spin up.

<img width="960" height="414" alt="Screenshot 2026-04-08 234926" src="https://github.com/user-attachments/assets/71dfd583-a65e-471d-83a8-1d504b7b0268" />
<img width="960" height="413" alt="Screenshot 2026-04-08 234947" src="https://github.com/user-attachments/assets/499a453d-b1a2-44fa-a366-4b37e850ece4" />
<img width="960" height="414" alt="Screenshot 2026-04-08 235208" src="https://github.com/user-attachments/assets/c15dd5e0-505e-426f-a1e1-199fe7bed3b9" />
<img width="960" height="409" alt="Screenshot 2026-04-08 235231" src="https://github.com/user-attachments/assets/e5ddb6f6-15d3-41f0-bbe4-1a5196d5bbf4" />





---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login/register with token-based sessions
- 🏢 **Multi-Tenant Architecture** — Organisation-scoped data isolation per tenant
- 👥 **Role-Based Access Control** — `super_admin`, `org_admin`, `member`, `viewer` roles
- 📊 **Live Analytics Dashboard** — Sessions, revenue, active users, and signups — charted with Recharts
- 👤 **User Management** — Invite users by email, assign roles, track status
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
| Styling | Inline CSS (dark futuristic theme) |
| Icons | Lucide React |
| Dev Tools | Nodemon, ESLint |

---

## 📸 Screenshots

> Dashboard with real-time sessions chart, KPI cards, and multi-page navigation

| Page | Description |
|------|-------------|
| **Login** | JWT-secured login with validation |
| **Dashboard** | KPI cards + live sessions chart |
| **Analytics** | Revenue, Active Users, Sessions — 3 Recharts graphs |
| **Users** | Member table with role badges, invite modal |
| **Settings** | Org settings panel |

---

## 🔴 Live Demo

| | URL |
|-|-----|
| **Frontend** | https://saas-dashboard-frontend-jdyf.onrender.com |
| **Backend API** | https://saas-dashboard-backend-84ds.onrender.com |

**Demo credentials:**
```
Email:    admin@acme.com
Password: Harsh123
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (free tier works)
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
│   │   └── analytics.js
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
    │   │   └── Settings.jsx
    │   └── App.jsx
    └── .env                    # ← not committed
```

---

## 🧠 Architecture Highlights

- **Multi-tenancy** is implemented via `orgId` scoping — every user belongs to an organisation, and all data queries are filtered by `orgId`
- **RBAC** is enforced both on the backend (middleware checks `systemRole` and membership `role`) and on the frontend (UI elements conditionally rendered by role)
- **JWT tokens** are stored in `localStorage` and attached to every API request via an Axios interceptor
- **Analytics** are aggregated by `period` (YYYY-MM format), enabling month-over-month charting

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

MIT © [Harsh Upadhyay](https://github.com/harshupadhyay14)

---

> Built as a full-stack portfolio project demonstrating multi-tenant SaaS architecture, JWT auth, RBAC, and real-time analytics.
