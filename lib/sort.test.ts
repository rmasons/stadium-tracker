import { describe, it, expect } from "vitest";
import { toRows, sortRows } from "./sort";
import type { Visit } from "./types";

let seq = 0;
function visit(stadiumId: string, date = "", opponent = ""): Visit {
  seq += 1;
  return {
    id: `v${seq}`,
    stadiumId,
    league: "MLB",
    date,
    opponent,
    createdAt: 0,
    updatedAt: 0,
  };
}

describe("toRows", () => {
  it("expands visits into display rows with stadium metadata", () => {
    const rows = toRows([visit("mlb-yankees", "2024-05-01", "Red Sox")]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      team: "New York Yankees",
      league: "MLB",
      name: "Yankee Stadium",
      city: "Bronx, NY",
      date: "2024-05-01",
    });
  });

  it("drops visits whose stadium id is unknown", () => {
    expect(toRows([visit("ghost-stadium")])).toHaveLength(0);
  });

  it("produces one row per visit, so repeat visits appear separately", () => {
    const a = visit("mlb-yankees", "2024-05-01");
    const b = visit("mlb-yankees", "2023-08-12");
    const rows = toRows([a, b]);
    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.visit.id)).toEqual([a.id, b.id]);
    expect(new Set(rows.map((r) => r.team))).toEqual(
      new Set(["New York Yankees"]),
    );
  });
});

describe("sortRows", () => {
  const rows = toRows([
    visit("mlb-yankees", "2024-05-01"), // team: New York Yankees
    visit("mlb-braves", "2023-04-10"), // team: Atlanta Braves
    visit("nfl-jets", ""), // no date
  ]);

  it("sorts by team ascending and descending", () => {
    const asc = sortRows(rows, "team", true).map((r) => r.team);
    expect(asc).toEqual([
      "Atlanta Braves",
      "New York Jets",
      "New York Yankees",
    ]);
    const desc = sortRows(rows, "team", false).map((r) => r.team);
    expect(desc).toEqual([
      "New York Yankees",
      "New York Jets",
      "Atlanta Braves",
    ]);
  });

  it("always sorts empty dates to the bottom, both directions", () => {
    const asc = sortRows(rows, "date", true);
    const desc = sortRows(rows, "date", false);
    expect(asc[asc.length - 1].date).toBe("");
    expect(desc[desc.length - 1].date).toBe("");
    // Newest-first on descending among the dated rows.
    expect(desc[0].date).toBe("2024-05-01");
    // Oldest-first on ascending among the dated rows.
    expect(asc[0].date).toBe("2023-04-10");
  });

  it("does not mutate the input array", () => {
    const before = rows.map((r) => r.team);
    sortRows(rows, "team", false);
    expect(rows.map((r) => r.team)).toEqual(before);
  });
});
