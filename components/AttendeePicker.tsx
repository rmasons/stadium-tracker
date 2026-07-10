"use client";

import { MAX_VISIT_BUDDIES, MAX_VISIT_FRIENDS } from "@/lib/limits";
import type { Buddy, FriendProfile } from "@/lib/types";

interface Props {
  buddies: Buddy[];
  friends: FriendProfile[];
  selectedBuddyIds: string[];
  selectedFriendUids: string[];
  onChange: (buddyIds: string[], friendUids: string[]) => void;
}

/**
 * Toggle `id` in `list`: deselect if present, otherwise select unless `list`
 * is already at `cap` (in which case `list` is returned unchanged — callers
 * that render from this should disable the control at cap rather than rely
 * on this silent no-op for feedback).
 */
export function toggle(list: string[], id: string, cap: number): string[] {
  if (list.includes(id)) return list.filter((x) => x !== id);
  if (list.length >= cap) return list;
  return [...list, id];
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
    onChange(
      toggle(selectedBuddyIds, id, MAX_VISIT_BUDDIES),
      selectedFriendUids,
    );
  }

  // The friend cap is lower than buddies' because each entry there must be
  // individually confirmed as an accepted friend (see firestore.rules).
  function toggleFriend(uid: string) {
    onChange(
      selectedBuddyIds,
      toggle(selectedFriendUids, uid, MAX_VISIT_FRIENDS),
    );
  }

  const buddiesAtCap = selectedBuddyIds.length >= MAX_VISIT_BUDDIES;
  const friendsAtCap = selectedFriendUids.length >= MAX_VISIT_FRIENDS;

  return (
    <div className="text-sm">
      <span className="mb-1 block font-medium text-muted">
        Who was with you?
      </span>
      {buddies.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {buddies.map((b) => {
            const selected = selectedBuddyIds.includes(b.id);
            return (
              <Chip
                key={b.id}
                label={b.name}
                selected={selected}
                disabled={!selected && buddiesAtCap}
                limitLabel={MAX_VISIT_BUDDIES}
                onClick={() => toggleBuddy(b.id)}
              />
            );
          })}
        </div>
      )}
      {friends.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {friends.map((f) => {
            const selected = selectedFriendUids.includes(f.uid);
            return (
              <Chip
                key={f.uid}
                label={f.displayName || f.username}
                selected={selected}
                disabled={!selected && friendsAtCap}
                limitLabel={MAX_VISIT_FRIENDS}
                onClick={() => toggleFriend(f.uid)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function Chip({
  label,
  selected,
  disabled,
  limitLabel,
  onClick,
}: {
  label: string;
  selected: boolean;
  disabled: boolean;
  limitLabel: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      title={disabled ? `Limit of ${limitLabel} per visit` : undefined}
      className={
        selected
          ? "rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background"
          : "rounded-full border border-border px-3 py-1 text-xs font-medium hover:bg-background disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
      }
    >
      {label}
    </button>
  );
}
