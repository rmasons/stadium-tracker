"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { subscribeToVisits } from "@/lib/visits";
import {
  summarize,
  visitsByYear,
  topOpponents,
  multiVisitedStadiums,
} from "@/lib/stats";
import type { Visit } from "@/lib/types";

export default function StatsPage() {
  const { user, loading, configured } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisits([]);
      return;
    }
    return subscribeToVisits(user.uid, setVisits);
  }, [user]);

  if (loading) {
    return <PageShell>Loading…</PageShell>;
  }

  if (!user) {
    return (
      <PageShell>
        <p className="text-muted">
          {configured
            ? "Sign in with Google to view your stats."
            : "Firebase isn't configured yet. See the README to connect a project."}
        </p>
        <Link href="/" className="mt-4 inline-block text-sm underline">
          ← Back to the map
        </Link>
      </PageShell>
    );
  }

  return <StatsContent visits={visits} />;
}

function StatsContent({ visits }: { visits: Visit[] }) {
  const summary = useMemo(() => summarize(visits), [visits]);
  const byYear = useMemo(() => visitsByYear(visits), [visits]);
  const opponents = useMemo(() => topOpponents(visits, 10), [visits]);
  const repeatVenues = useMemo(() => multiVisitedStadiums(visits), [visits]);

  if (visits.length === 0) {
    return (
      <PageShell>
        <h1 className="text-2xl font-bold">My Stats</h1>
        <p className="mt-4 text-muted">
          No visits yet.{" "}
          <Link href="/" className="underline hover:text-foreground">
            Head to the map
          </Link>{" "}
          to start logging games!
        </p>
      </PageShell>
    );
  }

  const mlbPercent =
    summary.mlbTotal > 0
      ? Math.round((summary.mlb / summary.mlbTotal) * 100)
      : 0;
  const nflPercent =
    summary.nflTotal > 0
      ? Math.round((summary.nfl / summary.nflTotal) * 100)
      : 0;

  // byYear is sorted most recent first; find actual max for bar scaling
  const yearMax = byYear.length > 0 ? Math.max(...byYear.map((y) => y.count)) : 1;

  return (
    <PageShell>
      <h1 className="text-2xl font-bold">My Stats</h1>

      {/* League progress */}
      <section className="mt-6 rounded-lg border border-border bg-card p-4">
        <h2 className="text-lg font-semibold mb-3">League Progress</h2>
        <div className="space-y-4">
          <LeagueBar
            label="MLB"
            visited={summary.mlb}
            total={summary.mlbTotal}
            percent={mlbPercent}
          />
          <LeagueBar
            label="NFL"
            visited={summary.nfl}
            total={summary.nflTotal}
            percent={nflPercent}
          />
          <LeagueBar
            label="Overall"
            visited={summary.total}
            total={summary.overallTotal}
            percent={summary.percent}
          />
        </div>
      </section>

      {/* By year */}
      {byYear.length > 0 && (
        <section className="mt-4 rounded-lg border border-border bg-card p-4">
          <h2 className="text-lg font-semibold mb-3">Visits by Year</h2>
          <div className="space-y-2">
            {byYear.map(({ year, count }) => {
              const pct = yearMax > 0 ? Math.round((count / yearMax) * 100) : 0;
              return (
                <div key={year} className="flex items-center gap-3">
                  <span className="w-12 text-sm font-medium text-right shrink-0">
                    {year}
                  </span>
                  <div className="flex-1 h-6 bg-background rounded overflow-hidden border border-border">
                    <div
                      className="h-full bg-foreground rounded transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-sm text-muted text-right shrink-0">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Top opponents */}
      <section className="mt-4 rounded-lg border border-border bg-card p-4">
        <h2 className="text-lg font-semibold mb-3">Top Opponents</h2>
        {opponents.length === 0 ? (
          <p className="text-sm text-muted">
            No opponents logged yet. Add one when you record a visit!
          </p>
        ) : (
          <ol className="space-y-1">
            {opponents.map(({ opponent, count }, i) => (
              <li key={opponent} className="flex items-center gap-3 text-sm">
                <span className="w-5 text-right text-muted shrink-0">
                  {i + 1}.
                </span>
                <span className="flex-1">{opponent}</span>
                <span className="text-muted shrink-0">
                  {count} {count === 1 ? "game" : "games"}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Repeat venues */}
      <section className="mt-4 rounded-lg border border-border bg-card p-4">
        <h2 className="text-lg font-semibold mb-3">Repeat Venues</h2>
        {repeatVenues.length === 0 ? (
          <p className="text-sm text-muted">
            You&#39;ve never been to the same stadium twice.
          </p>
        ) : (
          <ul className="space-y-1">
            {repeatVenues.map(({ stadium, visitCount }) => (
              <li
                key={stadium.id}
                className="flex items-center justify-between text-sm"
              >
                <span>
                  {stadium.name}{" "}
                  <span className="text-muted">({stadium.team})</span>
                </span>
                <span className="text-muted shrink-0 ml-4">
                  {visitCount} visits
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}

function LeagueBar({
  label,
  visited,
  total,
  percent,
}: {
  label: string;
  visited: number;
  total: number;
  percent: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1 text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted">
          {visited} / {total} &nbsp;{percent}%
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} stadiums visited`}
      >
        <div
          className="h-full rounded-full bg-foreground transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-4xl px-4 py-8">{children}</div>;
}
