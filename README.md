# BingeWatcher

Personal movie and series library. Search titles, pin them to lists, rate them, and leave notes. Posters and IMDb ratings come from TMDB + OMDb. Your data lives in a local SQLite file (no Google account).

## Setup

1. Copy `.env.example` to `.env`.
2. Create a [TMDB](https://www.themoviedb.org/settings/api) API key and an [OMDb](https://www.omdbapi.com/apikey.aspx) key.
3. Set `INVITE_CODE` (needed to register) and a `SESSION_SECRET` of at least 32 characters.

SQLite creates `data/bingewatcher.db` on first request. No database signup.

```bash
npm install
npm run dev
```

Open http://localhost:3000, register with the invite code, then search and build lists.

If you later host on Netlify, do **not** use the SQLite file. Create a free [Turso](https://turso.tech) database and set these in **Site configuration → Environment variables**, then redeploy:

- `DATABASE_URL` — `libsql://....turso.io`
- `DATABASE_AUTH_TOKEN` — the Turso token (required)
- `TMDB_API_KEY`
- `INVITE_CODE`
- `SESSION_SECRET` — at least 32 characters

`DATABASE_URL` without `DATABASE_AUTH_TOKEN` will fail with a server error on register.

## Stack

Nuxt + Vue 3 + Tailwind + SQLite (libSQL). Auth is email + bcrypt and an httpOnly session cookie.
