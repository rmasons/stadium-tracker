"use client";

import { useMemo, useState } from "react";
import { getStadium, LEAGUE_COLORS } from "@/lib/stadiums";
import type { Visit } from "@/lib/types";

type SortKey = "team" | "league" | "name" | "city" | "date";

interface Row {
  visit: Visit;
  team: string;
  league: string;
  name: string;
  city: string;
  date: string;
}

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

  const rows = useMemo<Row[]>(() => {
    const mapped = visits.flatMap<Row>((visit) => {
      const stadium = getStadium(visit.stadiumId);
      if (!stadium) return [];
      return [
        {
          visit,
          team: stadium.team,
          league: stadium.league,
          name: stadium.name,
          city: `${stadium.city}, ${stadium.state}`,
          date: visit.date,
        },
      ];
    });

    const dir = asc ? 1 : -1;
    return mapped.sort((a, b) => {
      // Empty dates always sort to the bottom regardless of direction.
      if (sortKey === "date") {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
      }
      const av = a[sortKey];
      const bv = b[sortKey];
      return av < bv ? -1 * dir : av > bv ? 1 * dir : 0;
    });
  }, [visits, sortKey, asc]);

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
                  style={{ background: LEAGUE_COLORS[row.visit.league] }}
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
