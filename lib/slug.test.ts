import { describe, it, expect } from "vitest";
import { slugify, isValidUsername, MAX_USERNAME_LENGTH } from "./slug";

describe("slugify", () => {
  it("lowercases and joins words", () => {
    expect(slugify("Mason Russell")).toBe("masonrussell");
  });

  it("strips punctuation, whitespace, and symbols", () => {
    expect(slugify("  A.B_c! ")).toBe("abc");
    expect(slugify("john@example.com")).toBe("johnexamplecom");
  });

  it("keeps digits", () => {
    expect(slugify("Fan 2026")).toBe("fan2026");
  });

  it("drops non-ascii / emoji", () => {
    expect(slugify("José 🏟️ Díaz")).toBe("josdaz");
  });

  it("caps length at MAX_USERNAME_LENGTH", () => {
    const long = "a".repeat(50);
    expect(slugify(long)).toHaveLength(MAX_USERNAME_LENGTH);
  });

  it("returns empty string when nothing usable remains", () => {
    expect(slugify("!!! ___ ...")).toBe("");
  });
});

describe("isValidUsername", () => {
  it("requires at least 3 characters", () => {
    expect(isValidUsername("ab")).toBe(false);
    expect(isValidUsername("abc")).toBe(true);
  });
});
