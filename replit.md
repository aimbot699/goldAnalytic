# Gold Live Analytic — Bangladesh Gold Price Tracker

## Overview
Premium gold-rate dashboard for Bangladesh with Firebase auth, MySQL backend, bKash/Nagad subscription payments, and admin panel.

## Architecture
- **Frontend**: `artifacts/gold-tracker/` — React + Vite + TypeScript, served at `/`
  - `src/App.tsx` — Router + Dashboard (live prices, 24h chart, karat table, valuation calculator)
  - `src/pages/Auth.tsx` — Firebase email/Google login
  - `src/pages/SubscriptionGate.tsx` — Plan selection (Monthly ৳60 / Yearly ৳400 / Lifetime ৳2000)
  - `src/pages/Payment.tsx` — bKash/Nagad TrxID submission
  - `src/pages/Admin.tsx` — Order/user management (passcode: `admin`, route `/admin`)
  - `src/firebase.ts` — Firebase auth (project goldbazarrate)
  - `src/lib/api.ts` — axios baseURL `/api`
- **Backend**: `artifacts/api-server/` — Express, all routes under `/api`
  - `src/lib/mysql.ts` — MySQL pool to existing DB at 91.99.159.222
  - `src/routes/gold.ts` — auth/sync, subscription, orders, admin, daily-history
- **Live prices**: Polled client-side every 10s from `gold-api.com` + `er-api.com`; backend records to `price_history` table every 30 min.

## Database (DO NOT MODIFY SCHEMA)
Production MySQL — already populated with users, subscriptions, orders, price_history. Connection details hardcoded in `lib/mysql.ts` as defaults; can be overridden via `MYSQL_*` env vars.

## Design System
- Premium dark theme with goldenrod accents, glassmorphism cards, Cormorant Garamond serif headings, Outfit sans-serif body.
- Live pulse indicator on header logo when prices update.

## Visual Editing Compatibility
Pages use a mix of inline styles and CSS classes (`.glass-card`, `.gold-card`, `.gold-text`, `.primary-btn`, `.ghost-btn`, etc.) defined in `src/index.css`.

## Recent Changes
- 2026-04-23: Initial port from RAR archive — converted JSX → TSX, replaced hardcoded localhost API URLs with relative `/api`, applied premium polish while preserving original layout/feature set.
