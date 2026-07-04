"use client";

import { useState } from "react";
import { LEAGUE_COLORS } from "@/lib/stadiums";
import type { Stadium, Visit } from "@/lib/types";

interface Props {
  stadium: Stadium;
  visit?: Visit;
  /** True when the viewer is signed in and can edit their own visits. */
  canEdit: boolean;
  onClose: () => void;
  onSave: (input: { date: string; opponent: string }) => Promise<void>;
  onRemove: () => Promise<void>;
}

export function StadiumDetail({
  stadium,
  visit,
  canEdit,
  onClose,
  onSave,
  onRemove,
}: Props) {
  // Form state is seeded from the current visit. The parent remounts this
  // component (key={stadium.id}) when a different stadium is selected, so the
  // form always starts fresh for the newly selected stadium.
  const [date, setDate] = useState(visit?.date ?? "");
  const [opponent, setOpponent] = useState(visit?.opponent ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setBusy(true);
    setError(null);
    try {
      await onSave({ date, opponent });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    setBusy(true);
    setError(null);
    try {
      await onRemove();
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

      <div className="flex-1 overflow-y-auto p-4">
        {canEdit ? (
          <div className="space-y-4">
            {visit ? (
              <p className="rounded-md bg-background px-3 py-2 text-sm">
                ✓ You&apos;ve been here.
              </p>
            ) : (
              <p className="text-sm text-muted">
                Mark that you&apos;ve visited this stadium and log the details.
              </p>
            )}

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
              <input
                type="text"
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
                placeholder="e.g. New York Yankees"
                className="w-full rounded-md border border-border bg-background px-3 py-2"
              />
            </label>

            {error && <p className="text-sm text-nfl">{error}</p>}

            <div className="flex gap-2">
              <button
                onClick={() => void handleSave()}
                disabled={busy}
                className="flex-1 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-40"
              >
                {visit ? "Update visit" : "I've been here"}
              </button>
              {visit && (
                <button
                  onClick={() => void handleRemove()}
                  disabled={busy}
                  className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-background disabled:opacity-40"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">
            Sign in with Google to mark this stadium visited and log the date and
            opponent.
          </p>
        )}
      </div>
    </div>
  );
}
