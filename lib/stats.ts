// Pure aggregation helpers over a user's visits. No React, no Firebase — just
// data in, numbers/strings out, so they're fully unit-tested.

import { MLB_STADIUMS, NFL_STADIUMS, STADIUMS, getStadium } from "./stadiums";
import type { League, Stadium, Visit } from "./types";

export interface Summary {
  /** DISTINCT MLB stadiums visited. */
  mlb: number;
  /** DISTINCT NFL stadiums visited. */
  nfl: number;
  /** DISTINCT stadiums visited (drives completion). */
  total: number;
  /** Raw number of visit records, including repeat visits. */
  totalVisits: number;
  /** Total MLB stadiums in existence (30). */
  mlbTotal: number;
  /** Total NFL stadiums in existence (32). */
  nflTotal: number;
  /** Total stadiums in existence (62). */
  overallTotal: number;
  /** Completion of all stadiums, 0–100, rounded to an integer. */
  percent: number;
}

/** Aggregate a list of visits into per-league counts and completion. Repeat
 *  visits to the same stadium count once toward completion, but every visit is
 *  reflected in `totalVisits`. */
export function summarize(visits: Visit[]): Summary {
  const mlbStadiums = new Set<string>();
  const nflStadiums = new Set<string>();
  let totalVisits = 0;
  for (const v of visits) {
    // Classify by the stadium's true league, not the visit's stored league.
    const stadium = getStadium(v.stadiumId);
    if (!stadium) continue;
    totalVisits++;
    if (stadium.league === "MLB") mlbStadiums.add(stadium.id);
    else nflStadiums.add(stadium.id);
  }
  const mlb = mlbStadiums.size;
  const nfl = nflStadiums.size;
  const total = mlb + nfl;
  const overallTotal = STADIUMS.length;
  return {
    mlb,
    nfl,
    total,
    totalVisits,
    mlbTotal: MLB_STADIUMS.length,
    nflTotal: NFL_STADIUMS.length,
    overallTotal,
    percent: overallTotal === 0 ? 0 : Math.round((total / overallTotal) * 100),
  };
}

/** Filter a list of stadiums by league; "ALL" returns a copy of everything. */
export function filterByLeague(
  stadiums: Stadium[],
  league: League | "ALL",
): Stadium[] {
  if (league === "ALL") return [...stadiums];
  return stadiums.filter((s) => s.league === league);
}

/** Visits grouped by calendar year, most recent first. Visits with no date
 *  recorded are skipped. */
export function visitsByYear(
  visits: Visit[],
): { year: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const v of visits) {
    if (!v.date) continue;
    const year = v.date.slice(0, 4);
    if (!year) continue;
    counts[year] = (counts[year] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => b.year.localeCompare(a.year));
}

/** Top N opponents by visit count. Visits with an empty opponent are skipped.
 *  Ties are broken alphabetically. */
export function topOpponents(
  visits: Visit[],
  limit = 10,
): { opponent: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const v of visits) {
    if (!v.opponent) continue;
    counts[v.opponent] = (counts[v.opponent] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([opponent, count]) => ({ opponent, count }))
    .sort((a, b) => b.count - a.count || a.opponent.localeCompare(b.opponent))
    .slice(0, limit);
}

/** Stadiums visited more than once, sorted by visit count descending.
 *  Ties are broken alphabetically by stadium name. */
export function multiVisitedStadiums(
  visits: Visit[],
): { stadium: Stadium; visitCount: number }[] {
  const counts: Record<string, number> = {};
  for (const v of visits) {
    const stadium = getStadium(v.stadiumId);
    if (!stadium) continue;
    counts[stadium.id] = (counts[stadium.id] ?? 0) + 1;
  }
  return Object.entries(counts)
    .filter(([, count]) => count > 1)
    .map(([id, visitCount]) => ({ stadium: getStadium(id)!, visitCount }))
    .sort(
      (a, b) =>
        b.visitCount - a.visitCount ||
        a.stadium.name.localeCompare(b.stadium.name),
    );
}

/** A one-line, human-readable summary for sharing. */
export function shareSummary(displayName: string, visits: Visit[]): string {
  const s = summarize(visits);
  if (s.total === 0) {
    return `${displayName} hasn't visited any stadiums yet.`;
  }
  return `${displayName} has visited ${s.total} of ${s.overallTotal} stadiums — ${s.mlb} MLB, ${s.nfl} NFL (${s.percent}%).`;
}
