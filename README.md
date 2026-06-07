# AnimeX 🎌

A full-featured anime streaming site built with Next.js 14, Tailwind CSS, Vidstack, and a suite of anime APIs. Deployed on Vercel (frontend) and Railway (API proxy).

---

## ✨ Features

- 🎬 **Stream anime** via Anify (HLS sources) with Vidstack player
- ⏭️ **Auto skip intro/outro** powered by AniSkip timestamps
- 📊 **Rich metadata** from AniList (GraphQL) and Jikan (MAL REST API)
- 🔍 **Browse & search** with genre, year, format, status filters
- 📋 **Personal watchlist** with progress tracking (persisted locally)
- 🌙 **Dark-first design** with a bold orange brand color
- ⚡ **Edge-ready** with ISR, Server Components, and route-level caching

---

## 🗂 Project Structure

```
animex/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Homepage
│   │   ├── layout.tsx            # Root layout
│   │   ├── browse/               # Search & filter page
│   │   ├── anime/[id]/           # Anime detail page
│   │   ├── watch/[id]/[ep]/      # Watch page (player)
│   │   ├── trending/             # Trending list
│   │   ├── profile/              # My watchlist
│   │   └── api/
│   │       ├── anilist/          # AniList GraphQL proxy
│   │       ├── anify/            # Anify sources proxy
│   │       ├── aniskip/          # AniSkip timestamps proxy
│   │       └── jikan/            # Jikan episodes proxy
│   ├── components/
│   │   ├── anime/                # AnimeCard, AnimeGrid, HeroBanner, EpisodeList
│   │   ├── player/               # AnimePlayer (Vidstack + AniSkip)
│   │   └── layout/               # Navbar
│   ├── lib/
│   │   ├── anilist.ts            # AniList GraphQL client
│   │   ├── jikan.ts              # Jikan REST client
│   │   ├── aniskip.ts            # AniSkip client
│   │   ├── anify.ts              # Anify client
│   │   ├── store.ts              # Zustand watchlist store
│   │   └── utils.ts              # Helpers
│   └── types/index.ts            # Shared TypeScript types
├── server/
│   ├── server.js                 # Express proxy for Railway
│   └── package.json
├── vercel.json
├── railway.toml
└── .env.example
```

---

## 🚀 Getting Started

### 1. Clone and install

```bash
git clone https://github.com/you/animex.git
cd animex
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
RAILWAY_API_URL=http://localhost:3001   # local dev
ANIFY_API_URL=https://api.anify.tv
```

### 3. Run the dev server

```bash
npm run dev
```

Also start the Railway proxy locally:
```bash
cd server && npm install && node server.js
```

Visit [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deployment

### Vercel (Frontend)

1. Push to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Set environment variable: `RAILWAY_API_URL=https://your-project.up.railway.app`
4. Deploy

### Railway (Proxy Server)

1. Create a new Railway project
2. Connect your GitHub repo
3. Set root directory to `server/`
4. Add env vars:
   - `ANIFY_API_URL=https://api.anify.tv`
   - `ANIFY_API_KEY=` (if required)
   - `ALLOWED_ORIGIN=https://your-app.vercel.app`
5. Railway auto-detects Node and runs `npm start`
6. Copy the generated URL → paste as `RAILWAY_API_URL` in Vercel

---

## 🔌 API Reference

| API | Used For | Rate Limit |
|-----|----------|------------|
| [AniList](https://anilist.co/graphiql) | Metadata, search, recommendations | 90 req/min |
| [Jikan](https://jikan.moe) | Episode lists, stats, staff | 3 req/sec |
| [AniSkip](https://aniskip.com) | Intro/outro timestamps | Generous |
| [Anify](https://anify.tv) | HLS streaming sources, subtitles | Self-hosted recommended |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Video Player | Vidstack |
| State | Zustand (persisted) |
| Data Fetching | Fetch + SWR |
| Frontend Host | Vercel |
| Proxy Server | Express.js on Railway |
| Language | TypeScript |

---

## 📝 Notes

- **No ads, no login required** — watchlist is stored in `localStorage` via Zustand persist
- **AniSkip** uses MAL IDs, so episodes need a `idMal` from AniList
- **Anify** is the streaming backbone — their public API may rate-limit; self-hosting on Railway is recommended
- ISR revalidation: homepage 30min, anime pages 1hr, watch pages on-demand

---

## 📜 License

MIT — do whatever you want, just don't remove attribution.
