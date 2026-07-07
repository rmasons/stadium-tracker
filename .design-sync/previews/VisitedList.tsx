import { STADIUMS } from "@/lib/stadiums";
import { VisitedList } from "@/components/VisitedList";
import type { Visit } from "@/lib/types";

const giants = STADIUMS.find((s) => s.id === "mlb-giants")!;
const niners = STADIUMS.find((s) => s.id === "nfl-49ers")!;

const visits: Visit[] = [
  {
    id: "v1",
    stadiumId: giants.id,
    league: "MLB",
    date: "2024-09-14",
    opponent: "Los Angeles Dodgers",
    createdAt: 2,
    updatedAt: 2,
  },
  {
    id: "v2",
    stadiumId: niners.id,
    league: "NFL",
    date: "2023-11-12",
    opponent: "Seattle Seahawks",
    createdAt: 1,
    updatedAt: 1,
  },
];

export function ReadOnly() {
  return (
    <div style={{ width: 640 }}>
      <VisitedList visits={visits} />
    </div>
  );
}

export function Editable() {
  return (
    <div style={{ width: 640 }}>
      <VisitedList visits={visits} editable onRemove={() => {}} />
    </div>
  );
}

export function Empty() {
  return (
    <div style={{ width: 640 }}>
      <VisitedList visits={[]} />
    </div>
  );
}
