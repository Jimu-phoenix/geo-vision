# Trackr

Real-time device location tracking web app. Built with **Preact** + **Supabase** + **Leaflet**.

## Stack

| Layer | Tech | Why |
|---|---|---|
| Frontend | Preact + Vite | 3KB runtime, identical API to React |
| Realtime DB | Supabase | Postgres + built-in Realtime subscriptions |
| Maps | Leaflet.js | Lightweight, open-source, dark tile support |
| Location | Browser Geolocation API | Native GPS, no SDK needed |

## Setup

### 1. Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase_schema.sql`
3. Go to **Database → Replication** and enable Realtime for the `device_locations` table
4. Copy your **Project URL** and **anon public key** from **Project Settings → API**

### 2. Environment

```bash
cp .env.example .env
# Edit .env and fill in your Supabase URL and anon key
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## How It Works

- **Tracked device**: Opens the app, enters a device ID/label, clicks "Start Broadcasting". The browser's GPS via `watchPosition()` streams coordinates to Supabase every time the position updates.
- **Viewing device**: Opens the same app URL. Subscribes to Supabase Realtime and sees all active devices appear on the Leaflet map in real time, with accuracy radius circles.
- Any number of devices can track and view simultaneously.

## Accuracy Notes

- Outdoors / open sky: **3–10 metres** (GPS)
- Urban / buildings: **10–30 metres** (GPS degraded)
- Indoors: **10–100 metres** (falls back to Wi-Fi)
- The accuracy radius is shown as a circle on the map and as `±Xm` in the sidebar

## Deployment

```bash
npm run build
# Deploy the /dist folder to Netlify, Vercel, or any static host
```

## Project Structure

```
trackr/
├── src/
│   ├── components/
│   │   ├── TrackerMap.jsx    # Leaflet map with device markers
│   │   ├── DevicePanel.jsx   # Sidebar device list
│   │   └── SetupModal.jsx    # First-run identity setup
│   ├── hooks/
│   │   ├── useGeolocation.js # GPS watchPosition wrapper
│   │   └── useTracker.js     # Supabase Realtime subscription
│   ├── services/
│   │   └── locationService.js # Supabase upsert / delete
│   ├── app.jsx               # Root component
│   ├── main.jsx              # Entry point
│   ├── styles.css            # Global styles
│   └── supabase.js           # Supabase client
├── supabase_schema.sql       # Run this in Supabase SQL editor
├── .env.example              # Copy to .env
├── vite.config.js
└── package.json
```
