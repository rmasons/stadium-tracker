// Firestore data layer for buddies. A buddy is a named companion stored at
// users/{uid}/buddies/{buddyId} — strictly private to the owner (no world
// read, unlike profiles/visits: a buddy's name is personal data the owner
// chooses to record, and needs no account or consent of its own). Buddies
// are tagged as attendees on visits by their opaque id (see VisitData).

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { getDb } from "./firebase";
import type { Buddy, BuddyData } from "./types";

/** Subscribe to a user's buddies in real time, sorted by name. Returns an
 *  unsubscribe fn. */
export function subscribeToBuddies(
  uid: string,
  onData: (buddies: Buddy[]) => void,
  onError?: (err: Error) => void,
): () => void {
  const db = getDb();
  if (!db) {
    onData([]);
    return () => {};
  }
  const col = collection(db, "users", uid, "buddies");
  return onSnapshot(
    col,
    (snap) => {
      const buddies = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as BuddyData),
      }));
      buddies.sort((a, b) => a.name.localeCompare(b.name));
      onData(buddies);
    },
    (err) => onError?.(err),
  );
}

/** Add a new buddy. Trims the name and throws a user-readable Error if it's
 *  empty. Returns the new buddy's id. */
export async function addBuddy(uid: string, name: string): Promise<string> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured.");
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Buddy name can't be empty.");

  const data: BuddyData = { name: trimmed, createdAt: Date.now() };
  const ref = await addDoc(collection(db, "users", uid, "buddies"), data);
  return ref.id;
}

/** Rename an existing buddy. Trims the name and throws a user-readable Error
 *  if it's empty. */
export async function renameBuddy(
  uid: string,
  buddyId: string,
  name: string,
): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured.");
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Buddy name can't be empty.");

  await updateDoc(doc(db, "users", uid, "buddies", buddyId), {
    name: trimmed,
  });
}

/** Remove a buddy by id. */
export async function removeBuddy(uid: string, buddyId: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured.");
  await deleteDoc(doc(db, "users", uid, "buddies", buddyId));
}
