import { STADIUMS } from "@/lib/stadiums";
import { StadiumListRow } from "@/components/redesign/StadiumListRow";

const oracle = STADIUMS.find((s) => s.id === "mlb-giants")!;
const fenway = STADIUMS.find((s) => s.id === "mlb-redsox")!;
const niners = STADIUMS.find((s) => s.id === "nfl-49ers")!;

export function Visited() {
  return (
    <div style={{ width: 300, background: "#fff" }}>
      <StadiumListRow stadium={oracle} visited selected={false} onClick={() => {}} />
    </div>
  );
}

export function Selected() {
  return (
    <div style={{ width: 300, background: "#fff" }}>
      <StadiumListRow stadium={niners} visited selected onClick={() => {}} />
    </div>
  );
}

export function NotYetVisited() {
  return (
    <div style={{ width: 300, background: "#fff" }}>
      <StadiumListRow stadium={fenway} visited={false} selected={false} onClick={() => {}} />
    </div>
  );
}
