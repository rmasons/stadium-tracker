"use client";

import { useMemo, useState } from "react";
import { LEAGUE_COLORS } from "@/lib/stadiums";
import { sortRows, toRows, type SortKey } from "@/lib/sort";
import type { Visit } from "@/lib/types";

interface Props {
  visits: Visit[];
  editable?: boolean;
  onRemove?: (stadiumId: string) => void;
}

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "league", label: "League" },
  { key: "team", label: "Team" },
  { key: "name", label: "Stadium" },
  { key: "city", label: "City" },
  { key: "date", label: "Date" },
];

export function VisitedList({ visits, editable = false, onRemove }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [asc, setAsc] = useState(false);

  const rows = useMemo(
    () => sortRows(toRows(visits), sortKey, asc),
    [visits, sortKey, asc],
  );

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setAsc((v) => !v);
    } else {
      setSortKey(key);
      setAsc(key !== "date"); // dates default newest-first
    }
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted">
        No stadiums visited yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-muted">
            {COLUMNS.map((col) => (
              <th key={col.key} className="px-3 py-2 font-medium">
                <button
                  onClick={() => toggleSort(col.key)}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span aria-hidden>{asc ? "▲" : "▼"}</span>
                  )}
                </button>
              </th>
            ))}
            <th className="px-3 py-2 font-medium">Opponent</th>
            {editable && <th className="px-3 py-2" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.visit.stadiumId}
              className="border-b border-border last:border-0"
            >
              <td className="px-3 py-2">
                <span
                  className="inline-block rounded px-1.5 py-0.5 text-xs font-semibold text-white"
                  style={{ background: LEAGUE_COLORS[row.league] }}
                >
                  {row.league}
                </span>
              </td>
              <td className="px-3 py-2 font-medium">{row.team}</td>
              <td className="px-3 py-2">{row.name}</td>
              <td className="px-3 py-2 text-muted">{row.city}</td>
              <td className="px-3 py-2 text-muted">{row.date || "—"}</td>
              <td className="px-3 py-2 text-muted">
                {row.visit.opponent || "—"}
              </td>
              {editable && (
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => onRemove?.(row.visit.stadiumId)}
                    className="rounded border border-border px-2 py-1 text-xs hover:bg-background"
                  >
                    Remove
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
