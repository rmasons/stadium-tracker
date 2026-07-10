"use client";

import type { Buddy, FriendProfile } from "@/lib/types";

interface Props {
  buddies: Buddy[];
  friends: FriendProfile[];
  selectedBuddyIds: string[];
  selectedFriendUids: string[];
  onChange: (buddyIds: string[], friendUids: string[]) => void;
}

/**
 * Controlled attendee picker for the add/edit visit forms: toggleable chips
 * for buddies (always, when any exist) and friends (only when the viewer has
 * accepted friends). No Firestore calls — the parent owns selection state and
 * persists it on submit. Renders nothing when the viewer has neither buddies
 * nor friends, so new users don't see an empty "Who was with you?" section.
 */
export function AttendeePicker({
  buddies,
  friends,
  selectedBuddyIds,
  selectedFriendUids,
  onChange,
}: Props) {
  if (buddies.length === 0 && friends.length === 0) return null;

  function toggleBuddy(id: string) {
    const next = selectedBuddyIds.includes(id)
      ? selectedBuddyIds.filter((b) => b !== id)
      : selectedBuddyIds.length >= 25
        ? selectedBuddyIds
        : [...selectedBuddyIds, id];
    onChange(next, selectedFriendUids);
  }

  // 10 matches the Firestore rules cap on friendUids (each entry there must
  // be individually confirmed as an accepted friend, so the cap is lower
  // than buddyIds' 25).
  function toggleFriend(uid: string) {
    const next = selectedFriendUids.includes(uid)
      ? selectedFriendUids.filter((f) => f !== uid)
      : selectedFriendUids.length >= 10
        ? selectedFriendUids
        : [...selectedFriendUids, uid];
    onChange(selectedBuddyIds, next);
  }

  return (
    <div className="text-sm">
      <span className="mb-1 block font-medium text-muted">
        Who was with you?
      </span>
      {buddies.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {buddies.map((b) => (
            <Chip
              key={b.id}
              label={b.name}
              selected={selectedBuddyIds.includes(b.id)}
              onClick={() => toggleBuddy(b.id)}
            />
          ))}
        </div>
      )}
      {friends.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {friends.map((f) => (
            <Chip
              key={f.uid}
              label={f.displayName || f.username}
              selected={selectedFriendUids.includes(f.uid)}
              onClick={() => toggleFriend(f.uid)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={
        selected
          ? "rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background"
          : "rounded-full border border-border px-3 py-1 text-xs font-medium hover:bg-background"
      }
    >
      {label}
    </button>
  );
}
