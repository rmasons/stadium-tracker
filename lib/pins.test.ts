import { describe, it, expect } from "vitest";
import { distanceKm, computePinOffsets } from "./pins";
import { getStadium } from "./stadiums";

function coord(id: string) {
  const s = getStadium(id);
  if (!s) throw new Error(`no stadium ${id}`);
  return { lat: s.lat, lng: s.lng };
}

describe("distanceKm", () => {
  it("is ~0 for the same point", () => {
    expect(distanceKm(coord("mlb-yankees"), coord("mlb-yankees"))).toBeLessThan(
      0.001,
    );
  });

  it("matches a known short distance (Tigers <-> Lions ~0.3km)", () => {
    const d = distanceKm(coord("mlb-tigers"), coord("nfl-lions"));
    expect(d).toBeGreaterThan(0.1);
    expect(d).toBeLessThan(1);
  });
});

describe("computePinOffsets", () => {
  const offsets = computePinOffsets({ thresholdKm: 5, radiusPx: 12 });

  it("returns an offset for every stadium", () => {
    // 62 stadiums all present.
    expect(offsets.size).toBe(62);
  });

  it("leaves an isolated stadium unshifted", () => {
    // Green Bay's Lambeau Field has no other venue within 5km.
    expect(offsets.get("nfl-packers")).toEqual([0, 0]);
  });

  it("fans co-located teams apart with distinct, non-zero offsets", () => {
    const tigers = offsets.get("mlb-tigers")!;
    const lions = offsets.get("nfl-lions")!;
    expect(tigers).not.toEqual([0, 0]);
    expect(lions).not.toEqual([0, 0]);
    expect(tigers).not.toEqual(lions);
  });

  it("spreads each fanned pin about the requested radius from center", () => {
    const [dx, dy] = offsets.get("mlb-tigers")!;
    const mag = Math.hypot(dx, dy);
    expect(mag).toBeGreaterThan(8);
    expect(mag).toBeLessThan(16);
  });
});
