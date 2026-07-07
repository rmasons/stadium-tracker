import { getLogoUrl } from "@/lib/logos";
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
  const logoUrl = getLogoUrl(stadium.id);
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 10px",
        borderRadius: 10,
        background: selected ? "oklch(97% 0.008 250)" : "transparent",
        opacity: visited ? 1 : 0.4,
        border: "none",
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt=""
          aria-hidden
          style={{ width: 26, height: 26, objectFit: "contain", flexShrink: 0 }}
        />
      ) : (
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
      )}
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
