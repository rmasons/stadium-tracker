"use client";

// Shared profile-resolution logic for friendships, used by both /tracker
// (app/page.tsx, for the accepted-friends attendee list) and the Friends card
// (components/FriendManager.tsx, which additionally needs names for
// pending/sent requests). Extracted here so the fetch-and-cache logic (and
// its failure handling) lives in exactly one place.

import { useEffect, useMemo, useRef, useState } from "react";
import { otherMember } from "@/lib/friends";
import { getProfile } from "@/lib/username";
import type { Friendship, FriendProfile, PublicProfile } from "@/lib/types";

export interface UseFriendProfilesResult {
  /** uid -> profile. `null` means fetched but the account is missing (e.g.
   *  deleted). A uid absent from this map has either never been requested or
   *  its last fetch failed transiently — either way it's still a candidate
   *  for (re)fetching. */
  profiles: Record<string, PublicProfile | null>;
  /** Accepted friendships whose profile has resolved, as uid + profile. */
  friends: FriendProfile[];
}

/**
 * Resolve the public profiles of everyone `uid` has a friendship doc with —
 * pending, sent, or accepted — lazily and cached for the life of the hook.
 * All statuses are fetched (not just accepted) because FriendManager displays
 * names for incoming/sent requests too; `friends` below narrows to accepted.
 */
export function useFriendProfiles(
  uid: string | null | undefined,
  friendships: Friendship[],
): UseFriendProfilesResult {
  const [profiles, setProfiles] = useState<Record<string, PublicProfile | null>>(
    {},
  );
  // uids already fetched (or currently in flight), so re-runs of the effect
  // below don't re-request them. A ref (not state) so the fetch effect's
  // dependency array can stay honest — it never needs `profiles` itself.
  const requestedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // A new signed-in uid (including signing out, uid -> null/undefined)
    // starts a fresh cache: a previous uid's fetch results and in-flight set
    // don't apply to this one.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfiles({});
    requestedRef.current = new Set();
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    const unknown = friendships
      .map((f) => otherMember(f, uid))
      .filter((other) => !requestedRef.current.has(other));
    if (unknown.length === 0) return;
    // Mark as requested up front (synchronously, before the awaits below) so
    // a second effect run triggered before these resolve — e.g. another
    // friendships snapshot arriving in quick succession — doesn't re-request
    // the same uids.
    for (const other of unknown) requestedRef.current.add(other);

    void Promise.all(
      unknown.map(async (other) => {
        try {
          return [other, await getProfile(other)] as const;
        } catch {
          // Transient failure (e.g. offline): un-mark it so a later
          // friendships change retries it. Deliberately NOT cached as
          // `null` — that means "fetched, no such account," which this
          // isn't.
          requestedRef.current.delete(other);
          return null;
        }
      }),
    ).then((entries) => {
      const resolved = entries.filter(
        (e): e is readonly [string, PublicProfile | null] => e !== null,
      );
      if (resolved.length === 0) return;
      // Functional update so this merges in even if a newer effect run has
      // already started (or finished) — merging is idempotent because
      // `unknown` above skips anything already in `requestedRef`, so there's
      // nothing to discard by "cancelling" a superseded run.
      setProfiles((prev) => ({ ...prev, ...Object.fromEntries(resolved) }));
    });
  }, [uid, friendships]);

  const friends = useMemo<FriendProfile[]>(() => {
    if (!uid) return [];
    return friendships
      .filter((f) => f.status === "accepted")
      .map((f) => otherMember(f, uid))
      .map((other) => {
        const profile = profiles[other];
        return profile ? { uid: other, ...profile } : null;
      })
      .filter((f): f is FriendProfile => f !== null);
  }, [uid, friendships, profiles]);

  return { profiles, friends };
}
