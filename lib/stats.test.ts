import { describe, it, expect } from "vitest";
import {
  summarize,
  filterByLeague,
  shareSummary,
  visitsByYear,
  topOpponents,
  multiVisitedStadiums,
} from "./stats";
import { MLB_STADIUMS, NFL_STADIUMS, STADIUMS, getStadium } from "./stadiums";
import type { Visit } from "./types";

let seq = 0;
function visit(
  stadiumId: string,
  opts: { date?: string; opponent?: string } = {},
): Visit {
  seq += 1;
  return {
    id: `v${seq}`,
    stadiumId,
    league: "MLB",
    date: opts.date ?? "",
    opponent: opts.opponent ?? "",
    createdAt: 0,
    updatedAt: 0,
    buddyIds: [],
    friendUids: [],
  };
}

describe("summarize", () => {
  it("reports zero for an empty tracker", () => {
    const s = summarize([]);
    expect(s.total).toBe(0);
    expect(s.mlb).toBe(0);
    expect(s.nfl).toBe(0);
    expect(s.totalVisits).toBe(0);
    expect(s.percent).toBe(0);
    expect(s.mlbTotal).toBe(30);
    expect(s.nflTotal).toBe(32);
    expect(s.overallTotal).toBe(62);
  });

  it("counts DISTINCT stadiums by league using the stadium's true league", () => {
    // Note: classifies by stadium id, not the (possibly stale) visit.league.
    const visits = [
      visit("mlb-yankees"),
      visit("mlb-redsox"),
      visit("nfl-jets"),
    ];
    const s = summarize(visits);
    expect(s.mlb).toBe(2);
    expect(s.nfl).toBe(1);
    expect(s.total).toBe(3);
    expect(s.totalVisits).toBe(3);
  });

  it("counts a stadium once no matter how many times it was visited", () => {
    const visits = [
      visit("mlb-yankees"),
      visit("mlb-yankees"),
      visit("mlb-yankees"),
      visit("nfl-jets"),
    ];
    const s = summarize(visits);
    expect(s.mlb).toBe(1); // one distinct MLB stadium
    expect(s.nfl).toBe(1);
    expect(s.total).toBe(2); // two distinct stadiums
    expect(s.totalVisits).toBe(4); // four raw visits
  });

  it("ignores unknown stadium ids", () => {
    const s = summarize([visit("mlb-yankees"), visit("bogus-id")]);
    expect(s.total).toBe(1);
    expect(s.mlb).toBe(1);
  });

  it("computes an integer completion percentage of all 62", () => {
    const half = STADIUMS.slice(0, 31).map((st) => visit(st.id));
    expect(summarize(half).percent).toBe(50);
  });

  it("reaches 100% when every stadium is visited", () => {
    const s = summarize(STADIUMS.map((st) => visit(st.id)));
    expect(s.total).toBe(62);
    expect(s.percent).toBe(100);
  });
});

describe("filterByLeague", () => {
  it("returns everything for ALL", () => {
    expect(filterByLeague(STADIUMS, "ALL")).toHaveLength(62);
  });

  it("filters to a single league", () => {
    expect(filterByLeague(STADIUMS, "MLB")).toHaveLength(MLB_STADIUMS.length);
    expect(filterByLeague(STADIUMS, "NFL")).toHaveLength(NFL_STADIUMS.length);
    expect(
      filterByLeague(STADIUMS, "MLB").every((s) => s.league === "MLB"),
    ).toBe(true);
  });

  it("does not mutate the input array", () => {
    const input = [...STADIUMS];
    filterByLeague(input, "MLB");
    expect(input).toHaveLength(62);
  });
});

describe("shareSummary", () => {
  it("summarizes a non-empty tracker in one line", () => {
    const visits = [visit("mlb-yankees"), visit("nfl-jets"), visit("nfl-rams")];
    expect(shareSummary("Alex", visits)).toBe(
      "Alex has visited 3 of 62 stadiums — 1 MLB, 2 NFL (5%).",
    );
  });

  it("has a friendly empty-state message", () => {
    expect(shareSummary("Alex", [])).toBe(
      "Alex hasn't visited any stadiums yet.",
    );
  });
});

describe("visitsByYear", () => {
  it("returns empty array for no visits", () => {
    expect(visitsByYear([])).toEqual([]);
  });

  it("returns empty array when all visits have no date", () => {
    const visits = [
      visit("mlb-yankees"),
      visit("mlb-redsox"),
    ];
    expect(visitsByYear(visits)).toEqual([]);
  });

  it("groups visits by year and returns most recent first", () => {
    const visits = [
      visit("mlb-yankees", { date: "2023-04-01" }),
      visit("mlb-redsox", { date: "2023-07-15" }),
      visit("nfl-jets", { date: "2024-09-10" }),
      visit("mlb-mets", { date: "2022-06-20" }),
    ];
    const result = visitsByYear(visits);
    expect(result).toEqual([
      { year: "2024", count: 1 },
      { year: "2023", count: 2 },
      { year: "2022", count: 1 },
    ]);
  });

  it("skips visits with an empty date but counts those with dates", () => {
    const visits = [
      visit("mlb-yankees", { date: "2023-05-01" }),
      visit("mlb-redsox"), // no date — skipped
    ];
    const result = visitsByYear(visits);
    expect(result).toEqual([{ year: "2023", count: 1 }]);
  });

  it("handles a single visit", () => {
    const result = visitsByYear([visit("mlb-yankees", { date: "2021-03-30" })]);
    expect(result).toEqual([{ year: "2021", count: 1 }]);
  });
});

describe("topOpponents", () => {
  it("returns empty array for no visits", () => {
    expect(topOpponents([])).toEqual([]);
  });

  it("skips visits with an empty opponent", () => {
    const visits = [
      visit("mlb-yankees"), // opponent ""
      visit("mlb-yankees"), // opponent ""
    ];
    expect(topOpponents(visits)).toEqual([]);
  });

  it("groups by opponent and sorts by count descending", () => {
    const visits = [
      visit("mlb-yankees", { opponent: "Boston Red Sox" }),
      visit("mlb-yankees", { opponent: "Boston Red Sox" }),
      visit("mlb-yankees", { opponent: "Toronto Blue Jays" }),
      visit("mlb-mets", { opponent: "Philadelphia Phillies" }),
    ];
    const result = topOpponents(visits);
    expect(result[0]).toEqual({ opponent: "Boston Red Sox", count: 2 });
    expect(result).toHaveLength(3);
  });

  it("breaks ties alphabetically", () => {
    const visits = [
      visit("mlb-yankees", { opponent: "Zebra Team" }),
      visit("mlb-yankees", { opponent: "Alpha Team" }),
    ];
    const result = topOpponents(visits);
    expect(result[0].opponent).toBe("Alpha Team");
    expect(result[1].opponent).toBe("Zebra Team");
  });

  it("limits to the specified number", () => {
    const opponents = ["A", "B", "C", "D", "E", "F"];
    const visits = opponents.map((o) =>
      visit("mlb-yankees", { opponent: o }),
    );
    expect(topOpponents(visits, 3)).toHaveLength(3);
  });

  it("defaults to a limit of 10", () => {
    const opponents = Array.from({ length: 15 }, (_, i) => `Team ${i}`);
    const visits = opponents.map((o) =>
      visit("mlb-yankees", { opponent: o }),
    );
    expect(topOpponents(visits)).toHaveLength(10);
  });
});

describe("multiVisitedStadiums", () => {
  it("returns empty array for no visits", () => {
    expect(multiVisitedStadiums([])).toEqual([]);
  });

  it("returns empty array when no stadium is visited more than once", () => {
    const visits = [
      visit("mlb-yankees"),
      visit("mlb-redsox"),
      visit("nfl-jets"),
    ];
    expect(multiVisitedStadiums(visits)).toEqual([]);
  });

  it("includes stadiums visited more than once with the correct count", () => {
    const visits = [
      visit("mlb-yankees"),
      visit("mlb-yankees"),
      visit("mlb-yankees"),
      visit("mlb-redsox"),
      visit("mlb-redsox"),
      visit("nfl-jets"),
    ];
    const result = multiVisitedStadiums(visits);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      stadium: getStadium("mlb-yankees"),
      visitCount: 3,
    });
    expect(result[1]).toEqual({
      stadium: getStadium("mlb-redsox"),
      visitCount: 2,
    });
  });

  it("skips unknown stadium ids", () => {
    const visits = [
      visit("mlb-yankees"),
      visit("mlb-yankees"),
      visit("bogus-id"),
      visit("bogus-id"),
    ];
    const result = multiVisitedStadiums(visits);
    expect(result).toHaveLength(1);
    expect(result[0].stadium.id).toBe("mlb-yankees");
  });

  it("sorts by visit count descending, then alphabetically by name on ties", () => {
    const visits = [
      visit("nfl-jets"),
      visit("nfl-jets"),
      visit("mlb-yankees"),
      visit("mlb-yankees"),
    ];
    const result = multiVisitedStadiums(visits);
    // Both have count 2 — sort by stadium name alphabetically
    expect(result[0].stadium.name.localeCompare(result[1].stadium.name)).toBeLessThan(1);
  });
});
