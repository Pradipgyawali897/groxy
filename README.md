## Auth-Ready Next.js + Supabase Starter

This project is a Next.js App Router starter with:
- Supabase Auth (email/password + OAuth)
- Protected routes with middleware
- Password reset flow
- `profiles` table schema + RLS policies

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and set values.
3. Run SQL in Supabase: [`supabase/schema.sql`](./supabase/schema.sql)
4. In Supabase Dashboard:
- Enable Email provider
- Enable Google provider
- Enable Facebook provider
- Add redirect URL: `http://localhost:3000/auth/callback`

5. Start app:

```bash
npm run dev
```

## Routes

- `/sign-in`
- `/sign-up`
- `/forgot-password`
- `/reset-password`
- `/dashboard` (protected)

## Security Notes

- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Never expose it client-side.
- `.env.local` is gitignored; `.env.example` contains field names only.
- Middleware enforces auth on protected routes.

## Verification

```bash
npm run lint
npm run build
```

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
