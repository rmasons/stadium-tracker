"use client";

import { useEffect, useMemo, useState } from "react";
import { StadiumMap } from "@/components/StadiumMap";
import { StadiumDetail } from "@/components/StadiumDetail";
import { useAuth } from "@/components/AuthProvider";
import { subscribeToVisits, saveVisit, removeVisit } from "@/lib/visits";
import { STADIUMS } from "@/lib/stadiums";
import type { Stadium, Visit } from "@/lib/types";

export default function HomePage() {
  const { user, configured } = useAuth();
  const [visits, setVisits] = useState<Record<string, Visit>>({});
  const [selected, setSelected] = useState<Stadium | null>(null);

  useEffect(() => {
    if (!user) {
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
        onSelect={setSelected}
      />

      {/* Legend + progress */}
      <div className="pointer-events-none absolute left-4 top-4 space-y-2">
        <div className="pointer-events-auto rounded-lg border border-border bg-card/95 px-3 py-2 text-sm shadow-sm backdrop-blur">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full bg-mlb" />
              MLB
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full bg-nfl" />
              NFL
            </span>
          </div>
          {user && (
            <p className="mt-1 text-xs text-muted">
              {visitedIds.size} of {STADIUMS.length} visited
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

      {selected && (
        <aside className="absolute inset-x-0 bottom-0 z-10 h-[60%] border-t border-border shadow-xl md:inset-y-0 md:left-auto md:right-0 md:h-full md:w-96 md:border-l md:border-t-0">
          <StadiumDetail
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
