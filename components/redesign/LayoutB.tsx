"use client";

import { useRef } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import { StadiumMap } from "@/components/StadiumMap";
import { MapDetailPanel } from "@/components/MapDetailPanel";
import { SidebarB } from "./SidebarB";
import { ZoomControls } from "./ZoomControls";
import type { League, Stadium, Visit } from "@/lib/types";
import type { Summary } from "@/lib/stats";

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
          }}
        />

        <ZoomControls
          onZoomIn={() => mapRef.current?.zoomIn()}
          onZoomOut={() => mapRef.current?.zoomOut()}
        />

        <div
          style={{ position: "absolute", left: 20, right: 20, bottom: 20, zIndex: 40 }}
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
