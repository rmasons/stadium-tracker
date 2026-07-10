// Firestore data layer for friendships. One document per pair lives at
// friendships/{pairId} (pairId = sorted UIDs joined by "_"), so the same doc
// is the friend request (status "pending") and the friendship (status
// "accepted") — there is exactly one source of truth per pair and no mirrored
// docs to keep in sync. Security rules enforce the sorted-members/pairId
// invariants and the pending→accepted transition.

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { getDb } from "./firebase";
import { getUidByUsername } from "./username";
import type { Friendship, FriendshipData } from "./types";

/** Canonical friendships/{pairId} document id for two UIDs, in either order. */
export function pairId(a: string, b: string): string {
  return [a, b].sort().join("_");
}

/** The other member of a friendship, from one member's point of view. */
export function otherMember(friendship: FriendshipData, uid: string): string {
  return friendship.members[0] === uid
    ? friendship.members[1]
    : friendship.members[0];
}

/** Count of INCOMING pending requests (sent by someone else, awaiting uid). */
export function pendingIncomingCount(
  uid: string,
  friendships: FriendshipData[],
): number {
  return friendships.filter(
    (f) => f.status === "pending" && f.requestedBy !== uid,
  ).length;
}

/** Subscribe to every friendship (pending and accepted) the user is part of.
 *  Returns an unsubscribe fn. */
export function subscribeToFriendships(
  uid: string,
  onData: (friendships: Friendship[]) => void,
  onError?: (err: Error) => void,
): () => void {
  const db = getDb();
  if (!db) {
    onData([]);
    return () => {};
  }
  const q = query(
    collection(db, "friendships"),
    where("members", "array-contains", uid),
  );
  return onSnapshot(
    q,
    (snap) =>
      onData(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as FriendshipData) })),
      ),
    (err) => onError?.(err),
  );
}

/** Send a friend request by username. Throws a user-readable Error when the
 *  username is unknown, is the caller's own, or a friendship/request between
 *  the pair already exists. */
export async function sendFriendRequest(
  myUid: string,
  targetUsername: string,
): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured.");

  const targetUid = await getUidByUsername(targetUsername.trim());
  if (!targetUid) throw new Error("No user with that username.");
  if (targetUid === myUid) {
    throw new Error("You can't send a friend request to yourself.");
  }

  const ref = doc(db, "friendships", pairId(myUid, targetUid));
  const existing = await getDoc(ref);
  if (existing.exists()) {
    const { status } = existing.data() as FriendshipData;
    throw new Error(
      status === "accepted"
        ? "You're already friends."
        : "A friend request between you is already pending.",
    );
  }

  const now = Date.now();
  const data: FriendshipData = {
    members: [myUid, targetUid].sort() as [string, string],
    requestedBy: myUid,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };
  try {
    await setDoc(ref, data);
  } catch (err) {
    // Lost a race: the doc appeared between the existence check and the
    // write, so rules treated the setDoc as an (always denied) update.
    if (err instanceof FirebaseError && err.code === "permission-denied") {
      throw new Error("A friend request between you is already pending.");
    }
    throw err;
  }
}

/** Accept an incoming request. Rules restrict this to the non-requester. */
export async function acceptFriendRequest(friendshipId: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured.");
  await updateDoc(doc(db, "friendships", friendshipId), {
    status: "accepted",
    updatedAt: Date.now(),
  });
}

/** Delete a friendship doc: unfriend, decline (recipient), or cancel (sender). */
export async function removeFriend(friendshipId: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured.");
  await deleteDoc(doc(db, "friendships", friendshipId));
}
