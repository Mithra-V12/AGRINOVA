<div align="center">

# AGRINOVA

**AI-Powered Precision Agriculture Platform**

Soil intelligence · Weather · Crop recommendations · AI Farm Advisor · Farm-to-consumer marketplace

![Status](https://img.shields.io/badge/status-in%20development-orange)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-backend-339933?logo=nodedotjs&logoColor=white)

</div>

---

## Overview

AGRINOVA is a web platform that helps farmers make data-informed decisions and sell directly to consumers. It brings soil and weather insights, crop recommendations, an AI advisor, and a marketplace into one application.

> **Project status:** The React + TypeScript frontend is built. The Node.js backend (`server/server.js`) and live data integrations are in progress. Some screens currently use demo data (`src/app/lib/mockData.ts`) through a service layer (`src/app/lib/api.ts`), so the UI can switch to the real API without component changes.

## Features

- **Soil intelligence and crop recommendations** for planting decisions
- **Weather dashboard** for farm locations
- **AI Farm Advisor** chat interface
- **Crop-health diagnosis** from uploaded plant photos
- **Marketplace** with product pages and checkout, connecting farmers and buyers
- **Government-scheme matcher** for farmer benefits
- **Accounts:** login, registration, and profile pages, plus a customer dashboard
- **Multilingual UI** with a 13-language switcher

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, Radix UI, Material UI |
| Backend | Node.js (`server/server.js`) |
| Tooling | npm, PostCSS |

## Getting Started

**Prerequisites:** Node.js 18 or later and npm.

```bash
# 1. Clone the repository
git clone https://github.com/Mithra-V12/AGRINOVA.git
cd AGRINOVA

# 2. Install dependencies
npm install

# 3. Start the frontend
npm run dev
```

Open the local URL printed in the terminal (usually http://localhost:5173).

To run the frontend and the backend together:

```bash
npm run dev:all
```

In development, requests to `/api/*` are proxied to the backend at `http://localhost:5000` (configured in `vite.config.ts`).

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run server` | Start the backend server |
| `npm run dev:all` | Start frontend and backend together |
| `npm run build` | Create a production build in `dist/` |

## Project Structure

```
AGRINOVA/
├── src/
│   ├── main.tsx                  # Application entry point
│   └── app/
│       ├── App.tsx               # Routes and app shell
│       ├── components/
│       │   ├── layout/           # Navbar, Footer
│       │   └── ui/               # Button and shared UI primitives
│       ├── lib/
│       │   ├── api.ts            # Service layer between UI and backend
│       │   ├── i18n.tsx          # Language context and translations
│       │   ├── mockData.ts       # Demo data used until the backend is complete
│       │   └── utils.ts          # Helper functions
│       ├── pages/
│       │   ├── Home.tsx
│       │   ├── Login.tsx
│       │   ├── Register.tsx
│       │   ├── Profile.tsx
│       │   ├── Dashboard.tsx
│       │   ├── CustomerDashboard.tsx
│       │   ├── AIFarmAdvisor.tsx
│       │   ├── CropHealth.tsx
│       │   ├── Weather.tsx
│       │   ├── GovernmentSchemes.tsx
│       │   ├── Marketplace.tsx
│       │   ├── ProductDetail.tsx
│       │   └── Checkout.tsx
│       └── styles/
│           └── globals.css       # Global styles and design tokens
├── server/
│   ├── server.js                 # Backend server
│   └── db.seed.json              # Seed data for local development
├── index.html                    # HTML entry
├── dev-all.mjs                   # Runs frontend and backend together
├── vite.config.ts                # Vite config and /api proxy
├── postcss.config.mjs
├── tsconfig.json
├── tsconfig.node.json
├── package.json
├── ATTRIBUTIONS.md
└── README.md
```

## Design System

- **Palette:** forest, canopy, and sprout greens, soil-clay, and a rice-husk cream background
- **Typography:** Fraunces (display), Inter (body and UI), IBM Plex Mono (data readouts)
- **Motif:** layered "soil-strata" gradient used for dividers and score bars

## Roadmap

- [x] Frontend screens and routing
- [x] Service layer (`api.ts`) for switching from demo data to real API calls
- [ ] Backend endpoints and multi-role authentication (farmer / buyer / admin)
- [ ] Live weather and government-scheme data
- [ ] AI-powered soil analysis, crop-health diagnosis, and advisor chat
- [ ] Payments and order tracking
- [ ] Deployment

## Team

Built by a student team. See the commit history for individual contributions.

## Credits

UI components from [shadcn/ui](https://ui.shadcn.com/) (MIT license) and photos from [Unsplash](https://unsplash.com) (Unsplash license). See `ATTRIBUTIONS.md`.
