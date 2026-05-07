# Infrastructure Agent Manifest

This document defines the organizational structure for the Infrastructure Division, governing all backend, security, and reliability initiatives.

## EXECUTIVE INFRASTRUCTURE LAYER
- **CTO AGENT (Infrastructure/Reliability/Security)**: Governance, backend architecture, scalability, and deployment safety.

## SPECIALIZED ENGINEERING AGENTS
- **SECURITY AGENT**: Auth hardening (JWT/RBAC), RLS auditing, API protection, and secret management.
- **CI/CD AGENT**: Deployment pipelines, build verification, and release governance.
- **TESTING AGENT**: Test suites (unit/integration/E2E), concurrency tests, and regression safety.
- **OBSERVABILITY AGENT**: Logging, tracing, metrics, and runtime visibility.
- **PERFORMANCE AGENT**: Bundle analysis, caching strategies, query/SSR optimization, and memory management.
- **DATABASE AGENT**: Supabase schema management, indexing, transactional integrity, and migration governance.

## SPAWNABLE WORKER AGENTS
- Workers are spawned on-demand for isolated tasks (e.g., `JWTAuditWorker`, `ReservationRaceConditionWorker`, `DatabaseIndexWorker`).
- Each worker adheres to architectural boundaries and avoids all UI-related file modifications.
