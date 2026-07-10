// @vitest-environment jsdom
import { afterEach, describe, it, expect, vi } from "vitest";
import { cleanup, render, screen, fireEvent, within } from "@testing-library/react";
import { VisitedList } from "./VisitedList";
import type { Visit } from "@/lib/types";

afterEach(cleanup);

let seq = 0;
function visit(stadiumId: string, date = "", opponent = ""): Visit {
  seq += 1;
  return {
    id: `v${seq}`,
    stadiumId,
    league: "MLB",
    date,
    opponent,
    createdAt: 0,
    updatedAt: 0,
    buddyIds: [],
    friendUids: [],
  };
}

/** Return the data rows (skip the header row) as their text content. */
function dataRowText(): string[] {
  const rows = screen.getAllByRole("row");
  return rows.slice(1).map((r) => r.textContent ?? "");
}

describe("VisitedList", () => {
  it("shows an empty state when there are no visits", () => {
    render(<VisitedList visits={[]} />);
    expect(screen.getByText(/no stadiums visited yet/i)).toBeInTheDocument();
  });

  it("renders one row per visit, including repeat visits", () => {
    render(
      <VisitedList
        visits={[
          visit("mlb-yankees", "2024-05-01", "Red Sox"),
          visit("mlb-yankees", "2023-08-12", "Orioles"),
        ]}
      />,
    );
    const rows = dataRowText();
    expect(rows).toHaveLength(2);
    // Both rows are the same stadium but distinct visits/opponents.
    expect(rows.join(" ")).toContain("Yankee Stadium");
    expect(rows.join(" ")).toContain("Red Sox");
    expect(rows.join(" ")).toContain("Orioles");
  });

  it("re-sorts when a column header is clicked", () => {
    render(
      <VisitedList
        visits={[
          visit("mlb-yankees", "2024-05-01"), // New York Yankees
          visit("mlb-braves", "2023-04-10"), // Atlanta Braves
        ]}
      />,
    );
    // Default sort is date descending -> newest (Yankees) first.
    expect(dataRowText()[0]).toContain("New York Yankees");

    // Sort by team ascending -> Atlanta Braves first.
    fireEvent.click(screen.getByRole("button", { name: /team/i }));
    expect(dataRowText()[0]).toContain("Atlanta Braves");

    // Clicking again flips direction -> Yankees first.
    fireEvent.click(screen.getByRole("button", { name: /team/i }));
    expect(dataRowText()[0]).toContain("New York Yankees");
  });

  it("calls onRemove with the visit id when editable", () => {
    const onRemove = vi.fn();
    const v = visit("mlb-yankees", "2024-05-01");
    render(<VisitedList visits={[v]} editable onRemove={onRemove} />);
    fireEvent.click(screen.getByRole("button", { name: /remove/i }));
    expect(onRemove).toHaveBeenCalledWith(v.id);
  });

  it("shows no remove controls when not editable", () => {
    render(<VisitedList visits={[visit("mlb-yankees", "2024-05-01")]} />);
    const dataRow = screen.getAllByRole("row")[1];
    expect(
      within(dataRow).queryByRole("button", { name: /remove/i }),
    ).toBeNull();
  });
});
