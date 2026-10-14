# SpendWise

A multi-user expense tracker: track your own spending and split shared expenses in groups.

## Tech stack

- [Next.js 15](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com) (Postgres, Auth, Row Level Security) via `@supabase/ssr`

## Getting started

1. Create a project on [Supabase](https://supabase.com).
2. Copy the env file and fill in your **Project URL** and **publishable key** (Project Settings → Data API / API Keys):

   ```bash
   cp .env.example .env.local
   ```

3. Install and run:

   ```bash
   npm install
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Type-check with TypeScript |
| `npm run format` | Format all files with Prettier |

## Database

SQL migrations live in `supabase/migrations`. Run each new file once, in order, in
Supabase → **SQL Editor** → **New query** → paste → **Run**.

| Migration | What it adds |
| --- | --- |
| `0001_profiles_and_categories.sql` | `profiles` and `categories` tables, Row Level Security, and a sign-up trigger that creates the profile and default categories |
| `0002_transactions.sql` | `transactions` table (income and expenses) with RLS and a check that the category is yours and matches the type |

TypeScript types for the tables are in `src/types/database.ts`.

## Supabase clients

| File | Use it in |
| --- | --- |
| `src/lib/supabase/client.ts` | Client Components |
| `src/lib/supabase/server.ts` | Server Components, Server Actions, Route Handlers |
| `src/lib/supabase/middleware.ts` | `src/middleware.ts` (refreshes the session on every request) |

## Adding shadcn/ui components

```bash
npx shadcn@latest add card input
```
