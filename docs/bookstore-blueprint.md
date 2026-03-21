# Groxy Books Blueprint

## App architecture

### Separation of concerns

- Authentication:
  - handled by Supabase Auth
  - creates identity and session only
- Onboarding:
  - collects profile details
  - chooses role
  - collects customer or merchant setup data
  - marks the user as onboarded
- Authorization:
  - driven by `profiles.role`, `profiles.is_onboarded`, and `profiles.onboarding_step`
  - enforced in middleware and server layouts
- Business data:
  - books, categories, authors, carts, wishlists, orders, reviews, addresses, payments, and merchant/customer metadata

## Route structure

### Public

- `/`
- `/books`
- `/books/[slug]`
- `/categories/[slug]`
- `/authors/[slug]`
- `/about`
- `/contact`

### Auth

- `/sign-in`
- `/sign-up`
- `/forgot-password`
- `/reset-password`
- `/auth/callback`

### Onboarding

- `/onboarding/step-1`
- `/onboarding/step-2`
- `/onboarding/step-3`
- `/onboarding/complete`

### Customer

- `/customer`
- `/customer/books`
- `/customer/wishlist`
- `/customer/cart`
- `/customer/orders`
- `/customer/profile`
- `/customer/settings`

### Merchant

- `/merchant`
- `/merchant/books`
- `/merchant/books/new`
- `/merchant/orders`
- `/merchant/analytics`
- `/merchant/store-settings`

### Admin

- `/admin`
- `/admin/users`
- `/admin/merchants`
- `/admin/books`
- `/admin/categories`
- `/admin/reviews`
- `/admin/analytics`

## Auth flow

1. User signs up or signs in.
2. Supabase creates or restores the session.
3. `auth/callback` exchanges the code and ensures the profile row exists.
4. If `is_onboarded = false`, the user is redirected into the onboarding flow.
5. If `is_onboarded = true`, the user is redirected to the correct role dashboard.

## Onboarding flow

### Step 1

- full name
- avatar URL

### Step 2

- choose role:
  - customer
  - merchant

### Step 3

- customer:
  - favorite genres
  - reading interests
  - newsletter preference
- merchant:
  - store name
  - store slug
  - short store description
  - logo URL
  - banner URL

### Step 4

- confirmation
- mark `is_onboarded = true`
- redirect to role dashboard

### Admin provisioning

- Admin is treated as a staff role, not a public onboarding option.
- Staff accounts should be provisioned by setting:
  - `profiles.role = 'admin'`
  - `profiles.is_onboarded = true`
  - `profiles.onboarding_step = 4`

## Middleware strategy

- Unauthenticated users:
  - can access public routes
  - are redirected to `/sign-in` for protected routes
- Authenticated but not onboarded users:
  - are redirected into onboarding
  - cannot remain on protected app routes
- Authenticated and onboarded users:
  - cannot reopen auth pages
  - are redirected to role dashboards
- Role mismatch:
  - redirected to the correct dashboard

This prevents redirect loops by separating:

- auth routes
- onboarding routes
- protected role routes
- public routes

## Database design

See [`supabase/schema.sql`](../supabase/schema.sql).

### Core tables

- `profiles`
- `customer_preferences`
- `merchant_workspaces`
- `authors`
- `categories`
- `books`
- `book_categories`
- `book_authors`
- `book_images`
- `carts`
- `cart_items`
- `wishlists`
- `wishlist_items`
- `orders`
- `order_items`
- `reviews`
- `addresses`
- `payments`
- `book_inquiries`

### Key principles

- enums for role and status fields
- foreign keys and indexes
- `updated_at` triggers
- row level security
- profile-centered ownership model

## RLS model

- Users can read and update their own `profiles`
- Customer and merchant profile tables are owner-controlled
- Published books are public
- Merchant-owned books are writable only by the merchant
- Carts, wishlists, addresses, and user orders are owner-controlled
- Reviews are public only when published
- Payment and order item reads are scoped through related orders

## Design system plan

### Visual direction

- warm neutral surfaces
- one strong indigo accent
- editorial serif for headings
- clean sans serif for body
- large radii
- soft depth and restrained shadows

### Shared UI patterns

- section headings
- premium book cards
- auth shell
- onboarding shell
- role dashboard shell
- empty states
- metric cards

## Folder structure

```txt
src/
  app/
  components/
    ui/
  features/
    auth/
    catalog/
    dashboard/
    onboarding/
    shared/
  lib/
  types/
  supabase/
docs/
```

## Implementation roadmap

### Phase 1

- schema
- middleware
- auth
- onboarding
- public pages
- dashboard shells

### Phase 2

- full customer cart, wishlist, addresses, orders
- merchant book creation/edit flows
- admin moderation actions
- review publishing

### Phase 3

- payments
- checkout
- search indexing
- advanced analytics
- recommendation engine
