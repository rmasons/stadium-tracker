"use client";

import { useMemo, useState } from "react";
import { LEAGUE_COLORS, opponentsFor } from "@/lib/stadiums";
import { AttendeePicker } from "./AttendeePicker";
import type { Buddy, FriendProfile, Stadium, Visit } from "@/lib/types";
import type { VisitFormInput } from "@/lib/visits";

interface Props {
  stadium: Stadium;
  /** All of the viewer's visits to THIS stadium (may be empty). */
  visits: Visit[];
  /** True when the viewer is signed in and can edit their own visits. */
  canEdit: boolean;
  /** The viewer's buddies, for the attendee picker and resolving visit rows. */
  buddies: Buddy[];
  /** The viewer's accepted friends, for the attendee picker and resolving
   *  visit rows. */
  friends: FriendProfile[];
  onClose: () => void;
  onAdd: (input: VisitFormInput) => Promise<void>;
  onRemove: (visitId: string) => Promise<void>;
  onUpdate: (visitId: string, input: VisitFormInput) => Promise<void>;
}

/** Resolve a visit's buddyIds/friendUids to display names, silently
 *  dropping ids that no longer resolve (deleted buddy, unfriended user). */
function attendeeNames(
  visit: Visit,
  buddies: Buddy[],
  friends: FriendProfile[],
): string[] {
  const buddyNames = visit.buddyIds
    .map((id) => buddies.find((b) => b.id === id)?.name)
    .filter((name): name is string => !!name);
  const friendNames = visit.friendUids
    .map((uid) => friends.find((f) => f.uid === uid))
    .filter((f): f is FriendProfile => !!f)
    .map((f) => f.displayName || f.username);
  return [...buddyNames, ...friendNames];
}

export function StadiumDetail({
  stadium,
  visits,
  canEdit,
  buddies,
  friends,
  onClose,
  onAdd,
  onRemove,
  onUpdate,
}: Props) {
  const [date, setDate] = useState("");
  const [opponent, setOpponent] = useState("");
  const [selectedBuddyIds, setSelectedBuddyIds] = useState<string[]>([]);
  const [selectedFriendUids, setSelectedFriendUids] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inline edit state — only one row editable at a time.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editOpponent, setEditOpponent] = useState("");
  const [editBuddyIds, setEditBuddyIds] = useState<string[]>([]);
  const [editFriendUids, setEditFriendUids] = useState<string[]>([]);

  const opponents = useMemo(() => opponentsFor(stadium), [stadium]);

  // Most recent visit first.
  const ordered = [...visits].sort((a, b) => b.createdAt - a.createdAt);

  function startEdit(v: Visit) {
    setEditingId(v.id);
    setEditDate(v.date);
    setEditOpponent(v.opponent);
    setEditBuddyIds(v.buddyIds);
    setEditFriendUids(v.friendUids);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleAdd() {
    setBusy(true);
    setError(null);
    try {
      await onAdd({
        date,
        opponent,
        buddyIds: selectedBuddyIds,
        friendUids: selectedFriendUids,
      });
      setDate("");
      setOpponent("");
      setSelectedBuddyIds([]);
      setSelectedFriendUids([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(visitId: string) {
    setBusy(true);
    setError(null);
    try {
      await onUpdate(visitId, {
        date: editDate,
        opponent: editOpponent,
        buddyIds: editBuddyIds,
        friendUids: editFriendUids,
      });
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(visitId: string) {
    setBusy(true);
    setError(null);
    try {
      await onRemove(visitId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex items-start justify-between border-b border-border p-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block rounded px-1.5 py-0.5 text-xs font-semibold text-white"
              style={{ background: LEAGUE_COLORS[stadium.league] }}
            >
              {stadium.league}
            </span>
            <span className="text-sm text-muted">{stadium.team}</span>
          </div>
          <h2 className="mt-1 text-lg font-semibold">{stadium.name}</h2>
          <p className="text-sm text-muted">
            {stadium.city}, {stadium.state}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="rounded-md p-1 text-muted hover:bg-background hover:text-foreground"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {/* Existing visits */}
        {ordered.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium">
              {ordered.length === 1
                ? "You've been here once"
                : `You've been here ${ordered.length} times`}
            </p>
            <ul className="space-y-2">
              {ordered.map((v) =>
                editingId === v.id ? (
                  <li
                    key={v.id}
                    className="space-y-2 rounded-md bg-background px-3 py-2 text-sm"
                  >
                    <div className="flex gap-2">
                      <input
                        type="date"
                        aria-label="Edit date visited"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="min-w-0 flex-1 rounded border border-border bg-card px-2 py-1"
                      />
                      <select
                        aria-label="Edit opponent"
                        value={editOpponent}
                        onChange={(e) => setEditOpponent(e.target.value)}
                        className="min-w-0 flex-1 rounded border border-border bg-card px-2 py-1"
                      >
                        <option value="">— Unknown —</option>
                        {opponents.map((team) => (
                          <option key={team} value={team}>
                            {team}
                          </option>
                        ))}
                      </select>
                    </div>
                    <AttendeePicker
                      buddies={buddies}
                      friends={friends}
                      selectedBuddyIds={editBuddyIds}
                      selectedFriendUids={editFriendUids}
                      onChange={(buddyIds, friendUids) => {
                        setEditBuddyIds(buddyIds);
                        setEditFriendUids(friendUids);
                      }}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={cancelEdit}
                        disabled={busy}
                        className="rounded px-2 py-1 text-xs text-muted hover:bg-border disabled:opacity-40"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => void handleUpdate(v.id)}
                        disabled={busy}
                        aria-label="Save visit"
                        className="rounded bg-foreground px-2 py-1 text-xs font-medium text-background hover:opacity-90 disabled:opacity-40"
                      >
                        Save
                      </button>
                    </div>
                  </li>
                ) : (
                  <li
                    key={v.id}
                    className="flex items-center justify-between rounded-md bg-background px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <span>
                        {v.date || "Date unknown"}
                        {v.opponent && (
                          <span className="text-muted"> · vs {v.opponent}</span>
                        )}
                      </span>
                      {(() => {
                        const names = attendeeNames(v, buddies, friends);
                        return (
                          names.length > 0 && (
                            <p className="mt-0.5 text-xs text-muted">
                              With {names.join(", ")}
                            </p>
                          )
                        );
                      })()}
                    </div>
                    {canEdit && (
                      <div className="ml-2 flex items-center gap-1">
                        <button
                          onClick={() => startEdit(v)}
                          disabled={busy}
                          aria-label="Edit visit"
                          className="rounded px-1.5 text-muted hover:bg-border hover:text-foreground disabled:opacity-40"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => void handleRemove(v.id)}
                          disabled={busy}
                          aria-label="Remove visit"
                          className="rounded px-1.5 text-muted hover:bg-border hover:text-foreground disabled:opacity-40"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </li>
                ),
              )}
            </ul>
          </div>
        )}

        {/* Add a visit */}
        {canEdit ? (
          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-medium">
              {ordered.length > 0 ? "Log another visit" : "Log a visit"}
            </p>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Date visited</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Opponent</span>
              <select
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2"
              >
                <option value="">— Unknown / not recorded —</option>
                {opponents.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </label>

            <AttendeePicker
              buddies={buddies}
              friends={friends}
              selectedBuddyIds={selectedBuddyIds}
              selectedFriendUids={selectedFriendUids}
              onChange={(buddyIds, friendUids) => {
                setSelectedBuddyIds(buddyIds);
                setSelectedFriendUids(friendUids);
              }}
            />

            {error && <p className="text-sm text-nfl">{error}</p>}

            <button
              onClick={() => void handleAdd()}
              disabled={busy}
              className="w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-40"
            >
              {ordered.length > 0 ? "Add visit" : "I've been here"}
            </button>
          </div>
        ) : (
          ordered.length === 0 && (
            <p className="text-sm text-muted">
              Sign in with Google to log a visit to this stadium with the date
              and opponent.
            </p>
          )
        )}
      </div>
    </div>
  );
}
