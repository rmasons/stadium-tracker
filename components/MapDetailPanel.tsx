"use client";

import { useState, type CSSProperties } from "react";
import { StadiumDetail } from "./StadiumDetail";
import type { Stadium, Visit } from "@/lib/types";

interface Props {
  stadium: Stadium | null;
  visits: Visit[];
  canEdit: boolean;
  onClose: () => void;
  onAdd: (input: { date: string; opponent: string }) => Promise<void>;
  onRemove: (visitId: string) => Promise<void>;
  onUpdate: (visitId: string, input: { date: string; opponent: string }) => Promise<void>;
  emptyHint?: string;
}

const CARD_BASE: CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  boxShadow: "0 -8px 30px rgba(0,0,0,0.1)",
  border: "1px solid oklch(92% 0.005 95)",
};

/**
 * The bottom-of-map "detail drawer" from the redesign, shared by 1A (full
 * width, floats over the whole map) and 1B (floats over just the map's flex
 * area, next to the sidebar). Shows a compact summary with an Edit/"I've been
 * here" affordance that expands into the existing StadiumDetail form — this
 * keeps the add/remove-visit flow reachable without changing StadiumDetail's
 * own always-expanded contract (and its tests).
 */
export function MapDetailPanel({
  stadium,
  visits,
  canEdit,
  onClose,
  onAdd,
  onRemove,
  onUpdate,
  emptyHint = "Click a pin to see the stadium.",
}: Props) {
  // Keyed on the stadium so `editing` resets whenever the selection changes.
  return (
    <PanelBody
      key={stadium?.id ?? "empty"}
      stadium={stadium}
      visits={visits}
      canEdit={canEdit}
      onClose={onClose}
      onAdd={onAdd}
      onRemove={onRemove}
      onUpdate={onUpdate}
      emptyHint={emptyHint}
    />
  );
}

function PanelBody({
  stadium,
  visits,
  canEdit,
  onClose,
  onAdd,
  onRemove,
  onUpdate,
  emptyHint,
}: Props & { emptyHint: string }) {
  const [editing, setEditing] = useState(false);

  if (!stadium) {
    return (
      <div style={{ ...CARD_BASE, padding: "18px 22px", textAlign: "center" }}>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 600,
            color: "oklch(50% 0.01 90)",
          }}
        >
          {emptyHint}
        </p>
      </div>
    );
  }

  if (editing) {
    return (
      <div style={{ ...CARD_BASE, maxHeight: "70vh", overflowY: "auto" }}>
        <StadiumDetail
          stadium={stadium}
          visits={visits}
          canEdit={canEdit}
          onClose={() => setEditing(false)}
          onAdd={onAdd}
          onRemove={onRemove}
          onUpdate={onUpdate}
        />
      </div>
    );
  }

  const ordered = [...visits].sort((a, b) => b.createdAt - a.createdAt);
  const latest = ordered[0] as Visit | undefined;

  let meta: string;
  if (latest) {
    meta = `Visited ${latest.date || "date unknown"}${
      latest.opponent ? ` · vs. ${latest.opponent}` : ""
    }`;
  } else if (canEdit) {
    meta = "Not visited yet";
  } else {
    meta = "Sign in with Google to log a visit.";
  }

  return (
    <div
      style={{
        ...CARD_BASE,
        padding: "18px 22px",
        display: "flex",
        alignItems: "center",
        gap: 18,
        position: "relative",
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 24,
          height: 24,
          border: "none",
          background: "transparent",
          color: "oklch(60% 0.01 90)",
          cursor: "pointer",
          borderRadius: 6,
        }}
      >
        ✕
      </button>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 12,
          flexShrink: 0,
          background:
            "repeating-linear-gradient(45deg, oklch(93% 0.005 95), oklch(93% 0.005 95) 6px, oklch(96% 0.004 95) 6px, oklch(96% 0.004 95) 12px)",
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: "oklch(18% 0.01 90)" }}>
          {stadium.name}{" "}
          <span
            style={{ fontWeight: 600, color: "oklch(50% 0.01 90)", fontSize: 13 }}
          >
            — {stadium.team}
          </span>
        </div>
        <div style={{ fontSize: 13, color: "oklch(48% 0.01 90)", marginTop: 2 }}>
          {meta}
        </div>
      </div>
      {canEdit && (
        <button
          onClick={() => setEditing(true)}
          style={{
            background: "oklch(96% 0.005 95)",
            border: "none",
            color: "oklch(30% 0.01 90)",
            fontWeight: 700,
            fontSize: 13,
            padding: "9px 14px",
            borderRadius: 9,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {latest ? "Edit" : "I've been here"}
        </button>
      )}
    </div>
  );
}
