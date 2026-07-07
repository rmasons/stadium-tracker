import { StatTile } from "@/components/redesign/StatTile";

export function MLB() {
  return (
    <div style={{ width: 160 }}>
      <StatTile value={14} total={30} label="MLB" color="var(--mlb)" />
    </div>
  );
}

export function NFL() {
  return (
    <div style={{ width: 160 }}>
      <StatTile value={9} total={32} label="NFL" color="var(--nfl)" />
    </div>
  );
}
