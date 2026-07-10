// Stadium mark (blue → red diagonal gradient, MLB → NFL) that replaces the
// 🏟️ emoji across the app — a track/pill outline (the geometric "stadium"
// shape: a rectangle capped with semicircles) standing in for a running
// track viewed from above. `dot` renders the small filled pill at its center
// (the field) used in the 1A header; 1B's sidebar header omits it (see
// design_handoff_redesign). Shares its shape with the browser tab favicon
// (app/icon.svg) so the in-app logo and tab icon read as the same brand mark.
import { useId } from "react";

export function LogoMark({
  size = 30,
  radius,
  dot = true,
}: {
  size?: number;
  radius?: number;
  dot?: boolean;
}) {
  // useId() is unique per component instance, so this must be derived here
  // (not hardcoded) — otherwise multiple <LogoMark> instances on one page
  // emit duplicate gradient ids and every url(#...) resolves to the first
  // definition. Strip the colons useId() wraps the id in (":r0:") since
  // they're unnecessary noise in an id attribute, even though they're valid
  // in both id and url(#...) as-is.
  const gradientId = `logo-gradient-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const center = size / 2;
  const trackWidth = size * 0.64;
  const trackHeight = size * 0.36;
  const fieldWidth = size * 0.34;
  const fieldHeight = size * 0.15;

  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--mlb)" }} />
          <stop offset="1" style={{ stopColor: "var(--nfl)" }} />
        </linearGradient>
      </defs>
      <rect
        width={size}
        height={size}
        rx={radius ?? Math.round(size * 0.27)}
        fill={`url(#${gradientId})`}
      />
      <rect
        x={center - trackWidth / 2}
        y={center - trackHeight / 2}
        width={trackWidth}
        height={trackHeight}
        rx={trackHeight / 2}
        fill="none"
        stroke="#fff"
        strokeWidth={Math.max(1.4, size * 0.07)}
      />
      {dot && (
        <rect
          x={center - fieldWidth / 2}
          y={center - fieldHeight / 2}
          width={fieldWidth}
          height={fieldHeight}
          rx={fieldHeight / 2}
          fill="#fff"
        />
      )}
    </svg>
  );
}
