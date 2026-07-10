import { STADIUMS } from "@/lib/stadiums";
import { MapDetailPanel } from "@/components/MapDetailPanel";
import type { Buddy, FriendProfile, Visit } from "@/lib/types";

const oracle = STADIUMS.find((s) => s.id === "mlb-giants")!;

// Sample attendee so the Visited story's edit drawer (StadiumDetail nested
// inside MapDetailPanel) can show a resolved "With ..." line.
const buddies: Buddy[] = [{ id: "b1", name: "Priya", createdAt: 1 }];
const friends: FriendProfile[] = [];

const visits: Visit[] = [
  {
    id: "v1",
    stadiumId: oracle.id,
    league: "MLB",
    date: "2024-09-14",
    opponent: "Los Angeles Dodgers",
    createdAt: 1,
    updatedAt: 1,
    buddyIds: ["b1"],
    friendUids: [],
  },
];

const wrap = (children: React.ReactNode) => <div style={{ width: 500 }}>{children}</div>;

export function Empty() {
  return wrap(
    <MapDetailPanel
      stadium={null}
      visits={[]}
      canEdit={false}
      buddies={[]}
      friends={[]}
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
      buddies={buddies}
      friends={friends}
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
      buddies={buddies}
      friends={friends}
      onClose={() => {}}
      onAdd={async () => {}}
      onRemove={async () => {}}
      onUpdate={async () => {}}
    />,
  );
}
