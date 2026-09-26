# 🇰🇿 Kazakhstan 8-Day Trip Itinerary App

An interactive travel planner for a 6-person Kazakhstan trip (Oct 11–18, 2026). Built with **Next.js 16**, **Tailwind CSS**, and **TypeScript**. Deployable to Vercel in one click.

## ✨ Features

| Tab | Feature |
|-----|---------|
| 📅 **Day-by-Day Plan** | Timeline view of all 8 days with category filtering (food/transit/sightseeing/hotel), budget progress bars per day |
| 🌤️ **Live Weather** | Real-time conditions for Almaty, Charyn Canyon, Saty, and Altyn Emel via [Open-Meteo](https://open-meteo.com/) (free, no API key) |
| 🚗 **Car & Luggage** | 3-option transport calculator (Minivan / 2 Crossovers / Private Driver) with per-person cost breakdown |
| 📍 **Interactive Map** | Leaflet + OpenStreetMap with 11 location markers, popups, and dashed road trip route |
| 🗺️ **Routes & Times** | Distance/travel time matrix for all route legs with road condition notes |
| 📖 **Phrasebook** | Kazakh & Russian phrases with text-to-speech audio pronunciation |
| 💰 **Currency & Budget** | KZT → USD/INR/EUR/GBP converter + 8-day budget breakdown with progress bars |
| ✅ **Packing Checklist** | Interactive checklist with progress bar + Kazakhstan emergency contacts |

### Extra
- ⏱️ **Live Countdown** ticker in header (days/hours/minutes/seconds to departure)
- 🖨️ **Print button** — clean print layout of all 8 days
- 🌙 **Dark/Light mode** toggle

## 🗺️ Trip Route

**Almaty** (Days 1–4) → **Charyn Canyon** → **Saty Village** → **Lake Kaindy** → **Lower Kolsai Lake** → **Altyn Emel / Singing Dunes** → **Back to Almaty** (Day 8)

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import the GitHub repo — Vercel auto-detects Next.js
4. Click **Deploy** — done! No environment variables needed.

## 🛠️ Local Development

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## 🏗️ Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **Tailwind CSS** v3
- **TypeScript**
- **Lucide React** (icons)
- **React Leaflet** (interactive map)
- **Open-Meteo API** (live weather — free, no API key)

## 📂 Project Structure

```
├── app/
│   ├── layout.tsx        # Root layout + SEO metadata
│   ├── page.tsx          # Root page
│   └── globals.css       # Tailwind + print styles
└── components/
    ├── KazakhstanApp.tsx  # Main app (all 8 tabs)
    └── MapTab.tsx         # Leaflet map (no SSR)
```
