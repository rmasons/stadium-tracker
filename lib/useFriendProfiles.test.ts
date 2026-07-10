// @vitest-environment jsdom
import { afterEach, describe, it, expect, vi, beforeEach } from "vitest";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { useFriendProfiles } from "./useFriendProfiles";
import type { Friendship, PublicProfile } from "./types";

const { mockGetProfile } = vi.hoisted(() => ({
  mockGetProfile: vi.fn(),
}));

// useFriendProfiles pulls in lib/friends.ts (for the pure `otherMember`
// helper), which in turn imports firebase/firestore and lib/firebase at
// module scope. Stub all of that out so the test only exercises the hook's
// own fetch/cache logic against a mocked getProfile.
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  onSnapshot: vi.fn(),
  query: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  where: vi.fn(),
}));
vi.mock("./firebase", () => ({ getDb: () => ({}) }));
vi.mock("./username", () => ({ getProfile: mockGetProfile }));

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
});

function friendship(overrides: Partial<Friendship>): Friendship {
  return {
    id: "f1",
    members: ["me", "other"],
    requestedBy: "me",
    status: "accepted",
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

const profile: PublicProfile = {
  username: "alex",
  displayName: "Alex",
  photoURL: "",
};

describe("useFriendProfiles", () => {
  it("fetches profiles for accepted friendships and derives `friends`", async () => {
    mockGetProfile.mockResolvedValue(profile);
    const f = friendship({ id: "f-u1", members: ["me", "u1"] });

    const { result } = renderHook(() => useFriendProfiles("me", [f]));

    expect(result.current.profiles).toEqual({});
    expect(result.current.friends).toEqual([]);

    await waitFor(() => expect(result.current.profiles["u1"]).toEqual(profile));
    expect(mockGetProfile).toHaveBeenCalledWith("u1");
    expect(result.current.friends).toEqual([{ uid: "u1", ...profile }]);
  });

  it("retries a uid whose fetch failed on the next friendships change, without caching a stale entry", async () => {
    mockGetProfile.mockRejectedValueOnce(new Error("offline"));
    const f = friendship({ id: "f-u2", members: ["me", "u2"] });

    const { result, rerender } = renderHook(
      ({ friendships }: { friendships: Friendship[] }) =>
        useFriendProfiles("me", friendships),
      { initialProps: { friendships: [f] } },
    );

    await waitFor(() => expect(mockGetProfile).toHaveBeenCalledTimes(1));
    // The failed fetch must not be cached at all — not even as `null`
    // (which means "fetched, no such account").
    expect(result.current.profiles).toEqual({});
    expect(result.current.friends).toEqual([]);

    mockGetProfile.mockResolvedValueOnce(profile);
    // A new friendships array (new identity, e.g. from a fresh Firestore
    // snapshot) re-runs the fetch effect and should retry u2 since it was
    // never marked as resolved.
    rerender({ friendships: [{ ...f }] });

    await waitFor(() => expect(result.current.profiles["u2"]).toEqual(profile));
    expect(mockGetProfile).toHaveBeenCalledTimes(2);
    expect(result.current.friends).toEqual([{ uid: "u2", ...profile }]);
  });

  it("caches a null (missing account) result and does not refetch it", async () => {
    mockGetProfile.mockResolvedValue(null);
    const f = friendship({ id: "f-u3", members: ["me", "u3"] });

    const { result, rerender } = renderHook(
      ({ friendships }: { friendships: Friendship[] }) =>
        useFriendProfiles("me", friendships),
      { initialProps: { friendships: [f] } },
    );

    await waitFor(() =>
      expect(result.current.profiles).toHaveProperty("u3", null),
    );
    expect(mockGetProfile).toHaveBeenCalledTimes(1);
    // A missing account never resolves to a FriendProfile.
    expect(result.current.friends).toEqual([]);

    // A new friendships array with the same uid should not trigger a refetch.
    rerender({ friendships: [{ ...f }] });
    await Promise.resolve();
    expect(mockGetProfile).toHaveBeenCalledTimes(1);
  });

  it("resets the cache when uid changes", async () => {
    mockGetProfile.mockResolvedValue(profile);
    const f = friendship({ id: "f-u1", members: ["me", "u1"] });

    const { result, rerender } = renderHook(
      ({ uid, friendships }: { uid: string; friendships: Friendship[] }) =>
        useFriendProfiles(uid, friendships),
      { initialProps: { uid: "me", friendships: [f] } },
    );

    await waitFor(() => expect(result.current.profiles["u1"]).toEqual(profile));

    rerender({ uid: "someone-else", friendships: [f] });
    // The reset effect runs synchronously with the rerender (before the new
    // uid's fetch has had a chance to resolve), so the cache is empty right
    // away rather than only "eventually."
    expect(result.current.profiles).toEqual({});
  });
});
