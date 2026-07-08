import { describe, it, expect, vi, beforeEach } from "vitest";
import { FirebaseError } from "firebase/app";
import {
  pairId,
  otherMember,
  pendingIncomingCount,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
} from "./friends";
import type { FriendshipData } from "./types";

const { mockGetDoc, mockSetDoc, mockUpdateDoc, mockDeleteDoc, mockGetUid } =
  vi.hoisted(() => ({
    mockGetDoc: vi.fn(),
    mockSetDoc: vi.fn(),
    mockUpdateDoc: vi.fn(),
    mockDeleteDoc: vi.fn(),
    mockGetUid: vi.fn(),
  }));

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  deleteDoc: mockDeleteDoc,
  doc: vi.fn((_db: unknown, col: string, id: string) => ({ col, id })),
  getDoc: mockGetDoc,
  onSnapshot: vi.fn(),
  query: vi.fn(),
  setDoc: mockSetDoc,
  updateDoc: mockUpdateDoc,
  where: vi.fn(),
}));

vi.mock("./firebase", () => ({ getDb: () => ({}) }));
vi.mock("./username", () => ({ getUidByUsername: mockGetUid }));

function friendship(overrides: Partial<FriendshipData>): FriendshipData {
  return {
    members: ["uid-a", "uid-b"],
    requestedBy: "uid-a",
    status: "pending",
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("pairId", () => {
  it("is order-independent and sorted", () => {
    expect(pairId("uid-b", "uid-a")).toBe("uid-a_uid-b");
    expect(pairId("uid-a", "uid-b")).toBe("uid-a_uid-b");
  });
});

describe("otherMember", () => {
  it("returns whichever member is not the given uid", () => {
    const f = friendship({});
    expect(otherMember(f, "uid-a")).toBe("uid-b");
    expect(otherMember(f, "uid-b")).toBe("uid-a");
  });
});

describe("pendingIncomingCount", () => {
  it("counts only pending requests sent by someone else", () => {
    const friendships = [
      friendship({ requestedBy: "uid-b" }), // incoming — counts
      friendship({ requestedBy: "uid-a" }), // outgoing — mine
      friendship({ requestedBy: "uid-b", status: "accepted" }), // not pending
    ];
    expect(pendingIncomingCount("uid-a", friendships)).toBe(1);
    expect(pendingIncomingCount("uid-b", friendships)).toBe(1);
  });

  it("is 0 with no friendships", () => {
    expect(pendingIncomingCount("uid-a", [])).toBe(0);
  });
});

describe("sendFriendRequest", () => {
  it("rejects an unknown username", async () => {
    mockGetUid.mockResolvedValue(null);
    await expect(sendFriendRequest("uid-a", "ghost")).rejects.toThrow(
      /no user/i,
    );
    expect(mockSetDoc).not.toHaveBeenCalled();
  });

  it("rejects sending a request to yourself", async () => {
    mockGetUid.mockResolvedValue("uid-a");
    await expect(sendFriendRequest("uid-a", "myself")).rejects.toThrow(
      /yourself/i,
    );
    expect(mockGetDoc).not.toHaveBeenCalled();
    expect(mockSetDoc).not.toHaveBeenCalled();
  });

  it("rejects when already friends", async () => {
    mockGetUid.mockResolvedValue("uid-b");
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => friendship({ status: "accepted" }),
    });
    await expect(sendFriendRequest("uid-a", "buddy")).rejects.toThrow(
      /already friends/i,
    );
    expect(mockSetDoc).not.toHaveBeenCalled();
  });

  it("rejects when a request is already pending", async () => {
    mockGetUid.mockResolvedValue("uid-b");
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => friendship({}),
    });
    await expect(sendFriendRequest("uid-a", "buddy")).rejects.toThrow(
      /already pending/i,
    );
  });

  it("writes a pending doc with sorted members at the pairId", async () => {
    mockGetUid.mockResolvedValue("uid-a");
    mockGetDoc.mockResolvedValue({ exists: () => false });
    mockSetDoc.mockResolvedValue(undefined);

    // Caller uid sorts AFTER the target, exercising the sort.
    await sendFriendRequest("uid-b", "buddy");

    const [ref, data] = mockSetDoc.mock.calls[0];
    expect(ref).toEqual({ col: "friendships", id: "uid-a_uid-b" });
    expect(data).toMatchObject({
      members: ["uid-a", "uid-b"],
      requestedBy: "uid-b",
      status: "pending",
    });
    expect(data.createdAt).toBeTypeOf("number");
    expect(data.updatedAt).toBe(data.createdAt);
  });

  it("maps a lost create race (permission-denied) to the pending message", async () => {
    mockGetUid.mockResolvedValue("uid-b");
    mockGetDoc.mockResolvedValue({ exists: () => false });
    mockSetDoc.mockRejectedValue(
      new FirebaseError("permission-denied", "denied"),
    );
    await expect(sendFriendRequest("uid-a", "buddy")).rejects.toThrow(
      /already pending/i,
    );
  });

  it("rethrows non-permission errors from the write", async () => {
    mockGetUid.mockResolvedValue("uid-b");
    mockGetDoc.mockResolvedValue({ exists: () => false });
    mockSetDoc.mockRejectedValue(new FirebaseError("unavailable", "offline"));
    await expect(sendFriendRequest("uid-a", "buddy")).rejects.toThrow(
      "offline",
    );
  });
});

describe("acceptFriendRequest", () => {
  it("flips status to accepted and bumps updatedAt", async () => {
    mockUpdateDoc.mockResolvedValue(undefined);
    await acceptFriendRequest("uid-a_uid-b");
    const [ref, patch] = mockUpdateDoc.mock.calls[0];
    expect(ref).toEqual({ col: "friendships", id: "uid-a_uid-b" });
    expect(patch.status).toBe("accepted");
    expect(patch.updatedAt).toBeTypeOf("number");
  });
});

describe("removeFriend", () => {
  it("deletes the friendship doc", async () => {
    mockDeleteDoc.mockResolvedValue(undefined);
    await removeFriend("uid-a_uid-b");
    expect(mockDeleteDoc).toHaveBeenCalledWith({
      col: "friendships",
      id: "uid-a_uid-b",
    });
  });
});
