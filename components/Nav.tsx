"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

export function Nav() {
  const { user, profile, loading, configured, signIn, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span aria-hidden className="text-lg">
              🏟️
            </span>
            <span>Stadium Tracker</span>
          </Link>
          {user && (
            <Link
              href="/tracker"
              className="text-sm text-muted hover:text-foreground"
            >
              My Tracker
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {loading ? (
            <span className="text-sm text-muted">…</span>
          ) : user ? (
            <>
              {profile && (
                <Link
                  href={`/u/${profile.username}`}
                  className="hidden text-sm text-muted hover:text-foreground sm:inline"
                  title="Your public share page"
                >
                  @{profile.username}
                </Link>
              )}
              {user.photoURL && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt=""
                  className="h-8 w-8 rounded-full border border-border"
                />
              )}
              <button
                onClick={() => void signOut()}
                className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-background"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => void signIn()}
              disabled={!configured}
              title={
                configured
                  ? "Sign in with Google"
                  : "Firebase is not configured yet — see the README"
              }
              className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sign in with Google
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
