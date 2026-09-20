# AGRINOVA — AI-Powered Precision Agriculture (Frontend, Phase 1)

Frontend for AGRINOVA: soil intelligence, weather, crop recommendations, AI Farm Advisor chat,
crop-health photo diagnosis, a farm-to-consumer marketplace, and a government-scheme matcher.

This is **Phase 1: frontend only**, wired against a service layer (`src/app/lib/api.ts`) that
currently returns realistic mock/heuristic data so every screen is fully interactive without a
backend. Phase 2 will add a FastAPI backend; only `api.ts` will need to change — no component
code — because the function signatures already match the future `/api/...` contract.

## Running the code

```bash
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

## Project structure

```
src/app/
  components/ui/        Reusable primitives (Button, Card, StrataScore, Badge, form fields)
  components/layout/     Navbar (with 13-language switcher) and Footer
  lib/i18n.tsx            Language context + nav-string dictionary
  lib/mockData.ts         Demo farmer, soil, weather, crop, marketplace and scheme data
  lib/api.ts               Service layer — swap for real fetch() calls in Phase 2
  pages/                  One file per route (Home, Dashboard, AI Farm Advisor, Crop Health,
                           Weather, Marketplace, Product Detail, Government Schemes, Profile,
                           Register)
```

## Design system

- Palette: forest/canopy/sprout greens, soil-clay, rice-husk cream background
- Type: Fraunces (display), Inter (body/UI), IBM Plex Mono (data readouts)
- Signature motif: "soil-strata" layered gradient used for section dividers and all score bars

## Coming in Phase 2 (backend)

- FastAPI service with PostgreSQL models for farmers, soil reports, orders, listings
- `/api/soil/analyze` — OCR extraction + Claude-generated plain-language summary
- `/api/crop-health/analyze` — Claude vision-based disease/pest diagnosis from photos
- `/api/advisor/chat` — Claude-powered conversational advisor grounded in farmer context
- Real weather-provider integration, payments, and order/delivery tracking
