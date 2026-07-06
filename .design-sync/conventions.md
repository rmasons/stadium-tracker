## Using these components

No wrapper/provider is required — every synced component is presentational
(props in, JSX out). The app itself also has auth- and map-dependent
components (sign-in, navigation, the Mapbox view) that are NOT part of this
sync because they can't render outside a live Next.js/Firebase/Mapbox
runtime — don't infer a provider requirement from their absence.

## Styling idiom: CSS custom properties + a handful of Tailwind utilities

This system does not have a component-level styling API (no `variant`/`tone`
props for colors) — color and spacing values are either **literal `oklch()`
colors** or **`var(--token)` references** written directly in `style={{}}`,
plus a few Tailwind utility classes for structural pieces (`VisitedList`,
`StadiumDetail`) that read the same tokens through Tailwind's `@theme inline`
mapping. When composing a new layout with these parts, match that idiom —
inline styles with real tokens, not invented utility classes.

Real tokens (defined in `styles.css`, sourced from `app/globals.css`):

| Token | Use |
|---|---|
| `--mlb` | MLB league accent (blue) — pins, badges, stat numbers |
| `--nfl` | NFL league accent (red-orange) |
| `--cluster` | Neutral "multiple/mixed" badge color (map pin clusters) |
| `--background` | Page/map base (warm off-white) |
| `--foreground` | Primary ink |
| `--card` | White surface |
| `--border` | Hairline dividers/borders |
| `--muted` | Secondary text |

Literal `oklch()` values also appear directly (e.g. `oklch(20% 0.01 90)` for
dark pill fills, `oklch(50% 0.01 90)` for secondary text) where no token
exists yet — treat these as the same palette family, not one-offs to avoid.

Typography is **Manrope** (self-hosted, shipped in `fonts/`) at weights
400–800; headings/labels lean 700–800, body/meta text 500–600.

## Where the truth lives

- `styles.css` → `_ds_bundle.css` — the compiled Tailwind utilities + `:root`
  token definitions actually used by these components. Read it before
  inventing a new color or utility class.
- Each component's `.prompt.md` — real usage doc, generated from its JSDoc
  and the authored preview compositions in this sync.

## Example: composing a small stat/status cluster

```tsx
<div style={{ display: "flex", gap: 14 }}>
  <StatTile value={14} total={30} label="MLB" color="var(--mlb)" />
  <StatTile value={9} total={32} label="NFL" color="var(--nfl)" />
</div>
```

`StadiumListRow`/`FilterSegments` follow the same pattern: real props,
`var(--mlb)`/`var(--nfl)` for league color, inline styles for layout.
