// @vitest-environment jsdom
import { afterEach, describe, it, expect, vi } from "vitest";
import {
  cleanup,
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { StadiumDetail } from "./StadiumDetail";
import { STADIUMS_BY_ID } from "@/lib/stadiums";
import type { Visit } from "@/lib/types";

afterEach(cleanup);

const stadium = STADIUMS_BY_ID["mlb-yankees"];

function visit(id: string, date: string, opponent = "", createdAt = 0): Visit {
  return {
    id,
    stadiumId: "mlb-yankees",
    league: "MLB",
    date,
    opponent,
    createdAt,
    updatedAt: createdAt,
  };
}

function noop() {
  return Promise.resolve();
}

describe("StadiumDetail", () => {
  it("renders the stadium name, team, city, and league", () => {
    render(
      <StadiumDetail
        stadium={stadium}
        visits={[]}
        canEdit={false}
        onClose={vi.fn()}
        onAdd={noop}
        onRemove={noop}
      />,
    );
    expect(screen.getByText("Yankee Stadium")).toBeInTheDocument();
    expect(screen.getByText("New York Yankees")).toBeInTheDocument();
    expect(screen.getByText(/Bronx, NY/)).toBeInTheDocument();
    expect(screen.getByText("MLB")).toBeInTheDocument();
  });

  it("lists existing visits with a count", () => {
    render(
      <StadiumDetail
        stadium={stadium}
        visits={[
          visit("a", "2024-05-01", "Red Sox", 2),
          visit("b", "2023-08-12", "Orioles", 1),
        ]}
        canEdit={false}
        onClose={vi.fn()}
        onAdd={noop}
        onRemove={noop}
      />,
    );
    expect(screen.getByText(/been here 2 times/i)).toBeInTheDocument();
    expect(screen.getByText(/2024-05-01/)).toBeInTheDocument();
    expect(screen.getByText(/Orioles/)).toBeInTheDocument();
  });

  it("prompts to sign in when not editable and no visits", () => {
    render(
      <StadiumDetail
        stadium={stadium}
        visits={[]}
        canEdit={false}
        onClose={vi.fn()}
        onAdd={noop}
        onRemove={noop}
      />,
    );
    expect(screen.getByText(/sign in with google/i)).toBeInTheDocument();
  });

  it("adds a visit with the entered date and opponent", async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(
      <StadiumDetail
        stadium={stadium}
        visits={[]}
        canEdit
        onClose={vi.fn()}
        onAdd={onAdd}
        onRemove={noop}
      />,
    );
    fireEvent.change(screen.getByLabelText(/date visited/i), {
      target: { value: "2024-07-01" },
    });
    fireEvent.change(screen.getByLabelText(/opponent/i), {
      target: { value: "Red Sox" },
    });
    fireEvent.click(screen.getByRole("button", { name: /i've been here/i }));

    await waitFor(() =>
      expect(onAdd).toHaveBeenCalledWith({
        date: "2024-07-01",
        opponent: "Red Sox",
      }),
    );
  });

  it("removes a specific visit by id", async () => {
    const onRemove = vi.fn().mockResolvedValue(undefined);
    render(
      <StadiumDetail
        stadium={stadium}
        visits={[visit("visit-123", "2024-05-01")]}
        canEdit
        onClose={vi.fn()}
        onAdd={noop}
        onRemove={onRemove}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /remove visit/i }));
    await waitFor(() => expect(onRemove).toHaveBeenCalledWith("visit-123"));
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <StadiumDetail
        stadium={stadium}
        visits={[]}
        canEdit
        onClose={onClose}
        onAdd={noop}
        onRemove={noop}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
