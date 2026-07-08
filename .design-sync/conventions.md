## Using these components

No wrapper/provider is required — every synced component is presentational
(props in, JSX out). The app itself also has auth- and map-dependent
components (sign-in, navigation, the Mapbox view) that are NOT part of this
sync because they can't render outside a live Next.js/Firebase/Mapbox
runtime — don't infer a provider requirement from their absence.

## Styling idiom: CSS custom properties + a handful of Tailwind utilities

This system does not have a component-level styling API (no `variant`/`tone`
props for colors) — color and spacing values are **`var(--token)` references**
written directly in `style={{}}`, plus a few Tailwind utility classes for
structural pieces (`VisitedList`, `StadiumDetail`) that read the same tokens
through Tailwind's `@theme inline` mapping. When composing a new layout with
these parts, match that idiom — inline styles with real tokens, not invented
utility classes.

**Dark mode is the default.** Tokens are defined with dark values in `:root`;
`@media (prefers-color-scheme: light)` overrides them to the light palette.
Never hard-code a raw `oklch()` literal — if no token fits, add one.

Real tokens (defined in `styles.css`, sourced from `app/globals.css`):

| Token | Light value | Dark value | Use |
|---|---|---|---|
| `--mlb` | `oklch(55% 0.14 250)` | same | MLB accent (blue) — pins, badges, stat numbers |
| `--nfl` | `oklch(55% 0.14 25)` | same | NFL accent (red-orange) |
| `--cluster` | `oklch(45% 0.01 90)` | `oklch(52% 0.01 90)` | Neutral cluster badge |
| `--background` | `oklch(96% 0.006 95)` | `oklch(14% 0.008 90)` | Page / input bg |
| `--foreground` | `oklch(18% 0.01 90)` | `oklch(94% 0.006 90)` | Primary ink |
| `--card` | `#ffffff` | `oklch(19% 0.008 90)` | Card / panel surface |
| `--border` | `oklch(92% 0.005 95)` | `oklch(28% 0.008 90)` | Hairline dividers |
| `--muted` | `oklch(50% 0.01 90)` | `oklch(56% 0.008 90)` | Secondary text |
| `--surface` | `oklch(97% 0.006 95)` | `oklch(23% 0.008 90)` | Tile / hover bg |
| `--selected` | `oklch(97% 0.008 250)` | `oklch(24% 0.014 250)` | Selected list row tint |
| `--ink-medium` | `oklch(28% 0.01 90)` | `oklch(88% 0.008 90)` | Buttons, strong links |

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
