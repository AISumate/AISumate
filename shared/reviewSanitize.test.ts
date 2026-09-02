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

  // Notes about OUR record, saved into public review fields. They read like
  // product criticism, survive after the record is corrected, and were being
  // published as Cons and Verdicts — Otter's Verdict was one of these.
  it.each([
    "Data quality issue: affiliate link provided instead of official domain; product category and summary mismatch.",
    "URL provided is affiliate link (not official product domain)",
    "Generic LLM summary does not match actual product (transcription, not inference)",
    "Source data unreliable",
    "No website content available to verify actual function",
    "generic placeholder summary suggests poor data quality",
    "Cannot recommend: the URL is an affiliate/partner referral link, not the official product domain.",
    "Cannot evaluate: URL provided is a partner affiliate link, not the official domain",
    "appears to be duplicate listing with potential data quality issue",
    "pricing and features not verified",
    "Problema de calidad de datos: se proporcionó enlace de afiliado en lugar de dominio oficial",
    "Datos de origen no confiables",
    "No se puede evaluar: la URL proporcionada es un enlace de afiliado asociado, no el dominio oficial",
    "actual destination unclear",
    "insufficient detail for meaningful assessment",
    "no verified pricing information",
    "resumen genérico e no informativo",
    "Información del producto inaccesible",
    "provided URL redirects through affiliate link (appwiki.nl)",
    "la URL proporcionada se redirige a través de un enlace de afiliado (appwiki.nl)",
    "URL points to appwiki.nl rather than the vendor",
    "original affiliate link obscures official domain",
    "affiliate link in URL (?via=francesco-d-alessio) raises transparency concerns",
    "pricing not accessible via affiliate link",
    "Referral URL format suggests affiliate link rather than official product landing",
    "URL contains tracking parameters suggesting marketing affiliate link",
    "pricing not directly accessible through affiliate link",
    "Generic summary provides no meaningful description of product function",
    "Extremely generic summary provides no specifics",
    "website appears inaccessible",
    "Standard iOS habit tracker for personal use, but misclassified as AI/LLM",
    "Cannot recommend—product purpose is unclear from available description",
    "Resumen genérico de marcador de posición sin características específicas",
    "affiliate link prevents direct pricing verification",
    "affiliate link makes direct pricing verification difficult",
    "el enlace de afiliado impide la verificación directa de precios",
  ])("flags an editorial note about the record %j", (v) =>
    expect(isJunkReviewText(v)).toBe(true)
  );

  // The narrow phrasing above must not swallow genuine criticism of a product
  // that happens to be about affiliates, data handling or verification.
  it.each([
    "Runs a generous affiliate programme with a 30% recurring commission",
    "Affiliate payouts are slow and the dashboard is dated",
    "Data quality depends heavily on how well you tag your own sources",
    "No official mobile app; the web view is the only supported client",
    "Free plan is generic and most useful features sit behind the Pro tier",
    "Summary reports are template-driven and hard to customise",
    "Duplicate contacts are merged automatically, which can be hard to undo",
    "The affiliate dashboard is dated and payouts take 60 days",
    "Referral rewards are capped at three invites per account",
    "Tracking pixels fire on every page, which some teams will not accept",
    "Generates a summary for every meeting, even short ones",
    "The onboarding description is thin but the docs are excellent",
    "Exports are inaccessible on the free plan",
  ])("keeps genuine product criticism %j", (v) =>
    expect(isJunkReviewText(v)).toBe(false)
  );
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
