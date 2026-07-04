// Firestore data layer for stadium visits. A visit lives at
// users/{uid}/visits/{stadiumId} — one document per stadium.

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { getDb } from "./firebase";
import { getStadium } from "./stadiums";
import type { Visit } from "./types";

export interface VisitInput {
  stadiumId: string;
  /** ISO date (YYYY-MM-DD) or "" if unknown. */
  date: string;
  opponent: string;
}

/** Subscribe to a user's visits in real time. Returns an unsubscribe fn. */
export function subscribeToVisits(
  uid: string,
  onData: (visits: Visit[]) => void,
  onError?: (err: Error) => void,
): () => void {
  const db = getDb();
  if (!db) {
    onData([]);
    return () => {};
  }
  const col = collection(db, "users", uid, "visits");
  return onSnapshot(
    col,
    (snap) => onData(snap.docs.map((d) => d.data() as Visit)),
    (err) => onError?.(err),
  );
}

/** One-shot read of a user's visits (used by the public share page). */
export async function getVisits(uid: string): Promise<Visit[]> {
  const db = getDb();
  if (!db) return [];
  const snap = await getDocs(collection(db, "users", uid, "visits"));
  return snap.docs.map((d) => d.data() as Visit);
}

/** Create or update the visit record for a stadium. */
export async function saveVisit(uid: string, input: VisitInput): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured.");
  const stadium = getStadium(input.stadiumId);
  if (!stadium) throw new Error(`Unknown stadium: ${input.stadiumId}`);

  const visit: Visit = {
    stadiumId: input.stadiumId,
    league: stadium.league,
    date: input.date,
    opponent: input.opponent.trim(),
    updatedAt: Date.now(),
  };
  await setDoc(doc(db, "users", uid, "visits", input.stadiumId), visit);
}

/** Remove a visit record. */
export async function removeVisit(uid: string, stadiumId: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured.");
  await deleteDoc(doc(db, "users", uid, "visits", stadiumId));
}
