import { describe, expect, it } from "vitest";
import {
  indexCanonicalTools,
  isDuplicatePickPage,
  listingCanonicalPath,
  matchCanonicalTool,
  normalizeToolName,
  officialUrlIdentity,
  type CanonicalListing,
} from "./toolCanonical";

const ASSEMBLL_TOOLS = "reclaXkdyTVgOB6Pfg3";
const ASSEMBLL_PICK = "rec1ESfCTe9kDPs8fL6";

function listing(
  partial: Partial<CanonicalListing> & Pick<CanonicalListing, "id" | "name">
): CanonicalListing {
  return {
    tableKey: "tools",
    url: "",
    ...partial,
  };
}

const assembllTool = listing({
  id: ASSEMBLL_TOOLS,
  name: "assembll",
  url: "https://assembll.xyz/create",
});

function picks(id: string, name: string, url: string): CanonicalListing {
  return { tableKey: "thisWeeksAiPicks", id, name, url };
}

describe("official URL and name keys", () => {
  it("folds www, case, query, hash, and a trailing slash into one key", () => {
    expect(
      officialUrlIdentity(
        "https://www.Assembll.xyz/create/?utm_source=pick#top"
      )
    ).toEqual(officialUrlIdentity("https://assembll.xyz/create"));
  });

  it("treats /index.html as the site root", () => {
    expect(officialUrlIdentity("https://glasspage.ai/index.html").key).toBe(
      officialUrlIdentity("https://glasspage.ai").key
    );
  });

  it("keeps a non-default port so two services on one host stay distinct", () => {
    expect(officialUrlIdentity("https://example.com:8443/app").key).not.toBe(
      officialUrlIdentity("https://example.com/app").key
    );
  });

  it("ignores a blank or non-http URL", () => {
    expect(officialUrlIdentity("").key).toBe("");
    expect(officialUrlIdentity("not a url").key).toBe("");
  });

  it("strips punctuation and spaces from a product name", () => {
    expect(normalizeToolName("UI Verify")).toBe("uiverify");
    expect(normalizeToolName("UI-Verify")).toBe("uiverify");
    expect(normalizeToolName("Arts & Crafts")).toBe(
      normalizeToolName("Arts and Crafts")
    );
  });
});

describe("picks canonical", () => {
  const index = indexCanonicalTools([
    assembllTool,
    listing({
      id: "recGlassOther",
      name: "Glass Page",
      url: "https://other-glass.example/app",
    }),
  ]);

  it("points assembll at the tools row when the official URL matches", () => {
    const pick = picks(
      ASSEMBLL_PICK,
      "assembll",
      "https://www.assembll.xyz/create?ref=weekly"
    );
    expect(matchCanonicalTool(pick, index)).toEqual({
      id: ASSEMBLL_TOOLS,
      reason: "url",
    });
    expect(listingCanonicalPath(pick, index)).toBe(
      `/tool/tools/${ASSEMBLL_TOOLS}`
    );
    expect(isDuplicatePickPage(pick, index)).toBe(true);
  });

  it("matches the same site at two paths when the name also matches", () => {
    const pick = picks(ASSEMBLL_PICK, "Assembll", "https://assembll.xyz");
    expect(matchCanonicalTool(pick, index)).toEqual({
      id: ASSEMBLL_TOOLS,
      reason: "host-and-name",
    });
  });

  it("keeps a picks page that has no tools row self-canonical and in the sitemap", () => {
    const pick = picks(
      "recVSad6uoHAzAk96nF",
      "Glass Page",
      "https://glasspage.ai"
    );
    expect(matchCanonicalTool(pick, index)).toBeNull();
    expect(listingCanonicalPath(pick, index)).toBe(
      "/tool/thisWeeksAiPicks/recVSad6uoHAzAk96nF"
    );
    expect(isDuplicatePickPage(pick, index)).toBe(false);
  });

  it("uses the hostname to tell same-name products apart", () => {
    const named = indexCanonicalTools([
      listing({
        id: "recA",
        name: "Atlas",
        url: "https://atlas-one.example",
      }),
      listing({
        id: "recB",
        name: "Atlas",
        url: "https://atlas-two.example",
      }),
    ]);
    expect(
      matchCanonicalTool(
        picks("recP", "Atlas", "https://atlas-two.example/pricing"),
        named
      )?.id
    ).toBe("recB");
    expect(
      matchCanonicalTool(
        picks("recP", "Atlas", "https://atlas-three.example"),
        named
      )
    ).toBeNull();
    expect(matchCanonicalTool(picks("recP", "Atlas", ""), named)).toBeNull();
  });

  it("matches by name when one official URL is missing", () => {
    const named = indexCanonicalTools([
      listing({ id: "recTool", name: "Pinecall", url: "" }),
    ]);
    expect(
      matchCanonicalTool(
        picks("recPick", "Pinecall", "https://pinecall.io"),
        named
      )
    ).toEqual({ id: "recTool", reason: "name" });

    const namedSite = indexCanonicalTools([
      listing({
        id: "recTool",
        name: "Pinecall",
        url: "https://pinecall.io",
      }),
    ]);
    expect(
      matchCanonicalTool(picks("recPick", "Pinecall", ""), namedSite)
    ).toEqual({ id: "recTool", reason: "name" });
  });

  it("does not treat a one- or two-letter name as a match", () => {
    const named = indexCanonicalTools([
      listing({ id: "recAi", name: "AI", url: "" }),
    ]);
    expect(matchCanonicalTool(picks("recP", "AI", ""), named)).toBeNull();
  });

  it("matches on the URL even when the display names differ", () => {
    const pick = picks(
      ASSEMBLL_PICK,
      "assembll studio",
      "https://assembll.xyz/create"
    );
    expect(matchCanonicalTool(pick, index)).toEqual({
      id: ASSEMBLL_TOOLS,
      reason: "url",
    });
  });

  it("prefers the same name, then the lowest id, when several tools rows share a URL", () => {
    const shared = indexCanonicalTools([
      listing({
        id: "recB",
        name: "Something else",
        url: "https://assembll.xyz/create",
      }),
      listing({
        id: "recZ",
        name: "assembll",
        url: "https://assembll.xyz/create",
      }),
      listing({
        id: "recA",
        name: "assembll",
        url: "https://assembll.xyz/create",
      }),
    ]);
    expect(
      matchCanonicalTool(
        picks(ASSEMBLL_PICK, "assembll", "https://assembll.xyz/create"),
        shared
      )?.id
    ).toBe("recA");
  });

  it("leaves every other feed self-canonical, including a tools duplicate", () => {
    const other = listing({
      tableKey: "videoImage",
      id: "recVideo",
      name: "assembll",
      url: "https://assembll.xyz/create",
    });
    expect(listingCanonicalPath(other, index)).toBe(
      "/tool/videoImage/recVideo"
    );
    expect(isDuplicatePickPage(other, index)).toBe(false);
    expect(listingCanonicalPath(assembllTool, index)).toBe(
      `/tool/tools/${ASSEMBLL_TOOLS}`
    );
  });
});
