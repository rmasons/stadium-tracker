// @vitest-environment jsdom
import { afterEach, describe, it, expect, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { BuddyManager } from "./BuddyManager";
import type { Buddy } from "@/lib/types";

afterEach(cleanup);

const buddyA: Buddy = { id: "a1", name: "Alice", createdAt: 0 };
const buddyB: Buddy = { id: "b1", name: "Bob", createdAt: 0 };

/** A promise that never settles, to simulate a slow/hanging request. */
function pending<T>() {
  return new Promise<T>(() => {});
}

describe("BuddyManager", () => {
  it("fires onAdd only once when Enter is pressed twice quickly", async () => {
    const onAdd = vi.fn(() => pending<void>());
    render(
      <BuddyManager
        buddies={[]}
        onAdd={onAdd}
        onRemove={vi.fn()}
        onRename={vi.fn()}
      />,
    );

    const input = screen.getByPlaceholderText("Name");
    fireEvent.change(input, { target: { value: "Charlie" } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("removing one row does not disable another row's buttons", async () => {
    const onRemove = vi.fn(() => pending<void>());
    render(
      <BuddyManager
        buddies={[buddyA, buddyB]}
        onAdd={vi.fn()}
        onRemove={onRemove}
        onRename={vi.fn()}
      />,
    );

    const aRow = screen.getByText("Alice").closest("li")!;
    const bRow = screen.getByText("Bob").closest("li")!;

    fireEvent.click(
      Array.from(aRow.querySelectorAll("button")).find(
        (b) => b.textContent === "Remove",
      )!,
    );

    expect(onRemove).toHaveBeenCalledTimes(1);

    const aButtons = Array.from(aRow.querySelectorAll("button"));
    const bButtons = Array.from(bRow.querySelectorAll("button"));

    for (const button of aButtons) {
      expect(button).toBeDisabled();
    }
    for (const button of bButtons) {
      expect(button).not.toBeDisabled();
    }
  });
});
