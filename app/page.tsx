"use client";

import { useEffect, useMemo, useState } from "react";
import { LayoutB } from "@/components/redesign/LayoutB";
import { useAuth } from "@/components/AuthProvider";
import { subscribeToVisits, addVisit, removeVisit, updateVisit } from "@/lib/visits";
import { subscribeToBuddies } from "@/lib/buddies";
import { otherMember, pendingIncomingCount, subscribeToFriendships } from "@/lib/friends";
import { getProfile } from "@/lib/username";
import { summarize } from "@/lib/stats";
import type {
  Buddy,
  Friendship,
  FriendProfile,
  League,
  PublicProfile,
  Stadium,
  Visit,
} from "@/lib/types";

type LeagueFilter = League | "ALL";

interface VisitInput {
  date: string;
  opponent: string;
  buddyIds: string[];
  friendUids: string[];
}

export default function HomePage() {
  const { user, configured } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [selected, setSelected] = useState<Stadium | null>(null);
  const [leagueFilter, setLeagueFilter] = useState<LeagueFilter>("ALL");
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  // uid -> profile (null = fetched but missing, e.g. deleted account).
  const [friendProfiles, setFriendProfiles] = useState<
    Record<string, PublicProfile | null>
  >({});

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

  // Resolve accepted friends' public profiles, lazily and cached for the life
  // of the component. Mirrors FriendManager's profile-resolution effect.
  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFriendProfiles({});
      return;
    }
    let cancelled = false;
    const uid = user.uid;
    const unknown = friendships
      .filter((f) => f.status === "accepted")
      .map((f) => otherMember(f, uid))
      .filter((other) => !(other in friendProfiles));
    if (unknown.length === 0) return;
    void Promise.all(
      unknown.map(async (other) => [other, await getProfile(other)] as const),
    ).then((entries) => {
      if (cancelled) return;
      setFriendProfiles((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
    });
    return () => {
      cancelled = true;
    };
    // `friendProfiles` is deliberately omitted: it's the cache this effect
    // fills, and re-running on its own writes would just re-diff to empty.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendships, user]);

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
  const friends = useMemo<FriendProfile[]>(() => {
    if (!user) return [];
    const uid = user.uid;
    return friendships
      .filter((f) => f.status === "accepted")
      .map((f) => otherMember(f, uid))
      .map((other) => {
        const profile = friendProfiles[other];
        return profile ? { uid: other, ...profile } : null;
      })
      .filter((f): f is FriendProfile => f !== null);
  }, [user, friendships, friendProfiles]);

  async function handleAdd(input: VisitInput) {
    if (!user || !selected) return;
    await addVisit(user.uid, { stadiumId: selected.id, ...input });
  }

  async function handleRemove(visitId: string) {
    if (!user) return;
    await removeVisit(user.uid, visitId);
  }

  async function handleUpdate(visitId: string, input: VisitInput) {
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
