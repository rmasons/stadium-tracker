// Username registry: unique, editable handles that power the share URL
// (/u/[username]). Uniqueness is enforced two ways — a dedicated
// `usernames/{username}` doc used as a lock, plus Firestore rules that only
// allow creating a username doc that does not already exist.

import { doc, getDoc, runTransaction } from "firebase/firestore";
import type { User } from "firebase/auth";
import { getDb } from "./firebase";
import { isValidUsername, MIN_USERNAME_LENGTH, slugify } from "./slug";
import type { PublicProfile } from "./types";

class UsernameTakenError extends Error {}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6);
}

function candidateFrom(user: User): string {
  const base = slugify(user.displayName || user.email?.split("@")[0] || "");
  return base.length >= 3 ? base : `fan${randomSuffix()}`;
}

/**
 * Ensure a public profile exists for the signed-in user, allocating a unique
 * username on first sign-in. Idempotent: returns the existing profile if one
 * is already present.
 */
export async function ensureUserProfile(user: User): Promise<PublicProfile> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured.");

  const userRef = doc(db, "users", user.uid);
  const existing = await getDoc(userRef);
  if (existing.exists()) {
    return existing.data() as PublicProfile;
  }

  const base = candidateFrom(user);
  for (let attempt = 0; attempt < 8; attempt++) {
    const uname = attempt === 0 ? base : `${base}${randomSuffix()}`;
    try {
      return await runTransaction(db, async (tx) => {
        const unameRef = doc(db, "usernames", uname);
        // Reads must precede writes in a transaction.
        const unameSnap = await tx.get(unameRef);
        if (unameSnap.exists()) throw new UsernameTakenError();
        const userSnap = await tx.get(userRef);
        if (userSnap.exists()) return userSnap.data() as PublicProfile;

        const profile: PublicProfile = {
          username: uname,
          displayName: user.displayName || uname,
          photoURL: user.photoURL || "",
        };
        tx.set(unameRef, { uid: user.uid });
        tx.set(userRef, profile);
        return profile;
      });
    } catch (err) {
      if (err instanceof UsernameTakenError) continue;
      throw err;
    }
  }
  throw new Error("Could not allocate a unique username. Please try again.");
}

/** Read a public profile by uid. */
export async function getProfile(uid: string): Promise<PublicProfile | null> {
  const db = getDb();
  if (!db) return null;
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as PublicProfile) : null;
}

/** Resolve a username to its owner's uid (for the share page). */
export async function getUidByUsername(username: string): Promise<string | null> {
  const db = getDb();
  if (!db) return null;
  const snap = await getDoc(doc(db, "usernames", username.toLowerCase()));
  return snap.exists() ? (snap.data().uid as string) : null;
}

/**
 * Change a user's username. Atomically claims the new handle, releases the old
 * one, and updates the profile. Throws if the new handle is taken or invalid.
 */
export async function setUsername(
  uid: string,
  current: string,
  next: string,
): Promise<string> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured.");

  const cleaned = slugify(next);
  if (!isValidUsername(cleaned)) {
    throw new Error(
      `Username must be at least ${MIN_USERNAME_LENGTH} letters or numbers.`,
    );
  }
  if (cleaned === current) return current;

  await runTransaction(db, async (tx) => {
    const nextRef = doc(db, "usernames", cleaned);
    const userRef = doc(db, "users", uid);
    // Reads first.
    const nextSnap = await tx.get(nextRef);
    if (nextSnap.exists()) throw new Error("That username is already taken.");
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists()) throw new Error("Profile not found.");
    // Then writes.
    tx.set(nextRef, { uid });
    if (current) tx.delete(doc(db, "usernames", current));
    tx.update(userRef, { username: cleaned });
  });

  return cleaned;
}
