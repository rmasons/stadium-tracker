"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getProfile, getUidByUsername } from "@/lib/username";
import { getVisits } from "@/lib/visits";
import { isFirebaseConfigured } from "@/lib/firebase";
import { VisitedList } from "@/components/VisitedList";
import { MLB_STADIUMS, NFL_STADIUMS } from "@/lib/stadiums";
import type { PublicProfile, Visit } from "@/lib/types";

type Status = "loading" | "notfound" | "ready";

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

  const counts = useMemo(() => {
    const mlbIds = new Set(MLB_STADIUMS.map((s) => s.id));
    let mlb = 0;
    let nfl = 0;
    for (const v of visits) {
      if (mlbIds.has(v.stadiumId)) mlb++;
      else nfl++;
    }
    return { mlb, nfl };
  }, [visits]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      {status === "loading" && <p className="text-muted">Loading…</p>}

      {status === "notfound" && (
        <div>
          <h1 className="text-2xl font-bold">Tracker not found</h1>
          <p className="mt-2 text-muted">
            No tracker exists for <span className="font-mono">@{username}</span>.
          </p>
          <Link href="/" className="mt-4 inline-block text-sm underline">
            ← Go to the map
          </Link>
        </div>
      )}

      {status === "ready" && profile && (
        <div>
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

          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
            <span>
              <strong className="text-foreground">{counts.mlb}</strong>/
              {MLB_STADIUMS.length} MLB
            </span>
            <span>
              <strong className="text-foreground">{counts.nfl}</strong>/
              {NFL_STADIUMS.length} NFL
            </span>
            <span>
              <strong className="text-foreground">{visits.length}</strong> total
            </span>
          </div>

          <div className="mt-6">
            <VisitedList visits={visits} />
          </div>

          <Link href="/" className="mt-6 inline-block text-sm underline">
            Track your own stadiums →
          </Link>
        </div>
      )}
    </div>
  );
}
