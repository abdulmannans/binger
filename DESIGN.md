# BingeWatcher design

Cinema-dark watchlist product. Keep this document in sync when changing visual tokens.

## Product

- Audience: people tracking movies and series they want / are / have watched
- Voice: direct, warm, low-noise — no franchise catalog clutter
- Surfaces: Discover, Lists, Title detail

## Brand & type

- Display: **Bebas Neue** (`font-display`) — page titles, section heads
- Body: **Outfit** — UI copy, meta, forms
- Do not switch to Inter, Roboto, system-ui as primary, or generic SaaS stacks

## Color tokens (`app/assets/css/main.css`)

| Token | Hex | Role |
|-------|-----|------|
| `ink` | `#0b0b0f` | Page background |
| `panel` / `panel-2` | `#16161f` / `#1e1e2a` | Surfaces |
| `line` | `#2a2a3a` | Borders |
| `gold` | `#f5c518` | Accent / CTA / eyebrows |
| `flare` | `#e11d48` | Destructive / alert |
| `mist` | `#9a9aaf` | Secondary text |
| `paper` | `#f4f1ea` | Primary text |

## Layout patterns

- Sticky header with backdrop blur; content `max-w-7xl`
- Poster grids: `grid-cols-2 … lg:grid-cols-6`
- Genre filters: horizontal chips, gold when active — not nested cards
- Status sections on lists: Watching → Want → Watched → Unsorted
- Recs rows: same poster language as Discover; checkmark when already in library

## Anti-patterns

- No purple/indigo SaaS gradients
- No Inter-only typography
- No universe/franchise hub in nav or Discover
- No surprise 409 on add — show in-library state on `+` first
- Prefer one job per section; avoid dashboard clutter on Discover hero
