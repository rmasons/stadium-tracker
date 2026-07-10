// @vitest-environment jsdom
import { afterEach, describe, it, expect, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { AttendeePicker } from "./AttendeePicker";
import type { Buddy, FriendProfile } from "@/lib/types";

afterEach(cleanup);

const buddy: Buddy = { id: "b1", name: "Jamie", createdAt: 0 };
const friend: FriendProfile = {
  uid: "u1",
  username: "alex",
  displayName: "Alex",
  photoURL: "",
};

describe("AttendeePicker", () => {
  it("renders nothing when there are no buddies or friends", () => {
    const { container } = render(
      <AttendeePicker
        buddies={[]}
        friends={[]}
        selectedBuddyIds={[]}
        selectedFriendUids={[]}
        onChange={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a chip per buddy", () => {
    render(
      <AttendeePicker
        buddies={[buddy]}
        friends={[]}
        selectedBuddyIds={[]}
        selectedFriendUids={[]}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Jamie" })).toBeInTheDocument();
  });

  it("hides the friends section when there are no friends", () => {
    render(
      <AttendeePicker
        buddies={[buddy]}
        friends={[]}
        selectedBuddyIds={[]}
        selectedFriendUids={[]}
        onChange={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: "Alex" })).toBeNull();
  });

  it("toggles a buddy chip on, then off", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <AttendeePicker
        buddies={[buddy]}
        friends={[]}
        selectedBuddyIds={[]}
        selectedFriendUids={[]}
        onChange={onChange}
      />,
    );
    const chip = screen.getByRole("button", { name: "Jamie" });
    expect(chip).toHaveAttribute("aria-pressed", "false");

    chip.click();
    expect(onChange).toHaveBeenLastCalledWith(["b1"], []);

    rerender(
      <AttendeePicker
        buddies={[buddy]}
        friends={[]}
        selectedBuddyIds={["b1"]}
        selectedFriendUids={[]}
        onChange={onChange}
      />,
    );
    expect(screen.getByRole("button", { name: "Jamie" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    screen.getByRole("button", { name: "Jamie" }).click();
    expect(onChange).toHaveBeenLastCalledWith([], []);
  });

  it("toggles a friend chip and fires onChange with the uid", () => {
    const onChange = vi.fn();
    render(
      <AttendeePicker
        buddies={[]}
        friends={[friend]}
        selectedBuddyIds={[]}
        selectedFriendUids={[]}
        onChange={onChange}
      />,
    );
    screen.getByRole("button", { name: "Alex" }).click();
    expect(onChange).toHaveBeenLastCalledWith([], ["u1"]);
  });
});
