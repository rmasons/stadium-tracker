"use client";

import { useEffect, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Map as MapboxMap } from "mapbox-gl";
import { STADIUMS, LEAGUE_COLORS } from "@/lib/stadiums";
import type { Stadium } from "@/lib/types";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface Props {
  visitedIds: Set<string>;
  selectedId: string | null;
  onSelect: (stadium: Stadium) => void;
}

export function StadiumMap({ visitedIds, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<Record<string, HTMLElement>>({});
  // Latest onSelect without re-running the (expensive) init effect.
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  });

  // Initialize the map + markers once.
  useEffect(() => {
    if (!MAPBOX_TOKEN || !containerRef.current) return;
    let cancelled = false;
    let map: MapboxMap | undefined;

    void (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      if (cancelled || !containerRef.current) return;

      mapboxgl.accessToken = MAPBOX_TOKEN;
      map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [-96, 44], // frames the continental US + southern Canada
        zoom: 3.4,
        minZoom: 2,
        maxZoom: 14,
      });
      map.addControl(
        new mapboxgl.NavigationControl({ showCompass: false }),
        "top-right",
      );
      mapRef.current = map;

      for (const stadium of STADIUMS) {
        const el = document.createElement("div");
        el.className = "stadium-marker";
        el.style.background = LEAGUE_COLORS[stadium.league];
        el.title = `${stadium.team} — ${stadium.name}`;
        el.addEventListener("click", (event) => {
          event.stopPropagation();
          onSelectRef.current(stadium);
        });
        new mapboxgl.Marker({ element: el })
          .setLngLat([stadium.lng, stadium.lat])
          .addTo(map);
        markersRef.current[stadium.id] = el;
      }
    })();

    return () => {
      cancelled = true;
      markersRef.current = {};
      if (map) map.remove();
      mapRef.current = null;
    };
  }, []);

  // Reflect visited / selected state onto marker classes.
  useEffect(() => {
    for (const stadium of STADIUMS) {
      const el = markersRef.current[stadium.id];
      if (!el) continue;
      el.classList.toggle("stadium-marker--visited", visitedIds.has(stadium.id));
      el.classList.toggle("stadium-marker--selected", selectedId === stadium.id);
    }
  }, [visitedIds, selectedId]);

  // Ease to a stadium when it becomes selected.
  useEffect(() => {
    if (!selectedId) return;
    const map = mapRef.current;
    const stadium = STADIUMS.find((s) => s.id === selectedId);
    if (map && stadium) {
      map.easeTo({ center: [stadium.lng, stadium.lat], duration: 600 });
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
