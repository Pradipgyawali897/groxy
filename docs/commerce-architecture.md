# Commerce Architecture Rationale

The commerce domain is isolated under `src/lib/commerce` and follows a hexagonal shape:

- `domain`: pure state, command, event, and invariant contracts.
- `application`: use cases that coordinate domain intent.
- `adapters`: Supabase/PostgreSQL persistence implementation.
- `agents`: Market Director, Librarian, Broker, and Clerk facades.
- `workers`: retry-safe worker definitions for reservation expiry and follow-up workflows.

Secondhand books are modeled as unique inventory objects. The source of truth is PostgreSQL, not client state. Reservation and checkout use `security definer` RPC functions with `for update` row locks, optimistic `inventory_version` checks, partial unique indexes for active reservations, and idempotent checkout keys.

The checkout flow is rollback-safe:

1. Expire stale reservations.
2. Lock the buyer cart.
3. Verify active reservations and one-copy quantities.
4. Move inventory to `CHECKOUT_PENDING`.
5. Create order, order items, and payment records.
6. Mark reservations `COMPLETED`.
7. Mark books `SOLD`.
8. Clear the cart.

Controllers and components do not contain commerce business rules. They validate request shape, call agents/use cases, and render state.
