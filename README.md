## Groxy • Book Marketplace Starter

This project is a Next.js App Router starter with:
- Supabase Auth (email/password + OAuth)
- Protected routes with middleware
- Password reset flow
- Blue minimal landing page (`/`)
- Service selection + separate customer/merchant registration flows
- Customer view (`/customer`, `/customer/books/[id]`, `/customer/cart`)
- Merchant view (`/merchant`) with full CRUD
- Admin panel (`/admin`) with listing moderation controls
- `profiles`, `customer_profiles`, `merchant_profiles`, `books`, and `book_inquiries` schema + RLS policies
- Webhook endpoint for buyer interest events

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
- Run SQL in [`supabase/schema.sql`](./supabase/schema.sql)

5. Start app:

```bash
npm run dev
```

## Routes

- `/` landing page
- `/service/select` choose service entity
- `/service/select/customer` customer service registration
- `/service/select/merchant` merchant service registration
- `/customer` customer catalog
- `/customer/books/[id]` customer detail with seller email contact
- `/customer/cart` customer cart preview
- `/merchant` merchant dashboard (protected)
- `/admin` admin panel (allowlist protected)
- `/sign-in`
- `/sign-up`
- `/forgot-password`
- `/reset-password`
- `/dashboard` (protected)

## API Endpoints

- `GET /api/books`
- `GET /api/books/:id`
- `GET /api/merchant/books` (protected)
- `POST /api/merchant/books` (protected)
- `GET /api/merchant/books/:id` (protected)
- `PATCH /api/merchant/books/:id` (protected)
- `DELETE /api/merchant/books/:id` (protected)
- `POST /api/webhooks/book-interest`
- `GET /api/admin/overview` (allowlist protected)
- `PATCH /api/admin/books/:id` (allowlist protected)
- `DELETE /api/admin/books/:id` (allowlist protected)

## Security Notes

- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Never expose it client-side.
- `.env.local` is gitignored; `.env.example` contains field names only.
- Middleware enforces auth on protected routes.
- Set `ADMIN_EMAILS` (comma-separated) to lock admin access.
- Add `GROXY_WEBHOOK_SECRET` and send the same value in `x-groxy-webhook-secret`.
- Merchant CRUD is protected by auth + owner checks.
