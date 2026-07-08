"use client";

import { useState } from "react";
import type { Buddy } from "@/lib/types";

interface Props {
  buddies: Buddy[];
  onAdd: (name: string) => Promise<void>;
  onRemove: (buddyId: string) => Promise<void>;
  onRename: (buddyId: string, name: string) => Promise<void>;
}

/**
 * Buddies card on /tracker: an add form plus a list of existing buddies with
 * inline rename and remove. Buddies are private, account-less companions —
 * distinct from FriendManager's mutual, account-holding friends.
 */
export function BuddyManager({ buddies, onAdd, onRemove, onRename }: Props) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Inline edit state — only one row editable at a time.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  async function add() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setBusy(true);
    setMsg(null);
    try {
      await onAdd(trimmed);
      setName("");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not add buddy.");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(buddy: Buddy) {
    setEditingId(buddy.id);
    setEditName(buddy.name);
    setMsg(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(buddyId: string) {
    const trimmed = editName.trim();
    if (!trimmed) return;
    setBusy(true);
    setMsg(null);
    try {
      await onRename(buddyId, trimmed);
      setEditingId(null);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not rename buddy.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(buddyId: string) {
    setBusy(true);
    setMsg(null);
    try {
      await onRemove(buddyId);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not remove buddy.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-semibold">Buddies</h2>
      <p className="mt-1 text-xs text-muted">
        People you go to games with — they don&apos;t need an account. Only
        you can see them.
      </p>

      <div className="mt-2 flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void add();
          }}
          placeholder="Name"
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          onClick={() => void add()}
          disabled={busy || !name.trim()}
          className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-40"
        >
          Add
        </button>
      </div>
      {msg && <p className="mt-1 text-xs text-muted">{msg}</p>}

      <section className="mt-4">
        {buddies.length === 0 ? (
          <p className="text-sm text-muted">No buddies yet.</p>
        ) : (
          <ul>
            {buddies.map((buddy) =>
              editingId === buddy.id ? (
                <li key={buddy.id} className="flex items-center gap-2 py-2">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void saveEdit(buddy.id);
                    }}
                    aria-label="Edit buddy name"
                    autoFocus
                    className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm"
                  />
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={cancelEdit}
                      disabled={busy}
                      className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-background disabled:opacity-40"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => void saveEdit(buddy.id)}
                      disabled={busy}
                      className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90 disabled:opacity-40"
                    >
                      Save
                    </button>
                  </div>
                </li>
              ) : (
                <li
                  key={buddy.id}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {buddy.name}
                  </span>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => startEdit(buddy)}
                      disabled={busy}
                      className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-background disabled:opacity-40"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => void remove(buddy.id)}
                      disabled={busy}
                      className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-background disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ),
            )}
          </ul>
        )}
      </section>
    </div>
  );
}
