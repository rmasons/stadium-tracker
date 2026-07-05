"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { VisitedList } from "@/components/VisitedList";
import { subscribeToVisits, removeVisit } from "@/lib/visits";
import { setUsername } from "@/lib/username";
import { shareSummary, summarize } from "@/lib/stats";
import type { Visit } from "@/lib/types";

export default function TrackerPage() {
  const { user, profile, loading, configured, refreshProfile } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  useEffect(() => {
    // window.location is only available on the client, after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisits([]);
      return;
    }
    return subscribeToVisits(user.uid, setVisits);
  }, [user]);

  const summary = useMemo(() => summarize(visits), [visits]);

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
      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted">
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
        {summary.totalVisits > summary.total && (
          <span>
            <strong className="text-foreground">{summary.totalVisits}</strong>{" "}
            visits logged
          </span>
        )}
      </div>
      <div
        className="mt-3 h-2 w-full max-w-md overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-valuenow={summary.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Stadiums visited"
      >
        <div
          className="h-full rounded-full bg-foreground transition-all"
          style={{ width: `${summary.percent}%` }}
        />
      </div>

      {profile && (
        <div className="mt-6 rounded-lg border border-border bg-card p-4">
          <UsernameEditor
            key={profile.username}
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
          {shareUrl && (
            <button
              onClick={() => {
                void navigator.clipboard
                  .writeText(
                    `${shareSummary(profile.displayName, visits)} ${shareUrl}`,
                  )
                  .then(() => {
                    setCopiedSummary(true);
                    setTimeout(() => setCopiedSummary(false), 1500);
                  });
              }}
              className="mt-2 text-xs text-muted underline hover:text-foreground"
            >
              {copiedSummary ? "Summary copied!" : "Copy a shareable summary"}
            </button>
          )}
        </div>
      )}

      <div className="mt-6">
        <VisitedList
          visits={visits}
          editable
          onRemove={(visitId) => void removeVisit(user.uid, visitId)}
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
  // Seeded from `current`; the parent remounts this editor (key={username})
  // whenever the saved username changes, so the input stays in sync.
  const [value, setValue] = useState(current);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

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
