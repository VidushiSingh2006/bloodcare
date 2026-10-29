# Deploying BloodCare

This guide produces a shareable HTTPS URL using a free Postgres instance and a free Node host.

## 1. Create a free PostgreSQL database

### Option A — Neon

1. Sign up at [https://neon.tech](https://neon.tech).
2. Create a project (region closest to you).
3. Open **Dashboard → Connection string** and copy the URI.
4. It looks like `postgresql://USER:PASSWORD@HOST/neondb?sslmode=require`.

### Option B — Supabase

1. Sign up at [https://supabase.com](https://supabase.com).
2. New project → wait for the database to finish provisioning.
3. **Project Settings → Database → Connection string → URI**.
4. Replace `[YOUR-PASSWORD]` and keep `sslmode=require`.

## 2. Put the URL in `.env`

Create `.env` in the repo root (never commit it):

```
DATABASE_URL="postgresql://..."
JWT_SECRET="a-long-random-string-at-least-16-chars"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

Apply schema and sample data:

```
npx prisma migrate deploy
npm run prisma:seed
```

Default admin after seed: `admin@college.edu` / `AdminPass123!`

## 3. Deploy for a live link

### Recommended: Render (Express + static UI together)

1. Push this repository to GitHub.
2. On [https://render.com](https://render.com) choose **New → Blueprint** and point at the repo (`render.yaml`), or **New Web Service** and set:
   - Build: `npm install && npx prisma generate && npm run build`
   - Start: `npx prisma migrate deploy && npm start`
3. Add environment variables: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` (set `FRONTEND_URL` to the Render URL after the first deploy, e.g. `https://bloodcare.onrender.com`).
4. After the first successful deploy, open the Render **Shell** once and run `npm run prisma:seed` so evaluators see sample donors and stock.
5. Share `https://<service>.onrender.com`. Public pages are `/`, `/need-blood`, `/compatibility`. Admin is `/admin` after login.

Free Render instances sleep after idle time; the first hit may take ~30 seconds.

### Alternative: Vercel static UI + Render API

1. Deploy the API on Render as above.
2. On Vercel, import the repo, set `VITE_API_URL` to `https://<api>.onrender.com/api/v1`, and `FRONTEND_URL` on the API to the Vercel origin.
3. `vercel.json` builds `client/dist`. CORS on Express already allows `FRONTEND_URL` plus local Vite origins.

## Health check

`GET /health` returns `{ "ok": true, "service": "bloodcare" }`.
