"use client";

import { useRef, useState } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import { StadiumMap, MAX_BOUNDS, BOUNDS_FIT_PADDING } from "@/components/StadiumMap";
import { MapDetailPanel } from "@/components/MapDetailPanel";
import { SidebarB } from "./SidebarB";
import { ZoomControls } from "./ZoomControls";
import type { Buddy, FriendProfile, League, Stadium, Visit } from "@/lib/types";
import type { Summary } from "@/lib/stats";
import type { VisitFormInput } from "@/lib/visits";

// Margin above the fitted-to-MAX_BOUNDS zoom before showing "reset view" —
// the fitted zoom itself varies with the container's aspect ratio (mobile
// portrait vs desktop landscape), so this is computed live via
// cameraForBounds rather than compared against a fixed constant.
const ZOOMED_IN_MARGIN = 0.5;

interface Props {
  summary: Summary;
  visitedIds: Set<string>;
  selected: Stadium | null;
  onSelect: (stadium: Stadium | null) => void;
  leagueFilter: League | "ALL";
  onFilterChange: (next: League | "ALL") => void;
  selectedVisits: Visit[];
  canEdit: boolean;
  buddies: Buddy[];
  friends: FriendProfile[];
  onAdd: (input: VisitFormInput) => Promise<void>;
  onRemove: (visitId: string) => Promise<void>;
  onUpdate: (visitId: string, input: VisitFormInput) => Promise<void>;
  pendingFriendCount?: number;
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
  buddies,
  friends,
  onAdd,
  onRemove,
  onUpdate,
  pendingFriendCount,
}: Props) {
  const mapRef = useRef<MapboxMap | null>(null);
  const [zoomedIn, setZoomedIn] = useState(false);

  return (
    <div className="flex flex-1 flex-col md:flex-row min-h-0">
      <SidebarB
        summary={summary}
        filter={leagueFilter}
        onFilterChange={onFilterChange}
        visitedIds={visitedIds}
        selectedId={selected?.id ?? null}
        onSelectStadium={onSelect}
        pendingFriendCount={pendingFriendCount}
      />

      <div style={{ position: "relative", flex: 1 }}>
        <StadiumMap
          selectedId={selected?.id ?? null}
          leagueFilter={leagueFilter}
          onSelect={onSelect}
          visitedIds={visitedIds}
          showNavControl={false}
          hideSelectedLabel
          onMapReady={(map) => {
            mapRef.current = map;
            map.on("zoom", () => {
              const fitted = map.cameraForBounds(MAX_BOUNDS, {
                padding: BOUNDS_FIT_PADDING,
              });
              const fittedZoom = fitted?.zoom;
              setZoomedIn(
                typeof fittedZoom === "number" &&
                  map.getZoom() > fittedZoom + ZOOMED_IN_MARGIN,
              );
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
              mapRef.current?.fitBounds(MAX_BOUNDS, {
                padding: BOUNDS_FIT_PADDING,
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
              background: "var(--card)",
              borderRadius: 9,
              boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              color: "var(--ink-medium)",
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
            buddies={buddies}
            friends={friends}
            onClose={() => onSelect(null)}
            onAdd={onAdd}
            onRemove={onRemove}
            onUpdate={onUpdate}
            emptyHint="Select a stadium to see its details."
          />
        </div>
      </div>
    </div>
  );
}
