# SaaSBoard — Free-Tier Deployment (Render + Vercel + MongoDB Atlas)

No AWS account needed. Org-logo upload is local disk storage on the backend,
and invite emails send inline via SMTP (or just log to console if SMTP isn't
configured). The original S3/SQS/SNS version is kept in `infra/aws-integration/`.

## 1. MongoDB Atlas (free M0 cluster)
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Database Access → add a user with a password.
3. Network Access → Allow Access from Anywhere (0.0.0.0/0) — fine for a demo.
4. Get the connection string ("Connect" → "Drivers") — this is `MONGO_URI`.

## 2. Backend on Render
1. Push these changes to your GitHub repo.
2. https://render.com → New → Blueprint → point it at this repo (it'll pick
   up `render.yaml`), or New → Web Service manually with:
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`
3. Set env vars (from `backend/.env.example`):
   - `MONGO_URI` — from step 1
   - `JWT_SECRET` — any long random string
   - `CLIENT_URL` — fill in after step 3 (your Vercel URL)
   - `BACKEND_URL` — this Render service's own URL, e.g. `https://saasboard-backend.onrender.com`
   - SMTP vars are optional — leave blank to just log invites to the Render logs
4. Deploy. Note the resulting URL, e.g. `https://saasboard-backend.onrender.com`.

Free Render web services spin down after inactivity — the first request after
idle takes ~30-50s to wake up. Fine for a resume demo, worth a one-line note
if a reviewer hits it cold.

Uploaded logos live on Render's local disk, which is wiped on every deploy —
acceptable for a demo, not for real persistence. If that matters later, swap
`backend/config/upload.js` for a persistent store (e.g. Cloudinary's free tier).

## 3. Frontend on Vercel
1. https://vercel.com → New Project → import the repo.
2. Root directory: `frontend`
3. Env var: `REACT_APP_API_URL` = `https://saasboard-backend.onrender.com/api`
4. Deploy. Note the resulting URL, e.g. `https://saasboard.vercel.app`.
5. Go back to Render and set `CLIENT_URL` to this Vercel URL, then redeploy
   the backend so CORS allows it.

## 4. Seed data (optional)
`backend/scripts/seedAnalytics.js` can be run once against the Atlas cluster
locally (with `MONGO_URI` pointed at Atlas) to populate demo analytics data.

## Done
Frontend URL is your live demo link for the resume/portfolio.
