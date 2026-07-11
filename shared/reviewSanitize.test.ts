import { describe, expect, it } from "vitest";
import {
  cleanReviewText,
  cleanVerdict,
  hostnameOf,
  isJunkReviewText,
  isPlaceholderValue,
  splitReviewItems,
  validHttpUrl,
} from "./reviewSanitize";

describe("isPlaceholderValue", () => {
  it.each(["Unknown", "unknown", "N/A", "n/a", "NA", "None", "TBD", "-", "—", "", "  ", "Unverified", "(unverified)", "[N/A]", "Not available", "Pricing unknown", "Unable to determine", "Unable to be determined from available data"])(
    "treats %j as a placeholder",
    (v) => expect(isPlaceholderValue(v)).toBe(true)
  );

  it.each(["Free tier available", "$9/user/mo", "Solo free; Essentials pricing on request", "Unknown Industries Inc"])(
    "keeps real value %j",
    (v) => expect(isPlaceholderValue(v)).toBe(false)
  );
});

describe("isJunkReviewText", () => {
  it.each([
    "unverified, domain inaccessible",
    "Product details unverifiable, insufficient information to make reliable assessment",
    "Unable to verify - domain not found",
    "Cost is unverified; domain inaccessible",
    "website is down",
    "Site was unreachable during review",
    "could not be verified",
    "404 not found",
    "insufficient information",
  ])("flags verification junk %j", (v) => expect(isJunkReviewText(v)).toBe(true));

  it.each([
    "Free tier (limited monthly credits); Pro $29.99/mo",
    "Best for Apple-ecosystem users who prioritize UI polish",
    "Polished, thoughtful UX with backlinking capabilities",
    "no public API documentation visible beyond basic functionality",
  ])("keeps real review text %j", (v) => expect(isJunkReviewText(v)).toBe(false));
});

describe("splitReviewItems", () => {
  it("splits on semicolons and newlines, trims bullets", () => {
    expect(splitReviewItems("• Fast sync; - Cheap plans\nGreat support")).toEqual([
      "Fast sync",
      "Cheap plans",
      "Great support",
    ]);
  });

  it("drops placeholder and junk items but keeps the rest", () => {
    expect(
      splitReviewItems("All-in-one workspace; unknown; unable to verify domain; 14-day free trial")
    ).toEqual(["All-in-one workspace", "14-day free trial"]);
  });

  it("returns [] for empty or fully-junk cells", () => {
    expect(splitReviewItems(undefined)).toEqual([]);
    expect(splitReviewItems("Unknown")).toEqual([]);
    expect(splitReviewItems("N/A; unverified")).toEqual([]);
  });
});

describe("cleanReviewText", () => {
  it("keeps real cost strings, including ones ending in parentheses", () => {
    expect(cleanReviewText("$60/month (all features included)")).toBe(
      "$60/month (all features included)"
    );
  });

  it("drops placeholders and verification junk", () => {
    expect(cleanReviewText("(unverified)")).toBe("");
    expect(cleanReviewText("unverified, domain inaccessible")).toBe("");
    expect(cleanReviewText(undefined)).toBe("");
  });
});

describe("cleanVerdict", () => {
  it.each([
    "Cannot assess due to URL pointing to unrelated web design tool.",
    "Unable to determine product quality from available information.",
    "Product details unverifiable, insufficient information to make reliable assessment",
    "Could not verify the product exists.",
  ])("omits non-verdict %j", (v) => expect(cleanVerdict(v)).toBe(""));

  it("keeps a real verdict", () => {
    const v = "Best for small service teams wanting to consolidate tools.";
    expect(cleanVerdict(v)).toBe(v);
  });
});

describe("validHttpUrl", () => {
  it("passes real http(s) URLs", () => {
    expect(validHttpUrl("https://example.com/x")).toBe("https://example.com/x");
    expect(validHttpUrl("http://example.com")).toBe("http://example.com");
  });

  it("rejects placeholders and non-URLs", () => {
    expect(validHttpUrl("N/A")).toBe("");
    expect(validHttpUrl("Unknown")).toBe("");
    expect(validHttpUrl("www.example.com")).toBe("");
    expect(validHttpUrl("")).toBe("");
  });
});

describe("hostnameOf", () => {
  it("returns bare hostname without www", () => {
    expect(hostnameOf("https://www.example.com/path?q=1")).toBe("example.com");
    expect(hostnameOf("https://sub.example.co/x")).toBe("sub.example.co");
  });

  it("returns empty for unparsable input", () => {
    expect(hostnameOf("not a url")).toBe("");
    expect(hostnameOf("")).toBe("");
  });
});
