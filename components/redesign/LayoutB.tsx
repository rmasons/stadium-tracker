"use client";

import { useRef, useState } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import { StadiumMap, INITIAL_CENTER, INITIAL_ZOOM } from "@/components/StadiumMap";
import { MapDetailPanel } from "@/components/MapDetailPanel";
import { SidebarB } from "./SidebarB";
import { ZoomControls } from "./ZoomControls";
import type { League, Stadium, Visit } from "@/lib/types";
import type { Summary } from "@/lib/stats";

// Show the "reset view" control once zoomed meaningfully past the initial
// continental-US framing (small margin so it doesn't flicker right at load).
const ZOOMED_IN_THRESHOLD = INITIAL_ZOOM + 0.5;

interface Props {
  summary: Summary;
  visitedIds: Set<string>;
  selected: Stadium | null;
  onSelect: (stadium: Stadium | null) => void;
  leagueFilter: League | "ALL";
  onFilterChange: (next: League | "ALL") => void;
  selectedVisits: Visit[];
  canEdit: boolean;
  onAdd: (input: { date: string; opponent: string }) => Promise<void>;
  onRemove: (visitId: string) => Promise<void>;
}

/** Option 1B — sidebar + map split (see design_handoff_redesign). */
export function LayoutB({
  summary,
  visitedIds,
  selected,
  onSelect,
  leagueFilter,
  onFilterChange,
  selectedVisits,
  canEdit,
  onAdd,
  onRemove,
}: Props) {
  const mapRef = useRef<MapboxMap | null>(null);
  const [zoomedIn, setZoomedIn] = useState(false);

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <SidebarB
        summary={summary}
        filter={leagueFilter}
        onFilterChange={onFilterChange}
        visitedIds={visitedIds}
        selectedId={selected?.id ?? null}
        onSelectStadium={onSelect}
      />

      <div style={{ position: "relative", flex: 1 }}>
        <StadiumMap
          selectedId={selected?.id ?? null}
          leagueFilter={leagueFilter}
          onSelect={onSelect}
          showNavControl={false}
          hideSelectedLabel
          onMapReady={(map) => {
            mapRef.current = map;
            map.on("zoom", () => {
              setZoomedIn(map.getZoom() > ZOOMED_IN_THRESHOLD);
            });
          }}
        />

        <ZoomControls
          onZoomIn={() => mapRef.current?.zoomIn()}
          onZoomOut={() => mapRef.current?.zoomOut()}
        />

        {zoomedIn && (
          <button
            onClick={() => {
              mapRef.current?.easeTo({
                center: INITIAL_CENTER,
                zoom: INITIAL_ZOOM,
                duration: 600,
              });
              onSelect(null);
            }}
            aria-label="Reset map view"
            title="Reset map view"
            style={{
              position: "absolute",
              top: 104,
              right: 20,
              zIndex: 10,
              width: 34,
              height: 34,
              background: "#fff",
              borderRadius: 9,
              boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              color: "oklch(30% 0.01 90)",
              cursor: "pointer",
            }}
          >
            ⟲
          </button>
        )}

        <div
          className={`${selected ? "block" : "hidden"} md:block`}
          style={{ position: "absolute", left: 20, right: 20, bottom: 20, zIndex: 10 }}
        >
          <MapDetailPanel
            stadium={selected}
            visits={selectedVisits}
            canEdit={canEdit}
            onClose={() => onSelect(null)}
            onAdd={onAdd}
            onRemove={onRemove}
            emptyHint="Select a stadium to see its details."
          />
        </div>
      </div>
    </div>
  );
}
