"use client";

import { useMemo, useState } from "react";
import { LEAGUE_COLORS, opponentsFor } from "@/lib/stadiums";
import type { Stadium, Visit } from "@/lib/types";

interface Props {
  stadium: Stadium;
  /** All of the viewer's visits to THIS stadium (may be empty). */
  visits: Visit[];
  /** True when the viewer is signed in and can edit their own visits. */
  canEdit: boolean;
  onClose: () => void;
  onAdd: (input: { date: string; opponent: string }) => Promise<void>;
  onRemove: (visitId: string) => Promise<void>;
}

export function StadiumDetail({
  stadium,
  visits,
  canEdit,
  onClose,
  onAdd,
  onRemove,
}: Props) {
  const [date, setDate] = useState("");
  const [opponent, setOpponent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const opponents = useMemo(() => opponentsFor(stadium), [stadium]);

  // Most recent visit first.
  const ordered = [...visits].sort((a, b) => b.createdAt - a.createdAt);

  async function handleAdd() {
    setBusy(true);
    setError(null);
    try {
      await onAdd({ date, opponent });
      setDate("");
      setOpponent("");
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
              {ordered.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between rounded-md bg-background px-3 py-2 text-sm"
                >
                  <span>
                    {v.date || "Date unknown"}
                    {v.opponent && (
                      <span className="text-muted"> · vs {v.opponent}</span>
                    )}
                  </span>
                  {canEdit && (
                    <button
                      onClick={() => void handleRemove(v.id)}
                      disabled={busy}
                      aria-label="Remove visit"
                      className="ml-2 rounded px-1.5 text-muted hover:bg-border hover:text-foreground disabled:opacity-40"
                    >
                      ✕
                    </button>
                  )}
                </li>
              ))}
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
