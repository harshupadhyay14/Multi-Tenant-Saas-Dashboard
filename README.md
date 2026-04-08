# 🚀 Multi-Tenant SaaS Dashboard

A full-stack multi-tenant SaaS dashboard with JWT authentication and role-based access control.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Recharts, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (JSON Web Tokens) |
| Deployment | Render / Railway / Vercel |

---

## Features

- ✅ Multi-tenancy — users can belong to multiple organizations
- ✅ Role-Based Access Control (RBAC) — Super Admin / Org Admin / Member / Viewer
- ✅ JWT authentication with bcrypt password hashing
- ✅ Org switching (Super Admin sees all tenants)
- ✅ User invitation system with role assignment
- ✅ Analytics dashboard with monthly metrics per org
- ✅ Plan limits enforced at API level

---

## Roles & Permissions

| Action | Super Admin | Org Admin | Member | Viewer |
|---|---|---|---|---|
| View all orgs | ✅ | ❌ | ❌ | ❌ |
| Manage any org | ✅ | ❌ | ❌ | ❌ |
| Invite users | ✅ | ✅ | ❌ | ❌ |
| Change user roles | ✅ | ✅ | ❌ | ❌ |
| View analytics | ✅ | ✅ | ✅ | ✅ |
| Export data | ✅ | ✅ | ✅ | ❌ |

---

## Project Structure

```
saas-dashboard/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   └── auth.js            # JWT verify + RBAC middleware
│   ├── models/
│   │   ├── User.js            # User schema with memberships array
│   │   ├── Organization.js    # Org schema with plan/status
│   │   └── Analytics.js       # Monthly metrics per org
│   ├── routes/
│   │   ├── auth.js            # POST /register, /login, GET /me
│   │   ├── users.js           # User CRUD + invite
│   │   ├── organizations.js   # Org CRUD
│   │   └── analytics.js       # Metrics endpoints
│   ├── server.js              # Express entry point
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## API Endpoints

### Auth
```
POST   /api/auth/register     { name, email, password, orgName }
POST   /api/auth/login        { email, password }
GET    /api/auth/me           (protected)
```

### Users
```
GET    /api/users/org/:orgId        List org users (org_admin+)
POST   /api/users/invite            { email, role, orgId }
PATCH  /api/users/:id/role          { role, orgId }
DELETE /api/users/:id/org/:orgId    Remove user from org
GET    /api/users                   All users (super_admin only)
```

### Organizations
```
GET    /api/organizations           All orgs (super_admin only)
GET    /api/organizations/mine      Current user's orgs
GET    /api/organizations/:id       Single org
PATCH  /api/organizations/:id       Update org
DELETE /api/organizations/:id       Delete org (super_admin only)
```

### Analytics
```
GET    /api/analytics/org/:id?months=6    Monthly metrics
POST   /api/analytics/track              Track event
```

---

## Setup & Run

### 1. Clone & Install Backend
```bash
cd backend
cp .env.example .env
# Fill in MONGO_URI and JWT_SECRET in .env
npm install
npm run dev
```

### 2. Create React Frontend
```bash
npx create-react-app frontend
cd frontend
npm install recharts lucide-react axios
```

### 3. Environment Variables
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/saas_dashboard
JWT_SECRET=change_this_to_a_long_random_string_in_production
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

---

## Frontend API Integration Example

```javascript
// utils/api.js
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

// Attach JWT to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Login
export const login = (email, password) => api.post('/auth/login', { email, password });

// Get org users
export const getOrgUsers = (orgId) => api.get(`/users/org/${orgId}`);

// Invite user
export const inviteUser = (email, role, orgId) =>
  api.post('/users/invite', { email, role, orgId });
```

---

## Deployment (Render)

1. Push to GitHub
2. Create a **Web Service** on Render for backend
3. Set environment variables in Render dashboard
4. Create a **Static Site** for React frontend (set `REACT_APP_API_URL`)
5. Use MongoDB Atlas free tier for the database

---

## Resume Bullet Points (copy-paste)

- Architected a **multi-tenant SaaS dashboard** supporting role-based access control (Super Admin / Org Admin / Member / Viewer) with JWT authentication and bcrypt password hashing
- Designed a **multi-membership user schema** in MongoDB enabling users to belong to multiple organizations with independent roles
- Built **9 RESTful API endpoints** across auth, users, organizations, and analytics with input validation using express-validator
- Enforced **plan-based user limits** at the API layer, blocking invites when org capacity is reached
