// Declutter co-located map pins. Stadiums in the same metro (e.g. Detroit's
// Comerica Park + Ford Field, ~0.3 km apart) overlap into a single dot at a
// country-level zoom, hiding one behind the other. We group stadiums that sit
// within a small distance and fan the group's pins apart by a constant SCREEN
// pixel offset — so both stay visible and clickable at every zoom, while the
// tiny offset is negligible once you zoom in and real distance takes over.

import { STADIUMS } from "./stadiums";
import type { Stadium } from "./types";

export interface LatLng {
  lat: number;
  lng: number;
}

/** Great-circle distance in kilometers (haversine). */
export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Single-linkage grouping: stadiums linked when within thresholdKm. */
export function groupStadiums(
  stadiums: Stadium[],
  thresholdKm: number,
): Stadium[][] {
  const parent = stadiums.map((_, i) => i);
  const find = (i: number): number =>
    parent[i] === i ? i : (parent[i] = find(parent[i]));
  const union = (i: number, j: number) => {
    parent[find(i)] = find(j);
  };

  for (let i = 0; i < stadiums.length; i++) {
    for (let j = i + 1; j < stadiums.length; j++) {
      if (distanceKm(stadiums[i], stadiums[j]) <= thresholdKm) union(i, j);
    }
  }

  const groups = new Map<number, Stadium[]>();
  stadiums.forEach((s, i) => {
    const root = find(i);
    const g = groups.get(root) ?? [];
    g.push(s);
    groups.set(root, g);
  });
  return [...groups.values()];
}

export interface PinOffsetOptions {
  /** Group stadiums within this many km. */
  thresholdKm?: number;
  /** Radius (px) of the ring the fanned pins are placed on. */
  radiusPx?: number;
}

/**
 * Map every stadium id to a [dx, dy] pixel offset for its map marker. Isolated
 * stadiums get [0, 0]; members of a co-located group are spread evenly around a
 * small circle so none is hidden. Deterministic (ordered by the input list).
 */
export function computePinOffsets(
  opts: PinOffsetOptions = {},
): Map<string, [number, number]> {
  const thresholdKm = opts.thresholdKm ?? 30;
  const radiusPx = opts.radiusPx ?? 13;
  const result = new Map<string, [number, number]>();

  for (const group of groupStadiums(STADIUMS, thresholdKm)) {
    if (group.length === 1) {
      result.set(group[0].id, [0, 0]);
      continue;
    }
    // Stable order within the group so offsets don't shuffle between runs.
    const ordered = [...group].sort((a, b) => a.id.localeCompare(b.id));
    ordered.forEach((s, i) => {
      const angle = (2 * Math.PI * i) / ordered.length;
      const dx = Math.round(Math.cos(angle) * radiusPx);
      // Screen y grows downward; negate so index 0 sits toward the top.
      const dy = Math.round(-Math.sin(angle) * radiusPx);
      result.set(s.id, [dx, dy]);
    });
  }
  return result;
}

/** Mean lat/lng of a group of stadiums — where a cluster marker is placed. */
export function centroid(stadiums: Stadium[]): LatLng {
  const lat = stadiums.reduce((sum, s) => sum + s.lat, 0) / stadiums.length;
  const lng = stadiums.reduce((sum, s) => sum + s.lng, 0) / stadiums.length;
  return { lat, lng };
}

/** Co-located metro groups with 2+ stadiums — the candidates for a single
 *  cluster marker when the map is zoomed out too far to tell them apart. */
export function metroGroups(thresholdKm = 30): Stadium[][] {
  return groupStadiums(STADIUMS, thresholdKm).filter((g) => g.length > 1);
}
