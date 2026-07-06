import { describe, it, expect } from "vitest";
import {
  MLB_STADIUMS,
  NFL_STADIUMS,
  STADIUMS,
  STADIUMS_BY_ID,
  getStadium,
  opponentsFor,
  LEAGUE_COLORS,
} from "./stadiums";

describe("stadium data integrity", () => {
  it("has exactly 30 MLB and 32 NFL teams (62 total)", () => {
    expect(MLB_STADIUMS).toHaveLength(30);
    expect(NFL_STADIUMS).toHaveLength(32);
    expect(STADIUMS).toHaveLength(62);
  });

  it("gives every stadium a unique id", () => {
    const ids = STADIUMS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses a league-prefixed, url-safe id that matches the league", () => {
    for (const s of STADIUMS) {
      expect(s.id).toMatch(/^(mlb|nfl)-[a-z0-9]+$/);
      expect(s.id.startsWith(s.league.toLowerCase())).toBe(true);
    }
  });

  it("places every stadium within US + Canada bounds", () => {
    for (const s of STADIUMS) {
      expect(s.lat, s.team).toBeGreaterThan(24);
      expect(s.lat, s.team).toBeLessThan(54);
      expect(s.lng, s.team).toBeGreaterThan(-125);
      expect(s.lng, s.team).toBeLessThan(-66);
    }
  });

  it("never puts two pins at the exact same coordinate", () => {
    // The two shared NFL venues (MetLife, SoFi) must be nudged apart so both
    // pins stay clickable — this guards that invariant.
    const coords = STADIUMS.map((s) => `${s.lat},${s.lng}`);
    expect(new Set(coords).size).toBe(STADIUMS.length);
  });

  it("has non-empty team, name, city, and state for every stadium", () => {
    for (const s of STADIUMS) {
      expect(s.team.length, s.id).toBeGreaterThan(0);
      expect(s.name.length, s.id).toBeGreaterThan(0);
      expect(s.city.length, s.id).toBeGreaterThan(0);
      expect(s.state.length, s.id).toBeGreaterThan(0);
    }
  });

  it("indexes and looks up stadiums by id", () => {
    expect(Object.keys(STADIUMS_BY_ID)).toHaveLength(62);
    expect(getStadium("mlb-yankees")?.team).toBe("New York Yankees");
    expect(getStadium("nfl-rams")?.name).toBe("SoFi Stadium");
    expect(getStadium("does-not-exist")).toBeUndefined();
  });

  it("defines a color for each league", () => {
    expect(LEAGUE_COLORS.MLB).toMatch(/^#[0-9a-f]{6}$/i);
    expect(LEAGUE_COLORS.NFL).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe("opponentsFor", () => {
  it("lists the other 29 MLB teams for an MLB stadium", () => {
    const yankees = getStadium("mlb-yankees")!;
    const opps = opponentsFor(yankees);
    expect(opps).toHaveLength(29);
    expect(opps).not.toContain("New York Yankees");
    expect(opps).toContain("Boston Red Sox");
  });

  it("lists the other 31 NFL teams for an NFL stadium", () => {
    const jets = getStadium("nfl-jets")!;
    const opps = opponentsFor(jets);
    expect(opps).toHaveLength(31);
    expect(opps).not.toContain("New York Jets");
    expect(opps).toContain("New York Giants");
  });

  it("only includes teams from the same league", () => {
    const yankees = getStadium("mlb-yankees")!;
    const mlbTeams = new Set(MLB_STADIUMS.map((s) => s.team));
    expect(opponentsFor(yankees).every((t) => mlbTeams.has(t))).toBe(true);
  });

  it("returns the opponents sorted alphabetically", () => {
    const opps = opponentsFor(getStadium("mlb-yankees")!);
    expect(opps).toEqual([...opps].sort());
  });
});
