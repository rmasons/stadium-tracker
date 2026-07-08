# stadium-tracker design-sync notes

## Why this repo needed a synthesized entry

stadium-tracker is a Next.js **app**, not a published component package —
`package.json` has no `main`/`module`/`exports`, and `next build` doesn't
produce an importable dist entry. `.ds-sync-entry.ts` (gitignored, repo root)
is a hand-written barrel that stands in for one; `cfg.entry` points at it so
the converter's `PKG_DIR` walk-up lands on the real `package.json`
(`name: "stadium-tracker"`). There is no shipped `.d.ts` tree either, so every
synced component's props come from `cfg.dtsPropsFor` (hand-written) rather
than auto-extraction — keep both files in sync when a synced component's
props change.

## Scope: 8 of the app's components, not all of them

Synced (presentational, no Next.js/Firebase/Mapbox coupling): `LogoMark`,
`FilterSegments`, `StadiumDetail`, `VisitedList`, `MapDetailPanel`, `StatTile`,
`StadiumListRow`, `ZoomControls`.

`VariantSwitcher` was synced during the 1A/1B comparison phase but was dropped
along with `LayoutA`/`HeaderA`/`ProgressCard` once 1B was chosen as the
permanent layout — no more variant to switch between.

Excluded, and why:
- **`SignInButton`** — calls `useAuth()` (`components/AuthProvider.tsx`),
  which imports `lib/firebase.ts`. That file reads
  `process.env.NEXT_PUBLIC_FIREBASE_*` at module top level; esbuild's browser
  bundle has no `process` global and Next's env-inlining doesn't run outside
  Next's own build, so bundling this chain throws `process is not defined`
  at **module-evaluation time** — i.e. it would crash the whole
  `_ds_bundle.js` IIFE on load, not just this one card. Not attempted.
- **`Nav`, `HeaderA`, `SidebarB`** — use `next/link` / `next/navigation`
  (`usePathname`), which aren't meaningful outside a Next.js app router
  runtime.
- **`StadiumMap`** — needs a live Mapbox token, network map tiles, and WebGL;
  not something a static preview card can render.

## Regenerating the compiled CSS before a re-sync

Most of the 9 synced components use inline `style={{...}}` (literal `oklch()`/
`var(--mlb)` etc.), but `StadiumDetail` and `VisitedList` lean on Tailwind
utility classes (`bg-card`, `text-muted`, `rounded-lg`, ...) and the `--mlb`/
`--nfl`/`--border`/etc. custom properties all come from `app/globals.css`,
which Tailwind v4 only turns into real CSS through the Next.js build (it's
`@import "tailwindcss"` + `@theme inline`, not plain CSS). There's no stable,
non-hashed file to point `cfg.cssEntry` at directly, so before every build:

```sh
npm run build   # regenerates .next/static/chunks/<hash>.css + .next/static/media/*.woff2
rm -rf .design-sync/.cache/css-src
mkdir -p .design-sync/.cache/css-src/chunks .design-sync/.cache/css-src/media
SRC=$(grep -l -- "--mlb:" .next/static/chunks/*.css | head -1)
cp "$SRC" .design-sync/.cache/css-src/chunks/generated-globals.css
cp .next/static/media/*.woff2 .design-sync/.cache/css-src/media/
```

`cfg.cssEntry` points at the copied chunk. The `chunks/`+`media/` split mirrors
`.next/static/`'s own layout on purpose — the CSS's `@font-face` rules use
`url(../media/<hash>.woff2)` relative paths, so the copy must sit one level
under a sibling `media/` or every font 404s (`[FONT_DANGLING]`). Re-run this
whenever `app/globals.css` or any synced component's Tailwind classes change —
a stale copy silently ships outdated styling with no build error.

## Re-sync risks / what could go stale

- If `lib/firebase.ts` is ever changed to guard `process.env` access (e.g.
  `typeof process !== "undefined" ? process.env.X : undefined`), `SignInButton`
  becomes syncable — reconsider the exclusion above then.
- `componentSrcMap` and `dtsPropsFor` are hand-maintained in
  `.design-sync/config.json`. If any of the 9 components' prop signatures
  change, update `dtsPropsFor` too — auto-extraction can't catch drift here
  (no real `.d.ts` to diff against).
- `.ds-sync-entry.ts` must keep re-exporting exactly the `componentSrcMap`
  keys; if a component is renamed or moved, update both the entry file and
  the config's `componentSrcMap` path together.
- No Storybook, so every preview is authored from scratch (no reference
  render to diff against) — grades are absolute-rubric, not comparative.
- **Token system expanded.** `app/globals.css` now has a dark-default token
  palette (`--surface`, `--selected`, `--ink-medium` added; all components
  switched from literal `oklch()` to `var(--token)`). Before a re-sync, run
  the CSS copy step below so the compiled chunk includes the updated token
  values and dark-mode overrides. The `--mlb:` grep still finds the right
  chunk.
- **Stadium photos added.** `lib/photos.ts` maps all 62 stadium IDs to
  Wikimedia Commons thumbnail URLs (verified HTTP 200). `MapDetailPanel` now
  imports `getPhotoUrl` and shows a photo-first 64×64 image slot (photo →
  logo → striped placeholder). If a re-sync includes `MapDetailPanel`, the
  `dtsPropsFor` entry doesn't need updating (no prop changes), but the
  preview composition should exercise the photo path — pass a stadium ID that
  has a photo (all 62 do) to confirm the `<img>` renders rather than the
  placeholder.
- **Visited-state CSS.** `app/globals.css` gained a `.pin--visited` rule:
  `.pin[data-league]:not(.pin--visited):not(.pin--selected) { opacity: 0.55; }`.
  This is map-only and has no effect on any synced component, but it will be
  in the compiled chunk — the `--mlb:` grep approach still finds the right
  file.
