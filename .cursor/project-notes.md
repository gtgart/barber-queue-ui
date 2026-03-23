# Barber Queue UI – Cursor Notes

## Current state
- Vite React app
- Tailwind v4
- Framer Motion interactions
- Vercel-ready
- Supabase-ready scaffold present but not active yet

## Immediate goal
Deploy Option A to Vercel first.

## After deploy
- componentize `App.jsx`
- add mock API layer
- connect queue state to Supabase
- connect workflow events from n8n / GHL

## Important product constraints
- Waiting and Come In Now are system-driven
- Barber only acts from In Shop -> In Chair -> Completed
- Preferred barber should auto-select on move
- `Any` should auto-assign to lowest projected minute load
