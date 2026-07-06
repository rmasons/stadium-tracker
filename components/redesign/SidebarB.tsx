"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";
import { SignInButton } from "@/components/SignInButton";
import { FilterSegments } from "@/components/FilterSegments";
import { useAuth } from "@/components/AuthProvider";
import { STADIUMS } from "@/lib/stadiums";
import { StatTile } from "./StatTile";
import { StadiumListRow } from "./StadiumListRow";
import type { League, Stadium } from "@/lib/types";
import type { Summary } from "@/lib/stats";

interface Props {
  summary: Summary;
  filter: League | "ALL";
  onFilterChange: (next: League | "ALL") => void;
  visitedIds: Set<string>;
  selectedId: string | null;
  onSelectStadium: (stadium: Stadium) => void;
}

export function SidebarB({
  summary,
  filter,
  onFilterChange,
  visitedIds,
  selectedId,
  onSelectStadium,
}: Props) {
  const { user, signOut } = useAuth();
  // Below ~768px the sidebar collapses into a bottom sheet: header + filter
  // stay visible as a drawer handle, the list only shows once expanded.
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const rows = STADIUMS.filter((s) => filter === "ALL" || s.league === filter);

  return (
    <div
      className={`${selectedId ? "hidden" : "flex"} md:flex fixed inset-x-0 bottom-0 z-30 w-full flex-col border-t bg-white md:static md:inset-auto md:z-auto md:h-full md:w-[340px] md:border-r md:border-t-0 ${
        mobileExpanded ? "max-h-[75vh]" : ""
      }`}
      style={{ borderColor: "oklch(92% 0.005 95)" }}
    >
      <div
        style={{
          padding: "22px 20px 16px",
          borderBottom: "1px solid oklch(93% 0.005 95)",
          flexShrink: 0,
        }}
      >
        <button
          className="flex w-full items-center justify-between md:pointer-events-none"
          onClick={() => setMobileExpanded((v) => !v)}
          style={{ marginBottom: 16, background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LogoMark size={26} dot={false} />
            <span
              style={{
                fontWeight: 800,
                fontSize: 17,
                color: "oklch(18% 0.01 90)",
                letterSpacing: "-0.01em",
              }}
            >
              Stadium Tracker
            </span>
          </span>
          <span className="text-xs text-muted md:hidden" aria-hidden>
            {mobileExpanded ? "▾" : "▴"}
          </span>
        </button>
        <div style={{ display: "flex", gap: 14 }}>
          <StatTile
            value={summary.mlb}
            total={summary.mlbTotal}
            label="MLB"
            color="var(--mlb)"
          />
          <StatTile
            value={summary.nfl}
            total={summary.nflTotal}
            label="NFL"
            color="var(--nfl)"
          />
        </div>
      </div>

      <div style={{ padding: "14px 20px", flexShrink: 0 }}>
        <FilterSegments value={filter} onChange={onFilterChange} variant="sidebar" />
      </div>

      <div
        className={`${mobileExpanded ? "block" : "hidden"} md:block`}
        style={{ flex: 1, overflowY: "auto", padding: "4px 12px" }}
      >
        {rows.map((stadium) => (
          <StadiumListRow
            key={stadium.id}
            stadium={stadium}
            visited={visitedIds.has(stadium.id)}
            selected={selectedId === stadium.id}
            onClick={() => {
              onSelectStadium(stadium);
              setMobileExpanded(false);
            }}
          />
        ))}
      </div>

      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid oklch(93% 0.005 95)",
          flexShrink: 0,
        }}
      >
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {user.photoURL && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt=""
                style={{ width: 28, height: 28, borderRadius: 999 }}
              />
            )}
            <Link
              href="/tracker"
              style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "oklch(25% 0.01 90)" }}
            >
              My Tracker
            </Link>
            <button
              onClick={() => void signOut()}
              style={{
                background: "transparent",
                border: "1.5px solid oklch(80% 0.01 90)",
                color: "oklch(25% 0.01 90)",
                fontWeight: 700,
                fontSize: 13,
                padding: "8px 12px",
                borderRadius: 9,
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
          </div>
        ) : (
          <SignInButton fullWidth />
        )}
      </div>
    </div>
  );
}
