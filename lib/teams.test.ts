import { describe, it, expect } from "vitest";
import { getBrand, TEAM_BRANDS, logoPath } from "./teams";
import { MLB_STADIUMS, NFL_STADIUMS, STADIUMS } from "./stadiums";

describe("team brands", () => {
  it("has a brand for every stadium and no extras", () => {
    expect(Object.keys(TEAM_BRANDS)).toHaveLength(STADIUMS.length);
    for (const s of STADIUMS) {
      const brand = getBrand(s.id);
      expect(brand, s.id).toBeDefined();
    }
  });

  it("uses 2-4 uppercase-letter/number abbreviations", () => {
    for (const s of STADIUMS) {
      expect(getBrand(s.id).abbr, s.id).toMatch(/^[A-Z0-9]{2,4}$/);
    }
  });

  it("keeps abbreviations unique within each league", () => {
    for (const group of [MLB_STADIUMS, NFL_STADIUMS]) {
      const abbrs = group.map((s) => getBrand(s.id).abbr);
      expect(new Set(abbrs).size, "duplicate abbr in league").toBe(abbrs.length);
    }
  });

  it("gives every team a valid hex color", () => {
    for (const s of STADIUMS) {
      expect(getBrand(s.id).color, s.id).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("derives a logo path from the stadium id", () => {
    expect(logoPath("mlb-yankees")).toBe("/logos/mlb-yankees.png");
  });
});
