"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { VisitedList } from "@/components/VisitedList";
import { subscribeToVisits, removeVisit } from "@/lib/visits";
import { setUsername } from "@/lib/username";
import { MLB_STADIUMS, NFL_STADIUMS } from "@/lib/stadiums";
import type { Visit } from "@/lib/types";

export default function TrackerPage() {
  const { user, profile, loading, configured, refreshProfile } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!user) {
      setVisits([]);
      return;
    }
    return subscribeToVisits(user.uid, setVisits);
  }, [user]);

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

  if (loading) {
    return <PageShell>Loading…</PageShell>;
  }

  if (!user) {
    return (
      <PageShell>
        <p className="text-muted">
          {configured
            ? "Sign in with Google to see and manage your tracker."
            : "Firebase isn't configured yet. See the README to connect a project."}
        </p>
        <Link href="/" className="mt-4 inline-block text-sm underline">
          ← Back to the map
        </Link>
      </PageShell>
    );
  }

  const shareUrl = profile && origin ? `${origin}/u/${profile.username}` : "";

  async function copyShare() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <PageShell>
      <h1 className="text-2xl font-bold">My Tracker</h1>
      <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted">
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

      {profile && (
        <div className="mt-6 rounded-lg border border-border bg-card p-4">
          <UsernameEditor
            current={profile.username}
            onSave={async (next) => {
              await setUsername(user.uid, profile.username, next);
              await refreshProfile();
            }}
          />
          {shareUrl && (
            <div className="mt-3 flex items-center gap-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                onFocus={(e) => e.currentTarget.select()}
              />
              <button
                onClick={() => void copyShare()}
                className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-background"
              >
                {copied ? "Copied!" : "Copy link"}
              </button>
              <Link
                href={`/u/${profile.username}`}
                className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-background"
              >
                View
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <VisitedList
          visits={visits}
          editable
          onRemove={(stadiumId) => void removeVisit(user.uid, stadiumId)}
        />
      </div>
    </PageShell>
  );
}

function UsernameEditor({
  current,
  onSave,
}: {
  current: string;
  onSave: (next: string) => Promise<void>;
}) {
  const [value, setValue] = useState(current);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => setValue(current), [current]);

  async function save() {
    if (value === current) return;
    setBusy(true);
    setMsg(null);
    try {
      await onSave(value);
      setMsg("Saved.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">Your username</label>
      <div className="flex items-center gap-2">
        <span className="text-muted">@</span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          onClick={() => void save()}
          disabled={busy || value === current}
          className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-40"
        >
          Save
        </button>
      </div>
      {msg && <p className="mt-1 text-xs text-muted">{msg}</p>}
      <p className="mt-1 text-xs text-muted">
        Letters and numbers only. This is your public share link.
      </p>
    </div>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-4xl px-4 py-8">{children}</div>;
}
