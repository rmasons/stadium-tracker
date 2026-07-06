import { STADIUMS } from "@/lib/stadiums";
import { StadiumDetail } from "@/components/StadiumDetail";
import type { Visit } from "@/lib/types";

const yankees = STADIUMS.find((s) => s.id === "mlb-yankees")!;

const visits: Visit[] = [
  {
    id: "v1",
    stadiumId: yankees.id,
    league: "MLB",
    date: "2024-07-01",
    opponent: "Boston Red Sox",
    createdAt: 2,
    updatedAt: 2,
  },
  {
    id: "v2",
    stadiumId: yankees.id,
    league: "MLB",
    date: "2023-05-14",
    opponent: "Baltimore Orioles",
    createdAt: 1,
    updatedAt: 1,
  },
];

const card = (children: React.ReactNode) => (
  <div
    style={{
      width: 380,
      height: 480,
      border: "1px solid oklch(92% 0.005 95)",
      borderRadius: 12,
      overflow: "hidden",
    }}
  >
    {children}
  </div>
);

export function WithVisits() {
  return card(
    <StadiumDetail
      stadium={yankees}
      visits={visits}
      canEdit
      onClose={() => {}}
      onAdd={async () => {}}
      onRemove={async () => {}}
    />,
  );
}

export function NoVisitsSignedIn() {
  return card(
    <StadiumDetail
      stadium={yankees}
      visits={[]}
      canEdit
      onClose={() => {}}
      onAdd={async () => {}}
      onRemove={async () => {}}
    />,
  );
}

export function SignedOut() {
  return card(
    <StadiumDetail
      stadium={yankees}
      visits={[]}
      canEdit={false}
      onClose={() => {}}
      onAdd={async () => {}}
      onRemove={async () => {}}
    />,
  );
}
