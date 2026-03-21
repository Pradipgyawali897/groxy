## Groxy Books

Premium bookstore marketplace built with Next.js App Router, TypeScript, Supabase, Tailwind CSS, and shadcn/ui.

### What this version includes

- Premium public bookstore experience with:
  - `/`
  - `/books`
  - `/books/[slug]`
  - `/categories/[slug]`
  - `/authors/[slug]`
  - `/about`
  - `/contact`
- Identity-only auth:
  - `/sign-in`
  - `/sign-up`
  - `/forgot-password`
  - `/reset-password`
  - `/auth/callback`
- Multi-step onboarding:
  - `/onboarding/step-1`
  - `/onboarding/step-2`
  - `/onboarding/step-3`
  - `/onboarding/complete`
- Role-based app shells:
  - `/customer`
  - `/merchant`
  - `/admin`
- Future-ready schema in [`supabase/schema.sql`](./supabase/schema.sql)
- Middleware based on `profiles.role`, `profiles.is_onboarded`, and `profiles.onboarding_step`
- Shared design system with premium bookstore styling, reusable shells, cards, and dashboard navigation

### Architecture summary

- Authentication creates identity only.
- Onboarding collects profile data, role selection, and role-specific setup.
- Authorization happens in middleware and server layouts.
- Business data is separated into books, authors, categories, carts, wishlists, orders, reviews, addresses, payments, and merchant/customer data.

Detailed blueprint: [`docs/bookstore-blueprint.md`](./docs/bookstore-blueprint.md)

### Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local`
3. Run [`supabase/schema.sql`](./supabase/schema.sql) in Supabase
4. In Supabase Auth:
   - enable Email provider
   - enable Google provider if needed
   - add `http://localhost:3000/auth/callback`
5. Start the app:

```bash
npm run dev
```

### Core routes

- Public:
  - `/`
  - `/books`
  - `/books/[slug]`
  - `/categories/[slug]`
  - `/authors/[slug]`
  - `/about`
  - `/contact`
- Auth:
  - `/sign-in`
  - `/sign-up`
  - `/forgot-password`
  - `/reset-password`
- Onboarding:
  - `/onboarding/step-1`
  - `/onboarding/step-2`
  - `/onboarding/step-3`
  - `/onboarding/complete`
- Customer:
  - `/customer`
  - `/customer/books`
  - `/customer/wishlist`
  - `/customer/cart`
  - `/customer/orders`
  - `/customer/profile`
  - `/customer/settings`
- Merchant:
  - `/merchant`
  - `/merchant/books`
  - `/merchant/books/new`
  - `/merchant/orders`
  - `/merchant/analytics`
  - `/merchant/store-settings`
- Admin:
  - `/admin`
  - `/admin/users`
  - `/admin/merchants`
  - `/admin/books`
  - `/admin/categories`
  - `/admin/reviews`
  - `/admin/analytics`

### Important server routes

- `POST /api/onboarding`
- `GET /api/books`
- `GET /api/books/:id`
- `GET /api/merchant/books`
- `POST /api/merchant/books`
- `GET /api/merchant/books/:id`
- `PATCH /api/merchant/books/:id`
- `DELETE /api/merchant/books/:id`
- `GET /api/admin/overview`
- `PATCH /api/admin/books/:id`
- `DELETE /api/admin/books/:id`
- `POST /api/webhooks/book-interest`

### Production notes

- `SUPABASE_SERVICE_ROLE_KEY` must stay server-only.
- `NEXT_PUBLIC_APP_URL` should be set in production.
- `ADMIN_EMAILS` can still be used for staff governance around admin access.
- Admin users should be provisioned with `profiles.role = 'admin'` and `profiles.is_onboarded = true`.
- Current rate limiting is in-memory; move it to Redis/KV for multi-instance production.
