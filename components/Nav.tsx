"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { LogoMark } from "./LogoMark";
import { SignInButton } from "./SignInButton";

export function Nav() {
  const { user, profile, loading, signOut } = useAuth();
  const pathname = usePathname();

  // The map screen ("/") renders its own header (see the 1A/1B layouts in
  // HomePage) with the same logo/sign-in language, so this global nav would
  // double up chrome there — only render it on the other routes.
  if (pathname === "/") return null;

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-extrabold tracking-tight"
          >
            <LogoMark size={26} />
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
            <SignInButton />
          )}
        </div>
      </div>
    </header>
  );
}
