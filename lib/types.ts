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
