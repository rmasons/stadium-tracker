import type { Stadium } from "@/lib/types";

export function StadiumListRow({
  stadium,
  visited,
  selected,
  onClick,
}: {
  stadium: Stadium;
  visited: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  const color = stadium.league === "MLB" ? "var(--mlb)" : "var(--nfl)";
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 10px",
        borderRadius: 10,
        background: selected ? "oklch(97% 0.008 250)" : "transparent",
        opacity: visited ? 1 : 0.45,
        border: "none",
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      <span
        style={{
          width: 9,
          height: 9,
          borderRadius: 999,
          flexShrink: 0,
          background: visited ? color : "transparent",
          border: visited ? "none" : `2px solid ${color}`,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 700,
            color: "oklch(20% 0.01 90)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {stadium.name}
        </div>
        <div
          style={{
            fontSize: 11.5,
            color: "oklch(50% 0.01 90)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {stadium.team} · {visited ? "visited" : "not yet"}
        </div>
      </div>
    </button>
  );
}
