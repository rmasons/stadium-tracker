import { STADIUMS } from "@/lib/stadiums";
import { MapDetailPanel } from "@/components/MapDetailPanel";
import type { Visit } from "@/lib/types";

const oracle = STADIUMS.find((s) => s.id === "mlb-giants")!;

const visits: Visit[] = [
  {
    id: "v1",
    stadiumId: oracle.id,
    league: "MLB",
    date: "2024-09-14",
    opponent: "Los Angeles Dodgers",
    createdAt: 1,
    updatedAt: 1,
  },
];

const wrap = (children: React.ReactNode) => <div style={{ width: 500 }}>{children}</div>;

export function Empty() {
  return wrap(
    <MapDetailPanel
      stadium={null}
      visits={[]}
      canEdit={false}
      onClose={() => {}}
      onAdd={async () => {}}
      onRemove={async () => {}}
      onUpdate={async () => {}}
    />,
  );
}

export function Visited() {
  return wrap(
    <MapDetailPanel
      stadium={oracle}
      visits={visits}
      canEdit
      onClose={() => {}}
      onAdd={async () => {}}
      onRemove={async () => {}}
      onUpdate={async () => {}}
    />,
  );
}

export function NotYetVisited() {
  return wrap(
    <MapDetailPanel
      stadium={oracle}
      visits={[]}
      canEdit
      onClose={() => {}}
      onAdd={async () => {}}
      onRemove={async () => {}}
      onUpdate={async () => {}}
    />,
  );
}
