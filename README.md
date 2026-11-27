# Chronos Atlas — Thematic Historical & Geopolitical Investigation Platform

A Single-Deployment full-stack Next.js (App Router + API Routes + PostgreSQL) research platform built to satisfy **U3 A1, A2, A3, A4, A5** and all architectural specifications.

## Key Features Implemented

- **Dynamic Theming Engine (20 Cataloged Subjects)**: Entering any of the 20 civilizations/geopolitical states dynamically updates `<html data-theme="...">` and CSS Custom Properties (palette, high-contrast typography, gradients, and archival motifs).
- **A1 — JWT Authentication & User Interaction**: Registration with `bcryptjs` hashing, signed HS256 JWTs (`userId`, `role`, `sessionId`, `exp`), `Authorization: Bearer <token>` client transmission, persisted Favorites & Bookmarks with notes, and Topic Discussions & Comments.
- **A2 — Session & Device Management (Max 2 Concurrent Devices)**: Tracks device/browser/OS/IP sessions per `userId` in PostgreSQL, strictly enforces a maximum of **2 concurrent devices**, rejects 3rd device logins with HTTP `409` (or auto-revokes oldest via FIFO if configured by Admin), validates active session status on every request, and supports independent device session termination.
- **A3 — Password Management & Recovery**: Authenticated password updates verifying current password + enforcing strong password complexity; neutral-feedback forgot-password initiation (prevents account enumeration); cryptographically secure 256-bit single-use tokens (20-minute expiration, SHA-256 hashed at rest, invalidated atomically on use); supports Resend, SMTP, or built-in Recovery Mail Sandbox (`/mail-sandbox`) for zero-config testing.
- **A4 — Protected Routes & Protected Media**: Frontend route guards redirecting guests to `/login?redirect=...` (preserving intended destination), strict `401` backend guards on discussions and restricted archival media (`/api/media/[id]` — zero static `/public` exposure), and instant session invalidation on expired or tampered tokens.
- **A5 — Role-Based Access Control (RBAC)**: Server-enforced `STANDARD_USER`, `INVESTIGATOR`, and `ADMIN` permissions returning HTTP `403 Forbidden` on unauthorized operations, plus dedicated Investigator Studio (`/investigator`) and Admin Governance Console (`/admin`).
- **Extra Points — Sentry Monitoring**: Instrumented with `@sentry/nextjs` across client, server, edge runtimes, global error boundary, and an Admin diagnostics endpoint (`/api/sentry-test`).

## Pre-Seeded Demo Accounts

| Role | Email | Username | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@chronosatlas.edu` | `admin` | `Admin@2026!` |
| **Investigator** | `investigator@chronosatlas.edu` | `investigator` | `Investigator@2026!` |
| **Standard User** | `reader@chronosatlas.edu` | `reader` | `Reader@2026!` |

## Local Development

```bash
npm install
npm run dev
```

No external database setup is needed locally—when `DATABASE_URL` is omitted, Chronos Atlas automatically runs an embedded local PostgreSQL engine (`PGlite` in `./data/pglite`) and auto-creates + seeds all tables and 20 topics on first request.

## Single Deployment to Vercel + Neon PostgreSQL + Sentry

1. Push the `chronos-atlas` folder to a GitHub repository.
2. Import the repository in **Vercel** (`vercel.com/new`).
3. In Vercel Project → **Storage** → **Create Database** → choose **Neon Postgres** (free tier). Connect it to your project so `DATABASE_URL` is automatically added.
4. In Vercel Project → **Settings → Environment Variables**, add:
   - `JWT_SECRET` — any long random string (32+ characters)
   - *(Optional, Extra Points)* `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN` — from your free Sentry Next.js project
   - *(Optional)* `RESEND_API_KEY` or `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` for real recovery emails (otherwise `/mail-sandbox` works out of the box!)
5. Click **Deploy**. On the very first request, the database schema, 20 historical topics, 40 protected archival plates, and 3 demo accounts are initialized automatically!
