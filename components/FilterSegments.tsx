"use client";

import type { League } from "@/lib/types";

type LeagueFilter = League | "ALL";

const OPTIONS: { key: LeagueFilter; label: string; dotColor?: string }[] = [
  { key: "ALL", label: "All" },
  { key: "MLB", label: "MLB", dotColor: "var(--mlb)" },
  { key: "NFL", label: "NFL", dotColor: "var(--nfl)" },
];

/** Segmented All/MLB/NFL filter, shared by 1A's floating legend card and 1B's
 *  sidebar — `variant` controls the small sizing/background differences
 *  between the two per the design spec. */
export function FilterSegments({
  value,
  onChange,
  variant = "card",
}: {
  value: LeagueFilter;
  onChange: (next: LeagueFilter) => void;
  variant?: "card" | "sidebar";
}) {
  const isSidebar = variant === "sidebar";
  return (
    <div
      role="group"
      aria-label="Filter stadiums by league"
      style={{ display: "flex", gap: isSidebar ? 8 : 6 }}
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            aria-pressed={active}
            style={{
              flex: 1,
              textAlign: "center",
              padding: isSidebar ? "8px 0" : "7px 0",
              borderRadius: 8,
              background: active
                ? "oklch(20% 0.01 90)"
                : isSidebar
                  ? "oklch(97% 0.006 95)"
                  : "transparent",
              color: active ? "#fff" : "oklch(45% 0.01 90)",
              fontSize: isSidebar ? 13 : 12.5,
              fontWeight: active ? 700 : 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              border: "none",
              cursor: "pointer",
            }}
          >
            {!isSidebar && opt.dotColor && (
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  background: opt.dotColor,
                }}
              />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
