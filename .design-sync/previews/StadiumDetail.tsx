import { STADIUMS } from "@/lib/stadiums";
import { StadiumDetail } from "@/components/StadiumDetail";
import type { Buddy, FriendProfile, Visit } from "@/lib/types";

const yankees = STADIUMS.find((s) => s.id === "mlb-yankees")!;

// Sample attendees, so WithVisits can show the "With ..." attendee line
// resolved from both a buddy (name-only, private) and a friend (public
// profile) tagged on a visit.
const buddies: Buddy[] = [{ id: "b1", name: "Dave", createdAt: 1 }];
const friends: FriendProfile[] = [
  {
    uid: "u1",
    username: "jsmith",
    displayName: "Jamie Smith",
    photoURL: "",
  },
];

const visits: Visit[] = [
  {
    id: "v1",
    stadiumId: yankees.id,
    league: "MLB",
    date: "2024-07-01",
    opponent: "Boston Red Sox",
    createdAt: 2,
    updatedAt: 2,
    buddyIds: ["b1"],
    friendUids: ["u1"],
  },
  {
    id: "v2",
    stadiumId: yankees.id,
    league: "MLB",
    date: "2023-05-14",
    opponent: "Baltimore Orioles",
    createdAt: 1,
    updatedAt: 1,
    buddyIds: [],
    friendUids: [],
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
      buddies={buddies}
      friends={friends}
      onClose={() => {}}
      onAdd={async () => {}}
      onRemove={async () => {}}
      onUpdate={async () => {}}
    />,
  );
}

export function NoVisitsSignedIn() {
  return card(
    <StadiumDetail
      stadium={yankees}
      visits={[]}
      canEdit
      buddies={[]}
      friends={[]}
      onClose={() => {}}
      onAdd={async () => {}}
      onRemove={async () => {}}
      onUpdate={async () => {}}
    />,
  );
}

export function SignedOut() {
  return card(
    <StadiumDetail
      stadium={yankees}
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
