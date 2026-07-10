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
  /** Refs to users/{uid}/buddies/{buddyId} tagged as attendees. Defaults to []. */
  buddyIds?: string[];
  /** UIDs of friends tagged as attendees. Defaults to []. */
  friendUids?: string[];
}

/** The visit fields the add/edit forms collect (everything but stadiumId,
 *  which the form's context supplies). Shared by the add/edit form components
 *  so their prop signatures stay in lockstep with VisitInput. */
export type VisitFormInput = Required<Omit<VisitInput, "stadiumId">>;

/** Map a Firestore doc into a Visit, attaching its id. Fills defaults for
 *  older docs written before buddies/friends existed. */
function toVisit(id: string, data: VisitData): Visit {
  return {
    id,
    ...data,
    buddyIds: data.buddyIds ?? [],
    friendUids: data.friendUids ?? [],
  };
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
    buddyIds: input.buddyIds ?? [],
    friendUids: input.friendUids ?? [],
  };
  const ref = await addDoc(collection(db, "users", uid, "visits"), data);
  return ref.id;
}

/** Update the date/opponent (and optionally attendees) of an existing visit. */
export async function updateVisit(
  uid: string,
  visitId: string,
  patch: Omit<VisitInput, "stadiumId">,
): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured.");
  const update: Record<string, unknown> = {
    date: patch.date,
    opponent: patch.opponent.trim(),
    updatedAt: Date.now(),
  };
  if (patch.buddyIds !== undefined) update.buddyIds = patch.buddyIds;
  if (patch.friendUids !== undefined) update.friendUids = patch.friendUids;
  await updateDoc(doc(db, "users", uid, "visits", visitId), update);
}

/** Remove a single visit by its id. */
export async function removeVisit(uid: string, visitId: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured.");
  await deleteDoc(doc(db, "users", uid, "visits", visitId));
}
