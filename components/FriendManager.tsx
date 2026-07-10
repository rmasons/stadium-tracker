"use client";

import { useState } from "react";
import Link from "next/link";
import { otherMember } from "@/lib/friends";
import { useFriendProfiles } from "@/lib/useFriendProfiles";
import type { Friendship } from "@/lib/types";

interface Props {
  uid: string;
  friendships: Friendship[];
  onSendRequest: (username: string) => Promise<void>;
  onAccept: (friendshipId: string) => Promise<void>;
  onRemove: (friendshipId: string) => Promise<void>;
}

/**
 * Friends card on /tracker: username search to send a request, plus the
 * incoming/sent/accepted lists derived from the live friendships
 * subscription. Profile display data for the other member of each friendship
 * is resolved lazily and cached for the life of the component.
 */
export function FriendManager({
  uid,
  friendships,
  onSendRequest,
  onAccept,
  onRemove,
}: Props) {
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const { profiles } = useFriendProfiles(uid, friendships);

  const incoming = friendships.filter(
    (f) => f.status === "pending" && f.requestedBy !== uid,
  );
  const sent = friendships.filter(
    (f) => f.status === "pending" && f.requestedBy === uid,
  );
  const accepted = friendships.filter((f) => f.status === "accepted");

  async function send() {
    const target = username.trim();
    if (!target) return;
    setBusy(true);
    setMsg(null);
    try {
      await onSendRequest(target);
      setUsername("");
      setMsg("Request sent.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not send the request.");
    } finally {
      setBusy(false);
    }
  }

  function nameFor(friendship: Friendship): string {
    const other = otherMember(friendship, uid);
    const profile = profiles[other];
    if (profile === undefined) return "…";
    return profile?.displayName || profile?.username || "Unknown user";
  }

  function row(friendship: Friendship, actions: React.ReactNode) {
    const other = otherMember(friendship, uid);
    const profile = profiles[other];
    return (
      <li key={friendship.id} className="flex items-center gap-3 py-2">
        {profile?.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.photoURL}
            alt=""
            className="h-8 w-8 rounded-full border border-border"
          />
        ) : (
          <div className="h-8 w-8 rounded-full border border-border bg-background" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{nameFor(friendship)}</p>
          {profile?.username && (
            <Link
              href={`/u/${profile.username}`}
              className="text-xs text-muted underline hover:text-foreground"
            >
              @{profile.username}
            </Link>
          )}
        </div>
        <div className="flex shrink-0 gap-2">{actions}</div>
      </li>
    );
  }

  const actionButton = (label: string, onClick: () => void, primary = false) => (
    <button
      onClick={onClick}
      className={
        primary
          ? "rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90"
          : "rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-background"
      }
    >
      {label}
    </button>
  );

  return (
    <div className="mt-6 rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-semibold">Friends</h2>

      <div className="mt-2 flex items-center gap-2">
        <span className="text-muted">@</span>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void send();
          }}
          placeholder="username"
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          onClick={() => void send()}
          disabled={busy || !username.trim()}
          className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-40"
        >
          Send request
        </button>
      </div>
      {msg && <p className="mt-1 text-xs text-muted">{msg}</p>}
      <p className="mt-1 text-xs text-muted">
        Add friends by their username to see each other in your trackers.
      </p>

      {incoming.length > 0 && (
        <section className="mt-4">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted">
            Requests
          </h3>
          <ul>
            {incoming.map((f) =>
              row(
                f,
                <>
                  {actionButton("Accept", () => void onAccept(f.id), true)}
                  {actionButton("Decline", () => void onRemove(f.id))}
                </>,
              ),
            )}
          </ul>
        </section>
      )}

      {sent.length > 0 && (
        <section className="mt-4">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted">
            Sent
          </h3>
          <ul>
            {sent.map((f) =>
              row(f, actionButton("Cancel", () => void onRemove(f.id))),
            )}
          </ul>
        </section>
      )}

      <section className="mt-4">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted">
          Your friends
        </h3>
        {accepted.length === 0 ? (
          <p className="mt-1 text-sm text-muted">No friends yet.</p>
        ) : (
          <ul>
            {accepted.map((f) =>
              row(f, actionButton("Unfriend", () => void onRemove(f.id))),
            )}
          </ul>
        )}
      </section>
    </div>
  );
}
