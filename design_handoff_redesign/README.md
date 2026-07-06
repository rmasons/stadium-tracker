# Handoff: Stadium Tracker Visual Redesign

## Overview
Visual refresh for stadium-tracker-six.vercel.app — an MLB/NFL stadium-visit tracking map. The redesign addresses three problems in the current site: (1) team-colored pins overlap into unreadable blobs in dense metro areas (NYC, LA, Miami, Bay Area), (2) there's no visible sense of progress toward the "tracker" goal, and (3) the chrome (emoji logo, solid-black sign-in pill, plain bottom toast) reads as unpolished default styling rather than an intentional design.

Two structural directions were explored. **Both should be built** — the developer/user will pick one after seeing it live in the real app with real data, so implement in a way that keeps them reasonably swappable (e.g. the sidebar in 1B and the floating progress card in 1A both read from the same "progress" data, pin styling logic is shared).

## About the Design Files
The bundled file (`Stadium Tracker Redesign.dc.html`) is a **design reference built in HTML/CSS** — a static mockup showing intended look, layout, and states. It is NOT production code to copy directly. The task is to recreate this visual design inside the existing stadium-tracker codebase (its current framework, likely React + Mapbox GL JS, given the live site's tile provider attribution), reusing its existing data layer, auth, and map integration — only the *visual layer* changes.

## Fidelity
**High-fidelity.** Colors, type, spacing, and component shapes in the mockup are final — implement them precisely. The map itself is a placeholder (grid pattern standing in for the real Mapbox tiles) since the real map render couldn't be reproduced outside the live app; keep the current Mapbox "Light" style/tile provider, only restyle the pins, header, legend, and info panels around it.

## Screens / Views
Both options are variations of the single main map screen (there is only one screen in the current app).

### Option 1A — Full-bleed map, refined chrome
**Purpose:** Same overall structure as today (map fills viewport, floating UI on top) but with legible pins, a progress indicator, and a proper detail panel.

**Layout:** Map is `position: relative` full-bleed container, `border-radius: 20px` in the mock only for presentation — in the real app it's the full viewport, no radius. All UI floats on top with `position: absolute`.

**Components:**
- **Header bar** — fixed top, full width, height 72px, background `#fff` at ~90% opacity + `backdrop-filter: blur(8px)`, bottom border `1px solid oklch(91% 0.005 95)`, padding `0 28px`, flex row, `justify-content: space-between`.
  - Logo mark: 30×30px, `border-radius: 8px`, gradient `linear-gradient(135deg, oklch(55% 0.14 250), oklch(55% 0.14 25))` (blue→red, MLB→NFL), with a small centered white dot (10×10px circle) — replaces the 🏟️ emoji.
  - Wordmark: "Stadium Tracker", Manrope 800, 19px, color `oklch(18% 0.01 90)`, letter-spacing -0.01em.
  - Right side: total progress text "23 of 62 visited" (Manrope 600, 13px, `oklch(45% 0.01 90)`), then Sign-in button.
  - Sign-in button: ghost style (not solid black) — `background: transparent`, `border: 1.5px solid oklch(80% 0.01 90)`, text `oklch(25% 0.01 90)`, Manrope 700, 14px, `padding: 9px 16px`, `border-radius: 9px`.
- **Legend + progress card** — floating top-left, 24px from top-left of the map area (below header), width 220px, white card, `border-radius: 14px`, padding `14px 16px`, `box-shadow: 0 6px 20px rgba(0,0,0,0.08)`, `border: 1px solid oklch(92% 0.005 95)`.
  - Segmented filter row (All / MLB / NFL): 3 equal-width segments, `gap: 6px`, active segment `background: oklch(20% 0.01 90)` + white text; inactive segments transparent, `oklch(45% 0.01 90)` text, MLB/NFL segments show a small 7px color dot before the label (blue for MLB, red-orange for NFL).
  - Divider: 1px `oklch(92% 0.005 95)`.
  - "Progress" label: 11.5px, 700 weight, uppercase, letter-spacing 0.04em, `oklch(55% 0.01 90)`.
  - Two progress rows (MLB, NFL): label+fraction on one line (13px/12.5px 600 weight, `oklch(30% 0.01 90)`), then a 6px-tall rounded progress bar, track `oklch(92% 0.005 95)`, fill is the league accent color, width = percentage complete.
- **Pins** — this is the core fix. Replace one circle per team-brand-color with:
  - Default (unvisited or single-team) pin: solid dot, 14–16px diameter, color = league accent only (blue `oklch(55% 0.14 250)` for MLB, red-orange `oklch(55% 0.14 25)` for NFL) — no per-team colors, no ring.
  - **Cluster pin**: when 2+ stadiums share a metro at the current zoom, render ONE larger dot (28–30px) in neutral dark `oklch(45% 0.01 90)` with the count as white centered text (Manrope 700, ~12px) instead of overlapping individual circles. Expands to individual pins on click/zoom.
  - **Selected pin**: enlarge to 20px, white 3px border, plus a colored outer ring via `box-shadow: 0 0 0 2px <accent>, 0 4px 10px rgba(0,0,0,0.25)`, with a small dark label pill (Manrope 700, 12px, white text on `oklch(20% 0.01 90)`, `padding: 4px 9px`, `border-radius: 6px`) anchored just below it showing the stadium name.
- **Detail drawer** (replaces the current plain "Click a pin to see the stadium." toast) — floating bottom, 20px inset from bottom/left/right, white card, `border-radius: 16px`, padding `18px 22px`, `box-shadow: 0 -8px 30px rgba(0,0,0,0.1)`, flex row with `gap: 18px`.
  - Left: 64×64px image thumbnail placeholder (stadium photo goes here), `border-radius: 12px`.
  - Middle: stadium name (Manrope 800, 16px, `oklch(18% 0.01 90)`) + team name (Manrope 600, 13px, `oklch(50% 0.01 90)`, same line); below it, visit metadata line "Visited {date} · vs. {opponent}" (Manrope 600, 13px, `oklch(48% 0.01 90)`).
  - Right: "Edit" button, `background: oklch(96% 0.005 95)`, no border, `oklch(30% 0.01 90)` text, Manrope 700, 13px, `padding: 9px 14px`, `border-radius: 9px`.
  - Empty state (no pin selected): show only the muted hint text, no thumbnail/edit button — matches current toast's role but restyled to match this card (white bg, same shadow/radius, centered text).

### Option 1B — Sidebar + map split
**Purpose:** Same data, but adds a persistent stadium list and moves progress/filters into a left sidebar. Scales better as the visited list grows, and gives mobile a natural collapse point (sidebar becomes a bottom sheet / drawer on narrow viewports).

**Layout:** Flex row, full viewport height. Sidebar: fixed 340px width, `border-right: 1px solid oklch(92% 0.005 95)`, flex column. Map: `flex: 1`, fills remaining space.

**Sidebar components (top to bottom):**
1. Header block, padding `22px 20px 16px`, bottom border `1px solid oklch(93% 0.005 95)`: logo (26×26px, same gradient treatment as 1A, no inner dot needed) + wordmark (Manrope 800, 17px). Below it, two stat tiles side by side (`gap: 14px`): each `flex:1`, `background: oklch(97% 0.006 95)`, `border-radius: 10px`, `padding: 10px 12px` — big number (Manrope 800, 20px, league accent color) + "/30" or "/32" total (Manrope 600, 12px, muted) on one line, league label below (11px, 700 weight, uppercase, muted).
2. Filter row: All / MLB / NFL, 3 equal segments, `gap: 8px`, padding `14px 20px`, active = dark filled pill, inactive = light `oklch(97% 0.006 95)` background — same segment styling language as 1A's legend.
3. Scrollable stadium list, `flex: 1`, each row: `display:flex`, `gap: 12px`, `padding: 11px 10px`, `border-radius: 10px` — small 9px league-color dot (filled if visited, outline-only if not yet visited) + stadium name (Manrope 700, 13.5px, `oklch(20% 0.01 90)`) + team name and visited/not-yet status (Manrope 500, 11.5px, `oklch(50% 0.01 90)`) stacked below. Visited rows: full opacity, subtle tinted background (`oklch(97% 0.008 250)` for a hovered/active row). Not-yet-visited rows: `opacity: 0.45`.
4. Footer: padding `16px 20px`, top border, ghost-style Sign-in button (same spec as 1A) at full sidebar width.

**Map area:** same pin logic and colors as 1A (league-accent dots, cluster count-badges, enlarged+ringed selected state — no per-team label pill needed here since the sidebar row shows selection state instead). Zoom controls: two 34×34px white square buttons (`border-radius: 9px`, `box-shadow: 0 3px 10px rgba(0,0,0,0.1)`) stacked top-right with `gap: 6px`, replacing the current default Mapbox zoom control styling — same +/− function, just restyled to match the card language.

**Mobile behavior (not mocked pixel-by-pixel, but specify):** Below ~768px, collapse the sidebar into a bottom sheet — collapsed state shows just the two stat tiles + filter row as a shallow drawer handle; dragging/tapping expands it to the full scrollable list over the map. This reuses the same sidebar markup, just re-parented/re-positioned via CSS at the breakpoint rather than a separate mobile-only component.

## Interactions & Behavior
- Clicking a pin selects it: pin animates to the "selected" enlarged/ringed state (transition `transform`/`box-shadow` ~150ms ease-out), and in 1A the bottom drawer populates with that stadium's data; in 1B the corresponding sidebar row highlights (and the list auto-scrolls to it if off-screen).
- Clicking a cluster pin: either zooms the map to break the cluster apart, or (if already at max practical zoom) opens a small popover listing the clustered stadiums by name — reuse whichever pattern Mapbox clustering plugin already in use supports.
- Filter segments (All/MLB/NFL): clicking filters both the map pins and (in 1B) the sidebar list simultaneously; active segment state uses the same dark-filled treatment described above.
- Hover states: pins scale up slightly (~1.15x) and show a lightweight name tooltip on hover, even before selection.
- Sign-in button: ghost style at rest; on hover, background fades to `oklch(97% 0.006 95)`.
- Empty/logged-out state: progress numbers can still show (based on local/session data) or show a muted "Sign in to track your visits" prompt in place of the progress card — confirm with product which is preferred; not specified further here.

## State Management
- `selectedStadiumId` — drives pin enlargement/ring, drawer contents (1A) or sidebar row highlight (1B).
- `activeFilter` — `'all' | 'mlb' | 'nfl'`, drives pin visibility and (1B) list filtering.
- `visitedStadiumIds` (existing data, just needs to be surfaced) — drives progress bar percentages, stat tile numbers, and the filled-vs-outline dot state in 1B's list.
- Clustering is a derived/computed state from current map viewport + zoom (whatever clustering utility the existing Mapbox integration uses, e.g. Supercluster).

## Design Tokens
**Colors**
- Background (page/map base): `oklch(96% 0.006 95)` — warm off-white
- Ink (primary text): `oklch(18–20% 0.01 90)`
- Muted text: `oklch(45–55% 0.01 90)`
- Borders/dividers: `oklch(91–93% 0.005 95)`
- Card surface: `#ffffff`
- MLB accent: `oklch(55% 0.14 250)` (blue)
- NFL accent: `oklch(55% 0.14 25)` (red-orange)
- Cluster/neutral badge: `oklch(45% 0.01 90)` (dark gray, not a league color — signals "mixed/multiple," not a specific league)

**Typography**
- Font: Manrope (Google Fonts), weights 400/500/600/700/800
- Wordmark: 17–19px / 800
- Section labels: 11–11.5px / 700 / uppercase / letter-spacing 0.03–0.04em
- Body/list text: 13–13.5px / 600–700
- Secondary/meta text: 11.5–13px / 500–600, muted color

**Spacing / radius**
- Card radius: 10–16px; button radius: 9px; pill/tile radius: 8–10px
- Card padding: 14–22px depending on card size
- Standard gaps: 6px (tight/segment), 12–14px (component groups), 20–28px (section padding)

**Shadows**
- Floating cards: `0 6px 20px rgba(0,0,0,0.08)` to `0 8px 30px rgba(0,0,0,0.1)`
- Small controls (zoom buttons): `0 3px 10px rgba(0,0,0,0.1)`
- Selected pin ring: `0 0 0 2px <accent>, 0 4px 10px rgba(0,0,0,0.25)`

## Assets
No new image/icon assets — logo mark is a CSS gradient square, all pins/dots/badges are CSS shapes. Stadium thumbnail in 1A's detail drawer is a placeholder for a real stadium photo (source TBD — could pull from an existing photo field or a stock/team-supplied image set). No emoji used anywhere in the redesign (removes the 🏟️ currently in the header).

## Files
- `Stadium Tracker Redesign.dc.html` — the design reference containing both options (1A and 1B), open directly in a browser to view. Option 1A is the first mockup block, 1B is the second, each labeled with a badge in the top-left of its frame.
