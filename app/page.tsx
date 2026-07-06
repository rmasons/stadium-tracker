"use client";

import { useEffect, useMemo, useState } from "react";
import { LayoutB } from "@/components/redesign/LayoutB";
import { useAuth } from "@/components/AuthProvider";
import { subscribeToVisits, addVisit, removeVisit } from "@/lib/visits";
import { summarize } from "@/lib/stats";
import type { League, Stadium, Visit } from "@/lib/types";

type LeagueFilter = League | "ALL";

export default function HomePage() {
  const { user, configured } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [selected, setSelected] = useState<Stadium | null>(null);
  const [leagueFilter, setLeagueFilter] = useState<LeagueFilter>("ALL");

  useEffect(() => {
    if (!user) {
      // Clear another user's data on sign-out. Intentional reset on dependency
      // change, not a render-time cascade.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisits([]);
      return;
    }
    return subscribeToVisits(user.uid, setVisits);
  }, [user]);

  const summary = useMemo(() => summarize(visits), [visits]);
  const visitedIds = useMemo(
    () => new Set(visits.map((v) => v.stadiumId)),
    [visits],
  );
  const selectedVisits = useMemo(
    () => (selected ? visits.filter((v) => v.stadiumId === selected.id) : []),
    [visits, selected],
  );

  async function handleAdd(input: { date: string; opponent: string }) {
    if (!user || !selected) return;
    await addVisit(user.uid, { stadiumId: selected.id, ...input });
  }

  async function handleRemove(visitId: string) {
    if (!user) return;
    await removeVisit(user.uid, visitId);
  }

  const shared = {
    summary,
    selected,
    onSelect: setSelected,
    leagueFilter,
    onFilterChange: setLeagueFilter,
    selectedVisits,
    canEdit: !!user,
    onAdd: handleAdd,
    onRemove: handleRemove,
  };

  return (
    <div className="relative flex flex-1 flex-col min-h-0 overflow-hidden">
      {!configured && (
        <div className="pointer-events-none absolute left-4 top-4 z-30 max-w-xs rounded-lg border border-border bg-card/95 px-3 py-2 text-xs text-muted shadow-sm backdrop-blur md:left-[356px]">
          Firebase isn&apos;t configured yet, so sign-in and tracking are
          disabled. See the README to connect a project.
        </div>
      )}
      <LayoutB {...shared} visitedIds={visitedIds} />
    </div>
  );
}
