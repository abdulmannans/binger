# BingeWatcher design

Light minimal personal library. Keep this document in sync when changing visual tokens.

## Product

- Audience: people tracking movies and series they want / are / have watched
- Voice: quiet, direct, letterboxd-lite — personal library, not a cinema marquee
- Surfaces: Landing (`/`), Discover (`/discover`), Lists, Title detail, Auth

## Brand & type

- Display / wordmark: **Syne** (`font-display`) — modest size, medium weight
- Body / UI: **Figtree** — clean reading and controls
- Wordmark sits at ~`text-xl`–`text-2xl`, not oversized display shouting
- Do not use Inter, Roboto, Bebas Neue, or system-ui as primary

## Color tokens (`app/assets/css/main.css`)

| Token | Hex | Role |
|-------|-----|------|
| `canvas` | `#f5f5f3` | Page ground (+ soft radial wash) |
| `panel` / `panel-2` | `#ffffff` / `#ecece8` | Surfaces / muted fills |
| `ink` | `#161616` | Primary text and solid CTAs |
| `mist` | `#6e6e6e` | Secondary text |
| `line` | `#e4e4e0` | Hairline borders |
| `accent` / `gold` | `#3d6b5a` | Active chips, focus, emphasis only |
| `flare` | `#b42318` | Destructive |

CTAs are **ink on panel** (near-black buttons). Accent is for selection and focus, not every button.

## Layout patterns

- Sticky light header; content `max-w-6xl`
- Nav: underline/weight for active — not pill fills
- Poster grids: `grid-cols-2 … lg:grid-cols-6`
- Genre chips: soft outline; accent when active
- List status sections: Watching → Want → Watched → Unsorted
- Empty states: open hairline sections, not dashed dark panels
- In-library: checkmark in accent; add `+` is ink circle

## Motion

- Poster hover lift (~0.5)
- Chip / tab active transitions
- Header soft backdrop blur

## Anti-patterns

- No cinema-dark / IMDb gold UI
- No purple/indigo SaaS gradients
- No Inter-only stacks; no shouty condensed display
- No nested cards in hero; prefer open sections
- No surprise 409 on add — show in-library state first
