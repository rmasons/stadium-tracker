// Pure helpers for turning visits into sortable display rows. Extracted from
// the VisitedList component so the sort semantics (notably "empty dates last")
// are unit-testable.

import { getStadium } from "./stadiums";
import type { League, Visit } from "./types";

export type SortKey = "team" | "league" | "name" | "city" | "date";

export interface VisitRow {
  visit: Visit;
  team: string;
  league: League;
  name: string;
  city: string;
  date: string;
}

/** Expand visits into display rows, dropping any with an unknown stadium id. */
export function toRows(visits: Visit[]): VisitRow[] {
  return visits.flatMap<VisitRow>((visit) => {
    const stadium = getStadium(visit.stadiumId);
    if (!stadium) return [];
    return [
      {
        visit,
        team: stadium.team,
        league: stadium.league,
        name: stadium.name,
        city: `${stadium.city}, ${stadium.state}`,
        date: visit.date,
      },
    ];
  });
}

/**
 * Return a new array sorted by `key`. `asc` controls direction, except that
 * rows with an empty date always sort to the bottom regardless of direction.
 */
export function sortRows(
  rows: VisitRow[],
  key: SortKey,
  asc: boolean,
): VisitRow[] {
  const dir = asc ? 1 : -1;
  return [...rows].sort((a, b) => {
    if (key === "date") {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
    }
    const av = a[key];
    const bv = b[key];
    return av < bv ? -1 * dir : av > bv ? 1 * dir : 0;
  });
}
