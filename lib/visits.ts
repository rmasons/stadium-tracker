// Firestore data layer for stadium visits. Each visit is its own auto-id
// document at users/{uid}/visits/{visitId}, so a stadium can have many visits.

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { getDb } from "./firebase";
import { getStadium } from "./stadiums";
import type { Visit, VisitData } from "./types";

export interface VisitInput {
  stadiumId: string;
  /** ISO date (YYYY-MM-DD) or "" if unknown. */
  date: string;
  opponent: string;
}

/** Map a Firestore doc into a Visit, attaching its id. */
function toVisit(id: string, data: VisitData): Visit {
  return { id, ...data };
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
    (snap) => onData(snap.docs.map((d) => toVisit(d.id, d.data() as VisitData))),
    (err) => onError?.(err),
  );
}

/** One-shot read of a user's visits (used by the public share page). */
export async function getVisits(uid: string): Promise<Visit[]> {
  const db = getDb();
  if (!db) return [];
  const snap = await getDocs(collection(db, "users", uid, "visits"));
  return snap.docs.map((d) => toVisit(d.id, d.data() as VisitData));
}

/** Log a new visit to a stadium. Returns the new visit's id. */
export async function addVisit(uid: string, input: VisitInput): Promise<string> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured.");
  const stadium = getStadium(input.stadiumId);
  if (!stadium) throw new Error(`Unknown stadium: ${input.stadiumId}`);

  const now = Date.now();
  const data: VisitData = {
    stadiumId: input.stadiumId,
    league: stadium.league,
    date: input.date,
    opponent: input.opponent.trim(),
    createdAt: now,
    updatedAt: now,
  };
  const ref = await addDoc(collection(db, "users", uid, "visits"), data);
  return ref.id;
}

/** Update the date/opponent of an existing visit. */
export async function updateVisit(
  uid: string,
  visitId: string,
  patch: { date: string; opponent: string },
): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured.");
  await updateDoc(doc(db, "users", uid, "visits", visitId), {
    date: patch.date,
    opponent: patch.opponent.trim(),
    updatedAt: Date.now(),
  });
}

/** Remove a single visit by its id. */
export async function removeVisit(uid: string, visitId: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured.");
  await deleteDoc(doc(db, "users", uid, "visits", visitId));
}
