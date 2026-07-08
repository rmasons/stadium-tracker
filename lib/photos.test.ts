import { describe, it, expect } from "vitest";
import { STADIUMS } from "./stadiums";
import { getPhotoUrl } from "./photos";

describe("stadium photo coverage", () => {
  it("has a photo URL for every stadium", () => {
    for (const s of STADIUMS) {
      expect(getPhotoUrl(s.id), s.team).toBeDefined();
    }
  });

  it("only serves https Wikimedia thumbnail URLs", () => {
    for (const s of STADIUMS) {
      expect(getPhotoUrl(s.id), s.team).toMatch(
        /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/thumb\//,
      );
    }
  });

  it("returns undefined for an unknown stadium id", () => {
    expect(getPhotoUrl("mlb-expos")).toBeUndefined();
  });
});
