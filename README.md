# SignalIQ v2

The Intelligent Revenue Layer for Builders. Sales intelligence that reads buyer nervous system state and adapts in real time.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

- `npm run dev` — dev server with hot reload
- `npm run build` — production build
- `npm start` — run the production build

## Where things live

- `app/page.tsx` — Command Center dashboard
- `app/prospects/` — list + detail (with AI composer)
- `app/sequences/` — adaptive sequences
- `app/signals/` — signal feed
- `app/nss/` — NSS Monitor
- `app/api/messages/route.ts` — message generation endpoint
- `lib/data.ts` — seed prospects and signal feed
- `lib/rscore.ts` — R-Score composite formula
- `lib/nss.ts` — polyvagal state inference
- `lib/generate.ts` — state-conditioned message archetypes
- `components/` — Sidebar, StateBadge, ProspectRow, Ladder, Composer
- `app/globals.css` — design tokens + component styles

## Spec

See `SignalIQ_v2_Product_Spec.md` for the product thesis, EMBRS algorithm, ICP, pricing, and GTM plan.
