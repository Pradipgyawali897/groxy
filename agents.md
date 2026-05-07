# Commerce Division Agents

This marketplace uses bounded commerce agents for secondhand book workflows only. These agents do not own authentication, session management, platform governance, observability core, or the central orchestration engine.

## Market Director Agent

Responsible for marketplace coordination, transaction orchestration, workflow delegation, and seller/buyer synchronization.

The Market Director accepts typed commands, delegates to the Broker, Librarian, and Clerk, and publishes commerce events. It never mutates inventory directly.

## Librarian Agent

Responsible for inventory, metadata, categorization, search indexing, stock consistency, and availability synchronization.

The Librarian owns the inventory state machine:

- `AVAILABLE`
- `RESERVED`
- `CHECKOUT_PENDING`
- `SOLD`
- `EXPIRED`

## Broker Agent

Responsible for secondhand workflows, unique-item reservation, seller coordination, anti-double-selling, condition grading, and fraud-prevention hooks.

Secondhand books are unique inventory objects. The Broker reserves one concrete book row with a 10 minute lock and rejects concurrent reservations.

## Clerk Agent

Responsible for the checkout pipeline, payment orchestration, invoice generation, receipt lifecycle, order state machine, and refund orchestration.

The Clerk requires idempotency keys for checkout and verifies live reservations atomically before creating orders or marking books sold.

## Spawnable Worker Agents

Workers self-register, expose heartbeat data, publish audit events, and are safe to retry after failure.

- `ReservationWorker`: expires stale reservations and releases inventory.
- `CartExpirationWorker`: removes cart rows tied to expired reservations.
- `CheckoutVerifierWorker`: checks idempotent checkout state and prevents duplicate payment submission.
- `SearchIndexWorker`: reacts to inventory and metadata changes for search refreshes.
- `InvoiceWorker`: creates invoice/receipt lifecycle events after paid orders.
- `SellerSyncWorker`: reconciles seller-facing sale status after checkout and reservation release events.

## Communication Contract

Agents communicate only through typed commands, immutable events, and Zod-validated contracts. Controllers and UI components call use cases; business rules stay in the commerce domain and application layers.
