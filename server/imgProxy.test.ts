import { describe, it, expect, vi } from "vitest";

/**
 * The signer derives its secret from TEABLE_API_KEY at module load, so each
 * scenario re-imports the module with the env it needs.
 */
async function loadWithKey(key: string) {
  vi.resetModules();
  const prev = process.env.TEABLE_API_KEY;
  process.env.TEABLE_API_KEY = key;
  const mod = await import("./imgProxy");
  process.env.TEABLE_API_KEY = prev;
  return mod;
}

describe("imgProxy signing", () => {
  it("rewrites an absolute image URL to a signed same-origin path", async () => {
    const { proxyImg, verifySig } = await loadWithKey("test-key-1");
    const src = "https://cdn.example.com/og.png";
    const out = proxyImg(src);
    expect(out.startsWith("/api/img?src=")).toBe(true);
    const params = new URLSearchParams(out.slice(out.indexOf("?") + 1));
    expect(params.get("src")).toBe(src);
    const sig = params.get("sig")!;
    expect(sig).toMatch(/^[0-9a-f]{32}$/);
    expect(verifySig(src, sig)).toBe(true);
  });

  it("rejects tampered src or sig", async () => {
    const { proxyImg, verifySig } = await loadWithKey("test-key-1");
    const out = proxyImg("https://cdn.example.com/og.png");
    const sig = new URLSearchParams(out.slice(out.indexOf("?") + 1)).get("sig")!;
    expect(verifySig("https://evil.example.com/x.png", sig)).toBe(false);
    expect(verifySig("https://cdn.example.com/og.png", "0".repeat(32))).toBe(false);
    expect(verifySig("https://cdn.example.com/og.png", "")).toBe(false);
  });

  it("signs depend on the secret", async () => {
    const a = await loadWithKey("key-a");
    const sigA = new URLSearchParams(
      a.proxyImg("https://x.com/i.png").split("?")[1],
    ).get("sig");
    const b = await loadWithKey("key-b");
    const sigB = new URLSearchParams(
      b.proxyImg("https://x.com/i.png").split("?")[1],
    ).get("sig");
    expect(sigA).not.toBe(sigB);
  });

  it("passes through empty, already-proxied, and non-http values", async () => {
    const { proxyImg } = await loadWithKey("test-key-1");
    expect(proxyImg("")).toBe("");
    const once = proxyImg("https://x.com/i.png");
    expect(proxyImg(once)).toBe(once);
    expect(proxyImg("javascript:alert(1)")).toBe("javascript:alert(1)");
    expect(proxyImg("/relative/path.png")).toBe("/relative/path.png");
  });

  it("disables proxying entirely when no key is configured", async () => {
    const { proxyImg, verifySig } = await loadWithKey("");
    expect(proxyImg("https://x.com/i.png")).toBe("https://x.com/i.png");
    expect(verifySig("https://x.com/i.png", "0".repeat(32))).toBe(false);
  });
});
