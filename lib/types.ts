// Shared domain types for the stadium tracker.

export type League = "MLB" | "NFL";

export interface Stadium {
  /** Stable, URL-safe id, e.g. "mlb-yankees" or "nfl-rams". Keyed on TEAM (not
   *  venue) so the two teams that share a stadium each get their own record. */
  id: string;
  /** Venue name, e.g. "Yankee Stadium". */
  name: string;
  /** Full team name, e.g. "New York Yankees". */
  team: string;
  city: string;
  /** State / province abbreviation, e.g. "NY" or "ON". */
  state: string;
  league: League;
  lat: number;
  lng: number;
}

/** The stored fields of a visit (the Firestore document data). A stadium can
 *  have any number of visits — each is its own auto-id document. */
export interface VisitData {
  stadiumId: string;
  league: League;
  /** ISO date string (YYYY-MM-DD) of the visit. Optional — a user may log a
   *  visit without remembering the exact date. */
  date: string;
  /** Opposing team the user saw play, free text. Optional. */
  opponent: string;
  /** Millis since epoch when the visit was first logged. */
  createdAt: number;
  /** Millis since epoch of the last write. */
  updatedAt: number;
  /**
   * Privacy decision (explicit, because visits are `allow read: if true`):
   * these two fields live on the world-readable visit doc. `buddyIds` are
   * opaque refs into the owner-only `users/{uid}/buddies` subcollection, so
   * no personal data (buddy names) leaks even though the ids are public.
   * `friendUids` are real UIDs resolvable to public profiles, so storing
   * them here deliberately makes "who attended with whom" publicly
   * readable — acceptable since profiles are already public, but a one-way
   * door once real users have data (see the Phase 2 plan for the
   * owner-only-subcollection alternative if that ever needs to change).
   */
  /** Refs to users/{uid}/buddies/{buddyId} tagged as attendees. */
  buddyIds: string[];
  /** UIDs of friends (accepted friendship) tagged as attendees. */
  friendUids: string[];
}

/** A visit with its Firestore document id attached (as read back). */
export interface Visit extends VisitData {
  id: string;
}

/** The public profile stored at users/{uid}. Deliberately PII-free — this doc
 *  is world-readable so share pages work, so it must NOT contain email. */
export interface PublicProfile {
  username: string;
  displayName: string;
  photoURL: string;
}

export type FriendshipStatus = "pending" | "accepted";

/** The stored fields of a friendship (the Firestore document data). One doc
 *  per pair at friendships/{pairId} where pairId = sorted UIDs joined by "_" —
 *  a pending doc is a friend request, an accepted doc is a friendship. */
export interface FriendshipData {
  /** Both members' UIDs, sorted ascending (enforced by rules). */
  members: [string, string];
  /** UID of the request sender; only the OTHER member may accept. */
  requestedBy: string;
  status: FriendshipStatus;
  /** Millis since epoch when the request was sent. */
  createdAt: number;
  /** Millis since epoch of the last write (send or accept). */
  updatedAt: number;
}

/** A friendship with its Firestore document id (the pairId) attached. */
export interface Friendship extends FriendshipData {
  id: string;
}

/** A friend's public profile plus their uid, for display in friend lists. */
export interface FriendProfile extends PublicProfile {
  uid: string;
}

/** The stored fields of a buddy (the Firestore document data). Buddies are
 *  named companions stored at users/{uid}/buddies/{buddyId} — strictly
 *  private to the owner (no world read, unlike profiles/visits). A buddy
 *  needs no account of their own; the name is personal data the owner
 *  chooses to record, so it must never appear on a world-readable doc. */
export interface BuddyData {
  name: string;
  /** Millis since epoch when the buddy was added. */
  createdAt: number;
}

/** A buddy with its Firestore document id attached. */
export interface Buddy extends BuddyData {
  id: string;
}
