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
