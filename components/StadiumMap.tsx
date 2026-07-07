"use client";

import { useEffect, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Map as MapboxMap, Marker as MapboxMarker } from "mapbox-gl";
import { STADIUMS } from "@/lib/stadiums";
import { getLogoUrl } from "@/lib/logos";
import { computePinOffsets, metroGroups, centroid } from "@/lib/pins";
import type { League, Stadium } from "@/lib/types";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Placeholder camera for the constructor — immediately replaced by a
// fitBounds() to MAX_BOUNDS once the container's real size is known (see
// the resizeObserver below), so this value doesn't need to be accurate.
export const INITIAL_CENTER: [number, number] = [-96, 44];
export const INITIAL_ZOOM = 3.4;

// Below this zoom, a co-located metro group (NYC, LA, Miami, Bay Area, ...)
// collapses into a single count badge instead of overlapping dots. Chosen so
// a 30km-radius group is comfortably separated in screen pixels once expanded.
const CLUSTER_MAX_ZOOM = 7.5;

// The box the initial view and "reset view" button frame to (derived from
// the stadium data, not hand-picked, so it stays correct if a stadium is
// added outside the current footprint). Generous degree padding so the edge
// stadiums aren't framed right at the viewport's edge. This is no longer
// passed to Mapbox's `maxBounds` (panning is unrestricted) — that combination
// was what caused the map to zoom/recenter onto a bogus location (e.g.
// Manitoba) on load, since maxBounds forcibly clamps the camera to never
// reveal area outside the box, independent of what fitBounds/easeTo asked for.
const BOUNDS_PADDING_DEG = 6;
const STADIUM_LATS = STADIUMS.map((s) => s.lat);
const STADIUM_LNGS = STADIUMS.map((s) => s.lng);
export const MAX_BOUNDS: [[number, number], [number, number]] = [
  [Math.min(...STADIUM_LNGS) - BOUNDS_PADDING_DEG, Math.min(...STADIUM_LATS) - BOUNDS_PADDING_DEG],
  [Math.max(...STADIUM_LNGS) + BOUNDS_PADDING_DEG, Math.max(...STADIUM_LATS) + BOUNDS_PADDING_DEG],
];
// Padding (px) so the outermost stadiums aren't pinned right at the edge
// of the viewport when framed via fitBounds.
export const BOUNDS_FIT_PADDING = 24;

// The bottom detail drawer (MapDetailPanel) floats over the map, so a plain
// `center` would put a selected stadium right behind it. Bias `easeTo`'s
// visual center upward by this much screen space so the pin lands above the
// drawer — matters most on short/wide (desktop) viewports, where a fixed-px
// drawer eats a much bigger share of map height than on a tall phone screen.
const DETAIL_PANEL_CLEARANCE = { top: 0, bottom: 160, left: 0, right: 0 };

// Constant screen-pixel offsets that fan co-located pins apart (computed once).
const PIN_OFFSETS = computePinOffsets();
// Metro groups of 2+ stadiums that are candidates for a cluster badge.
const METRO_GROUPS = metroGroups();

interface Props {
  selectedId: string | null;
  leagueFilter: League | "ALL";
  onSelect: (stadium: Stadium) => void;
  /** 1B supplies its own restyled zoom buttons instead of Mapbox's default. */
  showNavControl?: boolean;
  /** 1B shows selection state in its sidebar list, not a map label pill. */
  hideSelectedLabel?: boolean;
  /** Lets a parent (e.g. 1B's custom zoom buttons) drive the map instance. */
  onMapReady?: (map: MapboxMap) => void;
}

export function StadiumMap({
  selectedId,
  leagueFilter,
  onSelect,
  showNavControl = true,
  hideSelectedLabel = false,
  onMapReady,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<Record<string, HTMLElement>>({});
  const markerInstancesRef = useRef<Record<string, MapboxMarker>>({});
  const clusterMarkersRef = useRef<Record<string, HTMLElement>>({});
  // Latest callback/prop values without re-running the (expensive) init effect.
  const onSelectRef = useRef(onSelect);
  const leagueFilterRef = useRef(leagueFilter);
  useEffect(() => {
    onSelectRef.current = onSelect;
    leagueFilterRef.current = leagueFilter;
  });

  // Show a metro's cluster badge (and hide its members) when the map is
  // zoomed out too far to tell the members apart, or vice versa. Re-derives
  // the cluster count from the currently-visible (post league-filter) members.
  const refreshClusters = useRef(() => {
    const map = mapRef.current;
    const zoom = map?.getZoom() ?? 0;
    const expanded = zoom >= CLUSTER_MAX_ZOOM;
    const filter = leagueFilterRef.current;

    // Base pass: every stadium's marker visibility follows the league filter.
    for (const stadium of STADIUMS) {
      const el = markersRef.current[stadium.id];
      if (!el) continue;
      const inFilter = filter === "ALL" || stadium.league === filter;
      el.style.display = inFilter ? "" : "none";
    }

    // Metro groups override that base pass: collapse into a cluster badge
    // (hiding the individual members) when zoomed out and 2+ members pass
    // the filter.
    for (const group of METRO_GROUPS) {
      const visibleMembers = group.filter(
        (s) => filter === "ALL" || s.league === filter,
      );
      const showCluster = !expanded && visibleMembers.length > 1;

      const clusterEl = clusterMarkersRef.current[group[0].id];
      if (clusterEl) {
        clusterEl.style.display = showCluster ? "flex" : "none";
        const countEl = clusterEl.querySelector<HTMLElement>(".pin__count");
        if (countEl) countEl.textContent = String(visibleMembers.length);
      }
      if (showCluster) {
        for (const stadium of group) {
          const el = markersRef.current[stadium.id];
          if (el) el.style.display = "none";
        }
      }
    }
  });

  // Initialize the map + markers once.
  useEffect(() => {
    if (!MAPBOX_TOKEN || !containerRef.current) return;
    let cancelled = false;
    let map: MapboxMap | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let mqCleanup: (() => void) | undefined;

    void (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      if (cancelled || !containerRef.current) return;

      mapboxgl.accessToken = MAPBOX_TOKEN;
      const mq = window.matchMedia("(prefers-color-scheme: light)");
      const mapStyle = (light: boolean) =>
        light ? "mapbox://styles/mapbox/light-v11" : "mapbox://styles/mapbox/dark-v11";
      map = new mapboxgl.Map({
        container: containerRef.current,
        style: mapStyle(mq.matches),
        center: INITIAL_CENTER,
        zoom: INITIAL_ZOOM,
        minZoom: 2,
        maxZoom: 14,
      });

      // The container's final flex-resolved size (sidebar + map sharing a
      // row) can settle a tick after this runs, leaving the map's canvas
      // sized for a stale layout — it renders blank until some interaction
      // (e.g. a trackpad pan) forces Mapbox to recompute. Keep it in sync
      // with the container's actual size for the life of the map, and the
      // first time we see a real (non-zero) size, frame the initial view by
      // fitting to MAX_BOUNDS (so the zoom is always correct for whatever
      // this container's actual aspect ratio is).
      let boundsApplied = false;
      resizeObserver = new ResizeObserver((entries) => {
        map?.resize();
        const { width, height } = entries[0].contentRect;
        if (!boundsApplied && width > 0 && height > 0) {
          boundsApplied = true;
          map?.fitBounds(MAX_BOUNDS, { padding: BOUNDS_FIT_PADDING, duration: 0 });
        }
      });
      resizeObserver.observe(containerRef.current);

      if (showNavControl) {
        map.addControl(
          new mapboxgl.NavigationControl({ showCompass: false }),
          "top-right",
        );
      }
      mapRef.current = map;
      onMapReady?.(map);

      for (const stadium of STADIUMS) {
        const el = document.createElement("div");
        el.className = "pin";
        el.dataset.league = stadium.league;
        el.title = `${stadium.team} — ${stadium.name}`;

        // Teardrop body — carries the clip-path and league color.
        // Kept separate from .pin so tooltip/label sit outside the clip boundary.
        const body = document.createElement("div");
        body.className = "pin__body";

        // White circle inside the body, holds the team logo.
        const head = document.createElement("div");
        head.className = "pin__head";
        const logoUrl = getLogoUrl(stadium.id);
        if (logoUrl) {
          const img = document.createElement("img");
          img.src = logoUrl;
          img.alt = "";
          img.className = "pin__logo";
          head.appendChild(img);
        }
        body.appendChild(head);
        el.appendChild(body);

        const tip = document.createElement("span");
        tip.className = "pin__tip";
        tip.textContent = stadium.name;
        el.appendChild(tip);

        if (!hideSelectedLabel) {
          const label = document.createElement("span");
          label.className = "pin__label";
          label.textContent = stadium.name;
          el.appendChild(label);
        }

        el.addEventListener("click", (event) => {
          event.stopPropagation();
          onSelectRef.current(stadium);
        });

        const [dx, dy] = PIN_OFFSETS.get(stadium.id) ?? [0, 0];
        // anchor:'bottom' puts the tail tip at the lat/lng coordinate.
        const marker = new mapboxgl.Marker({ element: el, anchor: "bottom", offset: [dx, dy] })
          .setLngLat([stadium.lng, stadium.lat])
          .addTo(map);
        markersRef.current[stadium.id] = el;
        markerInstancesRef.current[stadium.id] = marker;
      }

      for (const group of METRO_GROUPS) {
        const el = document.createElement("div");
        el.className = "pin pin--cluster";
        el.title = group.map((s) => s.name).join(", ");

        const count = document.createElement("span");
        count.className = "pin__count";
        el.appendChild(count);

        const { lat, lng } = centroid(group);
        el.addEventListener("click", (event) => {
          event.stopPropagation();
          mapRef.current?.easeTo({
            center: [lng, lat],
            zoom: CLUSTER_MAX_ZOOM + 1.2,
            padding: DETAIL_PANEL_CLEARANCE,
            duration: 500,
          });
        });

        new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
        clusterMarkersRef.current[group[0].id] = el;
      }

      refreshClusters.current();
      map.on("zoom", refreshClusters.current);

      const onThemeChange = (e: MediaQueryListEvent) => {
        map?.setStyle(mapStyle(e.matches));
      };

      mq.addEventListener("change", onThemeChange);
      mqCleanup = () => mq.removeEventListener("change", onThemeChange);
    })();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      mqCleanup?.();
      markersRef.current = {};
      markerInstancesRef.current = {};
      clusterMarkersRef.current = {};
      if (map) map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflect selection + the league filter onto markers and cluster badges.
  useEffect(() => {
    const useOffsets = leagueFilter === "ALL";
    for (const stadium of STADIUMS) {
      const el = markersRef.current[stadium.id];
      if (!el) continue;
      el.classList.toggle("pin--selected", selectedId === stadium.id);
      // Remove metro offsets when a single league is active so pins land
      // exactly over their stadiums instead of fanned out for mixed-league groups.
      const marker = markerInstancesRef.current[stadium.id];
      if (marker) {
        const [dx, dy] = useOffsets ? (PIN_OFFSETS.get(stadium.id) ?? [0, 0]) : [0, 0];
        marker.setOffset([dx, dy]);
      }
    }
    refreshClusters.current();
  }, [selectedId, leagueFilter]);

  // Ease to a stadium when it becomes selected, breaking its cluster apart
  // (zooming in) if it was collapsed into a metro badge.
  useEffect(() => {
    if (!selectedId) return;
    const map = mapRef.current;
    const stadium = STADIUMS.find((s) => s.id === selectedId);
    if (map && stadium) {
      const zoom = map.getZoom();
      map.easeTo({
        center: [stadium.lng, stadium.lat],
        zoom: Math.max(zoom, 11),
        padding: DETAIL_PANEL_CLEARANCE,
        duration: 600,
      });
    }
  }, [selectedId]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div className="max-w-md">
          <p className="font-medium">Map unavailable</p>
          <p className="mt-2 text-sm text-muted">
            Set <code className="rounded bg-border px-1">NEXT_PUBLIC_MAPBOX_TOKEN</code>{" "}
            in your environment to enable the interactive map. See the README for
            setup steps.
          </p>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full" />;
}
