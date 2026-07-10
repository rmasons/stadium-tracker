"use client";

import { useEffect, useMemo, useState } from "react";
import { LayoutB } from "@/components/redesign/LayoutB";
import { useAuth } from "@/components/AuthProvider";
import { subscribeToVisits, addVisit, removeVisit, updateVisit } from "@/lib/visits";
import type { VisitFormInput } from "@/lib/visits";
import { subscribeToBuddies } from "@/lib/buddies";
import { pendingIncomingCount, subscribeToFriendships } from "@/lib/friends";
import { useFriendProfiles } from "@/lib/useFriendProfiles";
import { summarize } from "@/lib/stats";
import type { Buddy, Friendship, League, Stadium, Visit } from "@/lib/types";

type LeagueFilter = League | "ALL";

export default function HomePage() {
  const { user, configured } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [selected, setSelected] = useState<Stadium | null>(null);
  const [leagueFilter, setLeagueFilter] = useState<LeagueFilter>("ALL");
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [buddies, setBuddies] = useState<Buddy[]>([]);

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

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFriendships([]);
      return;
    }
    return subscribeToFriendships(user.uid, setFriendships);
  }, [user]);

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBuddies([]);
      return;
    }
    return subscribeToBuddies(user.uid, setBuddies);
  }, [user]);

  const { friends } = useFriendProfiles(user?.uid, friendships);

  const summary = useMemo(() => summarize(visits), [visits]);
  const visitedIds = useMemo(
    () => new Set(visits.map((v) => v.stadiumId)),
    [visits],
  );
  const selectedVisits = useMemo(
    () => (selected ? visits.filter((v) => v.stadiumId === selected.id) : []),
    [visits, selected],
  );
  const pendingFriendCount = useMemo(
    () => (user ? pendingIncomingCount(user.uid, friendships) : 0),
    [user, friendships],
  );

  async function handleAdd(input: VisitFormInput) {
    if (!user || !selected) return;
    await addVisit(user.uid, { stadiumId: selected.id, ...input });
  }

  async function handleRemove(visitId: string) {
    if (!user) return;
    await removeVisit(user.uid, visitId);
  }

  async function handleUpdate(visitId: string, input: VisitFormInput) {
    if (!user) return;
    await updateVisit(user.uid, visitId, input);
  }

  const shared = {
    summary,
    selected,
    onSelect: setSelected,
    leagueFilter,
    onFilterChange: setLeagueFilter,
    selectedVisits,
    canEdit: !!user,
    buddies,
    friends,
    onAdd: handleAdd,
    onRemove: handleRemove,
    onUpdate: handleUpdate,
  };

  return (
    <div className="relative flex flex-1 flex-col min-h-0 overflow-hidden">
      {!configured && (
        <div className="pointer-events-none absolute left-4 top-4 z-30 max-w-xs rounded-lg border border-border bg-card/95 px-3 py-2 text-xs text-muted shadow-sm backdrop-blur md:left-[356px]">
          Firebase isn&apos;t configured yet, so sign-in and tracking are
          disabled. See the README to connect a project.
        </div>
      )}
      <LayoutB
        {...shared}
        visitedIds={visitedIds}
        pendingFriendCount={pendingFriendCount}
      />
    </div>
  );
}
