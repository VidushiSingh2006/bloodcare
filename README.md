# BloodCare

Original full-stack blood-group inventory platform inferred from the BloodCare admin and gate screens: live bag fill on the public home page, JWT-protected `/admin` operations, donor cooldown enforcement, and compatibility lookup.

## Stack

- Express.js + TypeScript API under `server/`
- PostgreSQL via Prisma (`prisma/schema.prisma`)
- React + Vite UI under `client/` matching the dashboard, donors, donations, requests, compatibility, login, and register screens
- Zod validation, custom `ApiError` middleware, parameterized Prisma queries

## Local run

1. Copy `.env.example` to `.env` and set `DATABASE_URL` + `JWT_SECRET`.
2. `npm install`
3. `npx prisma migrate deploy` (or `npx prisma db push`)
4. `npm run prisma:seed`
5. `npm run dev`

- UI: http://localhost:5173
- API: http://localhost:5000/api/v1
- Admin: `admin@college.edu` / `AdminPass123!`

Visitors can open `/` for live stock, `/need-blood` to file a request, and `/compatibility` without signing in.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Neon/Supabase + Render/Vercel.
