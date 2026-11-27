import { describe, it, expect } from "vitest";
import { metaDescription } from "./metaDescription";

describe("metaDescription", () => {
  it("leaves a short description untouched", () => {
    expect(metaDescription("A compact summary.")).toBe("A compact summary.");
  });

  it("normalises whitespace and handles empty input", () => {
    expect(metaDescription("  two   lines\nhere ")).toBe("two lines here");
    expect(metaDescription(undefined)).toBe("");
    expect(metaDescription("")).toBe("");
  });

  it("ends on a complete sentence when a substantial one fits", () => {
    const first =
      "Assembll is a free desktop studio where your own AI coding agents each build in their own sandbox.";
    const text =
      first +
      " You review every diff before it lands on your branch, and nothing is pushed without approval.";
    // Long enough to be worth showing on its own, and the whole text overflows.
    expect(first.length).toBeGreaterThan(96);
    expect(text.length).toBeGreaterThan(160);
    const out = metaDescription(text);
    expect(out).toBe(first);
    expect(out.endsWith("…")).toBe(false);
  });

  it("prefers a fuller word-cut over a very short opening sentence", () => {
    const text =
      "Free. " +
      "An AI infrastructure platform for vectors and database tooling that serves teams running " +
      "retrieval pipelines at very large scale across many regions every single day of the year.";
    expect(text.length).toBeGreaterThan(160);
    const out = metaDescription(text);
    // "Free." is too short to be the whole snippet, so it must not win.
    expect(out).not.toBe("Free.");
    expect(out.endsWith("…")).toBe(true);
    expect(out.length).toBeLessThanOrEqual(160);
  });

  it("never cuts mid-word", () => {
    const text = "word ".repeat(80).trim();
    const out = metaDescription(text);
    expect(out.endsWith("…")).toBe(true);
    // Everything before the ellipsis is whole words.
    expect(out.slice(0, -1).trim().split(" ").every(w => w === "word")).toBe(true);
  });

  it("respects the limit, including the ellipsis", () => {
    const text = "alpha beta gamma delta epsilon zeta eta theta iota kappa ".repeat(6);
    for (const limit of [60, 120, 160, 200]) {
      expect(metaDescription(text, limit).length).toBeLessThanOrEqual(limit);
    }
  });

  it("drops dangling punctuation before the ellipsis", () => {
    const text =
      "Indexes large photo and video libraries so you can search them, " +
      "and then works with the results across every project you keep in the workspace right now.";
    const out = metaDescription(text, 70);
    expect(out).not.toMatch(/[,;:\-–—(]…$/);
    expect(out.endsWith("…")).toBe(true);
  });

  it("handles a single word longer than the limit", () => {
    const out = metaDescription("x".repeat(300), 50);
    expect(out.length).toBeLessThanOrEqual(50);
    expect(out.endsWith("…")).toBe(true);
  });

  it("is stable across repeated calls (no shared regex state)", () => {
    const text =
      "One sentence here that is reasonably long. Another sentence follows it and keeps going well past the limit for sure.";
    const first = metaDescription(text);
    expect(metaDescription(text)).toBe(first);
    expect(metaDescription(text)).toBe(first);
  });
});
