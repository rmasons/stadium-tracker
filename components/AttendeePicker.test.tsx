// @vitest-environment jsdom
import { afterEach, describe, it, expect, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { AttendeePicker, toggle } from "./AttendeePicker";
import { MAX_VISIT_BUDDIES, MAX_VISIT_FRIENDS } from "@/lib/limits";
import type { Buddy, FriendProfile } from "@/lib/types";

afterEach(cleanup);

const buddy: Buddy = { id: "b1", name: "Jamie", createdAt: 0 };
const friend: FriendProfile = {
  uid: "u1",
  username: "alex",
  displayName: "Alex",
  photoURL: "",
};

function makeBuddies(n: number): Buddy[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `b${i}`,
    name: `Buddy ${i}`,
    createdAt: 0,
  }));
}

function makeFriends(n: number): FriendProfile[] {
  return Array.from({ length: n }, (_, i) => ({
    uid: `u${i}`,
    username: `friend${i}`,
    displayName: `Friend ${i}`,
    photoURL: "",
  }));
}

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

  it("disables an unselected buddy chip at the cap and does not call onChange when clicked", () => {
    const buddies = makeBuddies(MAX_VISIT_BUDDIES + 1);
    const selectedBuddyIds = buddies
      .slice(0, MAX_VISIT_BUDDIES)
      .map((b) => b.id);
    const onChange = vi.fn();
    render(
      <AttendeePicker
        buddies={buddies}
        friends={[]}
        selectedBuddyIds={selectedBuddyIds}
        selectedFriendUids={[]}
        onChange={onChange}
      />,
    );
    const overflowChip = screen.getByRole("button", {
      name: buddies[MAX_VISIT_BUDDIES].name,
    });
    expect(overflowChip).toBeDisabled();
    expect(overflowChip).toHaveAttribute(
      "title",
      `Limit of ${MAX_VISIT_BUDDIES} per visit`,
    );
    overflowChip.click();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps a selected buddy chip enabled at the cap so it can still be deselected", () => {
    const buddies = makeBuddies(MAX_VISIT_BUDDIES);
    const selectedBuddyIds = buddies.map((b) => b.id);
    const onChange = vi.fn();
    render(
      <AttendeePicker
        buddies={buddies}
        friends={[]}
        selectedBuddyIds={selectedBuddyIds}
        selectedFriendUids={[]}
        onChange={onChange}
      />,
    );
    const chip = screen.getByRole("button", { name: buddies[0].name });
    expect(chip).not.toBeDisabled();
    chip.click();
    expect(onChange).toHaveBeenLastCalledWith(
      selectedBuddyIds.filter((id) => id !== buddies[0].id),
      [],
    );
  });

  it("disables an unselected friend chip at the cap and does not call onChange when clicked", () => {
    const friends = makeFriends(MAX_VISIT_FRIENDS + 1);
    const selectedFriendUids = friends
      .slice(0, MAX_VISIT_FRIENDS)
      .map((f) => f.uid);
    const onChange = vi.fn();
    render(
      <AttendeePicker
        buddies={[]}
        friends={friends}
        selectedBuddyIds={[]}
        selectedFriendUids={selectedFriendUids}
        onChange={onChange}
      />,
    );
    const overflowChip = screen.getByRole("button", {
      name: friends[MAX_VISIT_FRIENDS].displayName,
    });
    expect(overflowChip).toBeDisabled();
    overflowChip.click();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps a selected friend chip enabled at the cap so it can still be deselected", () => {
    const friends = makeFriends(MAX_VISIT_FRIENDS);
    const selectedFriendUids = friends.map((f) => f.uid);
    const onChange = vi.fn();
    render(
      <AttendeePicker
        buddies={[]}
        friends={friends}
        selectedBuddyIds={[]}
        selectedFriendUids={selectedFriendUids}
        onChange={onChange}
      />,
    );
    const chip = screen.getByRole("button", { name: friends[0].displayName });
    expect(chip).not.toBeDisabled();
    chip.click();
    expect(onChange).toHaveBeenLastCalledWith(
      [],
      selectedFriendUids.filter((uid) => uid !== friends[0].uid),
    );
  });
});

describe("toggle", () => {
  it("deselects an id already in the list regardless of cap", () => {
    expect(toggle(["a", "b"], "a", 1)).toEqual(["b"]);
  });

  it("adds an id when under the cap", () => {
    expect(toggle(["a"], "b", 2)).toEqual(["a", "b"]);
  });

  it("returns the list unchanged when adding would exceed the cap", () => {
    expect(toggle(["a", "b"], "c", 2)).toEqual(["a", "b"]);
  });
});
