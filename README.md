# Barber Queue UI

A React + Vite + Tailwind + Framer Motion prototype for a barber walk-in queue system.

## What is included

- Dark-theme barber queue dashboard
- Waiting / Come In Now / In Shop / In Chair columns
- Time-based service load calculations
- Auto-assignment for `Any barber`
- Auto-selection of preferred barber on move to `In Chair`
- Completed stack animation
- Tap-first interaction model for iPad / desktop demos
- Vercel-ready setup
- Supabase-ready scaffolding without making Supabase mandatory for first deploy

## Tech stack

- React
- Vite
- Tailwind CSS v4
- Framer Motion
- Supabase JS client (prepared, optional for now)

## Option A: deploy now on Vercel

This is the recommended first move.

```bash
npm install
npm run build
```

Then either:

### Deploy with Git
1. Push the folder to GitHub
2. Import the repo into Vercel
3. Deploy as a Vite project

### Deploy with Vercel CLI
```bash
npm install -g vercel
vercel
```

This project includes a `vercel.json` rewrite so refreshing deep links will still resolve to the SPA entrypoint.

## Option B: wire Supabase later

Supabase is scaffolded but not required for the first deploy.

1. Copy `.env.example` to `.env.local`
2. Add:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. Use the prepared client in `src/lib/supabase.js`

Important: never expose a Supabase `service_role` key in frontend code.

## Run locally

```bash
npm install
npm run dev
```

This project is configured to expose the dev server on your local network.

## Build

```bash
npm run build
```

## Preview production build

```bash
npm run preview
```

## Key files

- `src/App.jsx` — main demo UI
- `src/index.css` — Tailwind import + base styles
- `src/lib/supabase.js` — Supabase client scaffold
- `.env.example` — environment variable template
- `vercel.json` — SPA rewrite for Vercel
- `docs/architecture.md` — product and state model notes
- `docs/next-steps.md` — suggested build path from UI to live system
- `docs/vercel-supabase.md` — deployment and integration notes
- `.cursor/project-notes.md` — Cursor project context

## Suggested next development steps

1. Split `App.jsx` into smaller components
2. Add a proper store state layer
3. Wire UI actions to mocked API calls
4. Connect to n8n webhook endpoints
5. Add Supabase persistence for queue items and barber loads
6. Sync to GHL opportunities and contact data
7. Add touch-first refinements for iPad landscape mode
