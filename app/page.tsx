"use client";

import { useEffect, useMemo, useState } from "react";
import { StadiumMap } from "@/components/StadiumMap";
import { StadiumDetail } from "@/components/StadiumDetail";
import { useAuth } from "@/components/AuthProvider";
import { subscribeToVisits, saveVisit, removeVisit } from "@/lib/visits";
import { summarize } from "@/lib/stats";
import type { League, Stadium, Visit } from "@/lib/types";

type LeagueFilter = League | "ALL";

export default function HomePage() {
  const { user, configured } = useAuth();
  const [visits, setVisits] = useState<Record<string, Visit>>({});
  const [selected, setSelected] = useState<Stadium | null>(null);
  const [leagueFilter, setLeagueFilter] = useState<LeagueFilter>("ALL");

  useEffect(() => {
    if (!user) {
      // Clear another user's data on sign-out. Intentional reset on dependency
      // change, not a render-time cascade.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisits({});
      return;
    }
    return subscribeToVisits(user.uid, (list) => {
      const next: Record<string, Visit> = {};
      for (const v of list) next[v.stadiumId] = v;
      setVisits(next);
    });
  }, [user]);

  const visitedIds = useMemo(() => new Set(Object.keys(visits)), [visits]);
  const summary = useMemo(() => summarize(Object.values(visits)), [visits]);

  async function handleSave(input: { date: string; opponent: string }) {
    if (!user || !selected) return;
    await saveVisit(user.uid, { stadiumId: selected.id, ...input });
  }

  async function handleRemove() {
    if (!user || !selected) return;
    await removeVisit(user.uid, selected.id);
  }

  return (
    <div className="relative flex-1">
      <StadiumMap
        visitedIds={visitedIds}
        selectedId={selected?.id ?? null}
        leagueFilter={leagueFilter}
        onSelect={setSelected}
      />

      {/* Legend + filter + progress */}
      <div className="pointer-events-none absolute left-4 top-4 space-y-2">
        <div className="pointer-events-auto rounded-lg border border-border bg-card/95 px-3 py-2 text-sm shadow-sm backdrop-blur">
          <div
            role="group"
            aria-label="Filter stadiums by league"
            className="flex items-center gap-1"
          >
            {(
              [
                { key: "ALL", label: "All", dot: null },
                { key: "MLB", label: "MLB", dot: "bg-mlb" },
                { key: "NFL", label: "NFL", dot: "bg-nfl" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setLeagueFilter(opt.key)}
                aria-pressed={leagueFilter === opt.key}
                className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${
                  leagueFilter === opt.key
                    ? "bg-foreground text-background"
                    : "hover:bg-background"
                }`}
              >
                {opt.dot && (
                  <span
                    className={`inline-block h-2.5 w-2.5 rounded-full ${opt.dot}`}
                  />
                )}
                {opt.label}
              </button>
            ))}
          </div>
          {user && (
            <p className="mt-1.5 text-xs text-muted">
              {summary.total} of {summary.overallTotal} visited ({summary.percent}
              %)
            </p>
          )}
        </div>
        {!configured && (
          <div className="pointer-events-auto max-w-xs rounded-lg border border-border bg-card/95 px-3 py-2 text-xs text-muted shadow-sm backdrop-blur">
            Firebase isn&apos;t configured yet, so sign-in and tracking are
            disabled. See the README to connect a project.
          </div>
        )}
      </div>

      {!selected && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
          <p className="rounded-full border border-border bg-card/95 px-4 py-2 text-center text-sm text-muted shadow-sm backdrop-blur">
            Click a pin to see the stadium
            {user ? " and mark it visited" : ""}.
          </p>
        </div>
      )}

      {selected && (
        <aside className="absolute inset-x-0 bottom-0 z-10 h-[60%] border-t border-border shadow-xl md:inset-y-0 md:left-auto md:right-0 md:h-full md:w-96 md:border-l md:border-t-0">
          <StadiumDetail
            key={selected.id}
            stadium={selected}
            visit={visits[selected.id]}
            canEdit={!!user}
            onClose={() => setSelected(null)}
            onSave={handleSave}
            onRemove={handleRemove}
          />
        </aside>
      )}
    </div>
  );
}
