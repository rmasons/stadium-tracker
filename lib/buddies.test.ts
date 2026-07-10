import { describe, it, expect, vi, beforeEach } from "vitest";
import { subscribeToBuddies, addBuddy, renameBuddy, removeBuddy } from "./buddies";

const { mockAddDoc, mockUpdateDoc, mockDeleteDoc, mockOnSnapshot, mockGetDb } =
  vi.hoisted(() => ({
    mockAddDoc: vi.fn(),
    mockUpdateDoc: vi.fn(),
    mockDeleteDoc: vi.fn(),
    mockOnSnapshot: vi.fn(),
    mockGetDb: vi.fn((): Record<string, unknown> | null => ({})),
  }));

vi.mock("firebase/firestore", () => ({
  addDoc: mockAddDoc,
  collection: vi.fn((_db: unknown, ...segments: string[]) => ({ segments })),
  deleteDoc: mockDeleteDoc,
  doc: vi.fn((_db: unknown, ...segments: string[]) => ({ segments })),
  onSnapshot: mockOnSnapshot,
  updateDoc: mockUpdateDoc,
}));

vi.mock("./firebase", () => ({ getDb: mockGetDb }));

beforeEach(() => {
  vi.clearAllMocks();
  mockGetDb.mockReturnValue({});
});

describe("addBuddy", () => {
  it("trims the name and writes { name, createdAt }", async () => {
    mockAddDoc.mockResolvedValue({ id: "buddy-1" });
    const id = await addBuddy("uid-a", "  Jamie  ");
    expect(id).toBe("buddy-1");
    const [, data] = mockAddDoc.mock.calls[0];
    expect(data.name).toBe("Jamie");
    expect(data.createdAt).toBeTypeOf("number");
  });

  it("rejects an empty name", async () => {
    await expect(addBuddy("uid-a", "")).rejects.toThrow(/empty/i);
    expect(mockAddDoc).not.toHaveBeenCalled();
  });

  it("rejects a whitespace-only name", async () => {
    await expect(addBuddy("uid-a", "   ")).rejects.toThrow(/empty/i);
    expect(mockAddDoc).not.toHaveBeenCalled();
  });
});

describe("renameBuddy", () => {
  it("rejects an empty name", async () => {
    await expect(renameBuddy("uid-a", "buddy-1", "  ")).rejects.toThrow(
      /empty/i,
    );
    expect(mockUpdateDoc).not.toHaveBeenCalled();
  });

  it("calls updateDoc with the trimmed name", async () => {
    mockUpdateDoc.mockResolvedValue(undefined);
    await renameBuddy("uid-a", "buddy-1", "  Jamie  ");
    const [ref, patch] = mockUpdateDoc.mock.calls[0];
    expect(ref).toEqual({ segments: ["users", "uid-a", "buddies", "buddy-1"] });
    expect(patch).toEqual({ name: "Jamie" });
  });
});

describe("removeBuddy", () => {
  it("deletes the right ref", async () => {
    mockDeleteDoc.mockResolvedValue(undefined);
    await removeBuddy("uid-a", "buddy-1");
    expect(mockDeleteDoc).toHaveBeenCalledWith({
      segments: ["users", "uid-a", "buddies", "buddy-1"],
    });
  });
});

describe("subscribeToBuddies", () => {
  it("returns a no-op unsubscribe and emits [] when getDb() is null", () => {
    mockGetDb.mockReturnValue(null);
    const onData = vi.fn();
    const unsubscribe = subscribeToBuddies("uid-a", onData);
    expect(onData).toHaveBeenCalledWith([]);
    expect(mockOnSnapshot).not.toHaveBeenCalled();
    expect(() => unsubscribe()).not.toThrow();
  });

  it("maps and sorts snapshot docs by name", () => {
    const onData = vi.fn();
    mockOnSnapshot.mockImplementation((_col, onNext) => {
      onNext({
        docs: [
          { id: "b2", data: () => ({ name: "Zoe", createdAt: 2 }) },
          { id: "b1", data: () => ({ name: "Amy", createdAt: 1 }) },
        ],
      });
      return () => {};
    });
    subscribeToBuddies("uid-a", onData);
    expect(onData).toHaveBeenCalledWith([
      { id: "b1", name: "Amy", createdAt: 1 },
      { id: "b2", name: "Zoe", createdAt: 2 },
    ]);
  });
});
