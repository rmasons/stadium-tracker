"use client";

import { useAuth } from "./AuthProvider";

/** Ghost-style sign-in button shared by both redesign layouts (and Nav) —
 *  replaces the old solid-black pill. */
export function SignInButton({ fullWidth = false }: { fullWidth?: boolean }) {
  const { configured, signIn } = useAuth();

  return (
    <button
      onClick={() => void signIn()}
      disabled={!configured}
      title={
        configured
          ? "Sign in with Google"
          : "Firebase is not configured yet — see the README"
      }
      style={{
        width: fullWidth ? "100%" : undefined,
        background: "transparent",
        border: "1.5px solid oklch(80% 0.01 90)",
        color: "oklch(25% 0.01 90)",
        fontWeight: 700,
        fontSize: 14,
        padding: "9px 16px",
        borderRadius: 9,
        cursor: configured ? "pointer" : "not-allowed",
        opacity: configured ? 1 : 0.4,
        transition: "background 0.12s ease",
      }}
      onMouseEnter={(e) => {
        if (configured) e.currentTarget.style.background = "oklch(97% 0.006 95)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      Sign in with Google
    </button>
  );
}
