import { describe, it, expect } from "vitest";
import { summarize, filterByLeague, shareSummary } from "./stats";
import { MLB_STADIUMS, NFL_STADIUMS, STADIUMS } from "./stadiums";
import type { Visit } from "./types";

let seq = 0;
function visit(stadiumId: string): Visit {
  seq += 1;
  return {
    id: `v${seq}`,
    stadiumId,
    league: "MLB",
    date: "",
    opponent: "",
    createdAt: 0,
    updatedAt: 0,
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
