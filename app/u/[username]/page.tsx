"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getProfile, getUidByUsername } from "@/lib/username";
import { getVisits } from "@/lib/visits";
import { isFirebaseConfigured } from "@/lib/firebase";
import { VisitedList } from "@/components/VisitedList";
import { summarize } from "@/lib/stats";
import { MLB_STADIUMS, NFL_STADIUMS, LEAGUE_COLORS } from "@/lib/stadiums";
import type { PublicProfile, Visit, Stadium } from "@/lib/types";

type Status = "loading" | "notfound" | "ready";

// Division groupings for MLB (30 teams, 5 per division) and NFL (32 teams, 4 per division).
// The stadium arrays are already in division order, so we just hard-code the counts.
const MLB_DIVISIONS: { label: string; count: number }[] = [
  { label: "AL East", count: 5 },
  { label: "AL Central", count: 5 },
  { label: "AL West", count: 5 },
  { label: "NL East", count: 5 },
  { label: "NL Central", count: 5 },
  { label: "NL West", count: 5 },
];

const NFL_DIVISIONS: { label: string; count: number }[] = [
  { label: "AFC East", count: 4 },
  { label: "AFC North", count: 4 },
  { label: "AFC South", count: 4 },
  { label: "AFC West", count: 4 },
  { label: "NFC East", count: 4 },
  { label: "NFC North", count: 4 },
  { label: "NFC South", count: 4 },
  { label: "NFC West", count: 4 },
];

/** Extract the team nickname from a full team name (drops city prefix).
 *  Handles compound nicknames: "Red Sox", "White Sox", "Blue Jays". */
function shortTeamName(team: string): string {
  const parts = team.split(" ");
  const last = parts[parts.length - 1];
  const secondLast = parts.length >= 2 ? parts[parts.length - 2] : "";
  if (["Red", "White"].includes(secondLast) && last === "Sox")
    return `${secondLast} Sox`;
  if (secondLast === "Blue" && last === "Jays") return "Blue Jays";
  return last;
}

/** Group stadiums into labelled divisions using the hard-coded division order. */
function groupStadiums(
  stadiums: Stadium[],
  divisions: { label: string; count: number }[],
): { label: string; stadiums: Stadium[] }[] {
  const groups: { label: string; stadiums: Stadium[] }[] = [];
  let offset = 0;
  for (const div of divisions) {
    groups.push({
      label: div.label,
      stadiums: stadiums.slice(offset, offset + div.count),
    });
    offset += div.count;
  }
  return groups;
}

interface StadiumPanelProps {
  title: string;
  stadiums: Stadium[];
  divisions: { label: string; count: number }[];
  visitedIds: Set<string>;
}

function StadiumPanel({
  title,
  stadiums,
  divisions,
  visitedIds,
}: StadiumPanelProps) {
  const groups = groupStadiums(stadiums, divisions);
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      {groups.map((group) => (
        <div key={group.label} className="mb-3 last:mb-0">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">
            {group.label}
          </p>
          <div className="flex flex-wrap gap-1">
            {group.stadiums.map((stadium) => {
              const visited = visitedIds.has(stadium.id);
              return (
                <span
                  key={stadium.id}
                  title={`${stadium.name}${visited ? " — visited" : " — not visited"}`}
                  aria-label={`${shortTeamName(stadium.team)}, ${visited ? "visited" : "not visited"}`}
                  className={
                    visited
                      ? "inline-block rounded px-2 py-1 text-xs font-medium text-white"
                      : "inline-block rounded border border-border bg-background px-2 py-1 text-xs text-muted"
                  }
                  style={
                    visited
                      ? { background: LEAGUE_COLORS[stadium.league] }
                      : undefined
                  }
                >
                  {shortTeamName(stadium.team)}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SharePage() {
  const params = useParams<{ username: string }>();
  const username = params.username;
  const [status, setStatus] = useState<Status>("loading");
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!isFirebaseConfigured) {
        if (!cancelled) setStatus("notfound");
        return;
      }
      const uid = await getUidByUsername(username);
      if (!uid) {
        if (!cancelled) setStatus("notfound");
        return;
      }
      const [p, v] = await Promise.all([getProfile(uid), getVisits(uid)]);
      if (cancelled) return;
      if (!p) {
        setStatus("notfound");
        return;
      }
      setProfile(p);
      setVisits(v);
      setStatus("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, [username]);

  const summary = useMemo(() => summarize(visits), [visits]);
  const visitedIds = useMemo(
    () => new Set(visits.map((v) => v.stadiumId)),
    [visits],
  );

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      {status === "loading" && <p className="text-muted">Loading…</p>}

      {status === "notfound" && (
        <div>
          <h1 className="text-2xl font-bold">Tracker not found</h1>
          <p className="mt-2 text-muted">
            No tracker exists for <span className="font-mono">@{username}</span>
            .
          </p>
          <Link href="/" className="mt-4 inline-block text-sm underline">
            ← Go to the map
          </Link>
        </div>
      )}

      {status === "ready" && profile && (
        <div>
          {/* Header — photo, display name, @username */}
          <div className="flex items-center gap-3">
            {profile.photoURL && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.photoURL}
                alt=""
                className="h-12 w-12 rounded-full border border-border"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">{profile.displayName}</h1>
              <p className="text-sm text-muted">@{profile.username}</p>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
            <span>
              <strong className="text-foreground">{summary.mlb}</strong>/
              {summary.mlbTotal} MLB
            </span>
            <span>
              <strong className="text-foreground">{summary.nfl}</strong>/
              {summary.nflTotal} NFL
            </span>
            <span>
              <strong className="text-foreground">{summary.total}</strong> of{" "}
              {summary.overallTotal} ({summary.percent}%)
            </span>
          </div>
          <div
            className="mt-3 h-2 w-full max-w-md overflow-hidden rounded-full bg-border"
            role="progressbar"
            aria-valuenow={summary.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${profile.displayName}'s stadiums visited`}
          >
            <div
              className="h-full rounded-full bg-foreground"
              style={{ width: `${summary.percent}%` }}
            />
          </div>

          {/* Visited stadiums — MLB and NFL panels side by side (stacked on mobile) */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <StadiumPanel
              title="MLB"
              stadiums={MLB_STADIUMS}
              divisions={MLB_DIVISIONS}
              visitedIds={visitedIds}
            />
            <StadiumPanel
              title="NFL"
              stadiums={NFL_STADIUMS}
              divisions={NFL_DIVISIONS}
              visitedIds={visitedIds}
            />
          </div>

          {/* Visit log — only rendered if the user has at least one visit */}
          {visits.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                Visit log
              </h2>
              <VisitedList visits={visits} />
            </div>
          )}

          <Link href="/" className="mt-6 inline-block text-sm underline">
            Track your own stadiums →
          </Link>
        </div>
      )}
    </div>
  );
}
