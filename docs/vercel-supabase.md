# Vercel + Supabase plan

## Current recommended deployment path

### Option A
Deploy the current frontend to Vercel first.

Reason:
- quickest path to a live iPad-ready URL
- no local networking required
- no backend blockers

### Option B
Turn on Supabase after the UI is live.

Reason:
- persistent queue state
- customer history
- loyalty tracking
- multi-device synchronization
- eventual realtime updates

## Suggested Supabase tables later

- `stores`
- `barbers`
- `services`
- `queue_items`
- `visits`
- `loyalty_accounts`

## Environment variables

Frontend-safe only:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Never put `service_role` in client code.

## Suggested folder expansion

- `src/components/`
- `src/lib/supabase.js`
- `src/hooks/`
- `src/data/`
- `src/types/` (if moving to TypeScript later)
