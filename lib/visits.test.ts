import { describe, it, expect, vi, beforeEach } from "vitest";
import { addVisit, updateVisit } from "./visits";

const { mockAddDoc, mockUpdateDoc, mockGetDb } = vi.hoisted(() => ({
  mockAddDoc: vi.fn(),
  mockUpdateDoc: vi.fn(),
  mockGetDb: vi.fn(() => ({})),
}));

vi.mock("firebase/firestore", () => ({
  addDoc: mockAddDoc,
  collection: vi.fn((_db: unknown, ...segments: string[]) => ({ segments })),
  deleteDoc: vi.fn(),
  doc: vi.fn((_db: unknown, ...segments: string[]) => ({ segments })),
  getDocs: vi.fn(),
  onSnapshot: vi.fn(),
  updateDoc: mockUpdateDoc,
}));

vi.mock("./firebase", () => ({ getDb: mockGetDb }));

beforeEach(() => {
  vi.clearAllMocks();
  mockGetDb.mockReturnValue({});
});

describe("addVisit", () => {
  it("defaults buddyIds/friendUids to [] when omitted", async () => {
    mockAddDoc.mockResolvedValue({ id: "visit-1" });
    await addVisit("uid-a", {
      stadiumId: "mlb-yankees",
      date: "2024-06-01",
      opponent: "Red Sox",
    });
    const [, data] = mockAddDoc.mock.calls[0];
    expect(data.buddyIds).toEqual([]);
    expect(data.friendUids).toEqual([]);
  });

  it("writes provided buddyIds/friendUids", async () => {
    mockAddDoc.mockResolvedValue({ id: "visit-1" });
    await addVisit("uid-a", {
      stadiumId: "mlb-yankees",
      date: "2024-06-01",
      opponent: "Red Sox",
      buddyIds: ["b1"],
      friendUids: ["uid-b"],
    });
    const [, data] = mockAddDoc.mock.calls[0];
    expect(data.buddyIds).toEqual(["b1"]);
    expect(data.friendUids).toEqual(["uid-b"]);
  });
});

describe("updateVisit", () => {
  it("omits buddyIds/friendUids from the patch when not provided", async () => {
    mockUpdateDoc.mockResolvedValue(undefined);
    await updateVisit("uid-a", "visit-1", {
      date: "2024-06-02",
      opponent: "Orioles",
    });
    const [, patch] = mockUpdateDoc.mock.calls[0];
    expect(patch).not.toHaveProperty("buddyIds");
    expect(patch).not.toHaveProperty("friendUids");
    expect(patch.date).toBe("2024-06-02");
    expect(patch.opponent).toBe("Orioles");
  });

  it("includes buddyIds/friendUids in the patch when provided", async () => {
    mockUpdateDoc.mockResolvedValue(undefined);
    await updateVisit("uid-a", "visit-1", {
      date: "2024-06-02",
      opponent: "Orioles",
      buddyIds: ["b1", "b2"],
      friendUids: [],
    });
    const [, patch] = mockUpdateDoc.mock.calls[0];
    expect(patch.buddyIds).toEqual(["b1", "b2"]);
    expect(patch.friendUids).toEqual([]);
  });
});
