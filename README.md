# Dashboard-SMMS

Social Media Management System — Next.js 16 + Supabase + Prisma.

**Production:** https://dashboard-smms.vercel.app/

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- React 19, TypeScript 5
- Supabase (Auth + Postgres)
- Prisma ORM 5.22
- Tailwind CSS v4

## Getting Started

1. Copy `.env.example` to `.env.local` and fill Supabase + DB credentials.
2. Install deps: `npm install` (auto-runs `prisma generate` via postinstall).
3. Run dev server: `npm run dev` → open [http://localhost:3000](http://localhost:3000).

## Deploy

Auto-deployed to Vercel on push to `main` of [iReen09/Dashboard-SMMS](https://github.com/iReen09/Dashboard-SMMS).
