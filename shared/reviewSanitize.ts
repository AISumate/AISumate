/**
 * Data-quality rules shared by the server (Teable mappers) and the client
 * (review rendering). Single source of truth for what counts as placeholder
 * or verification-pipeline junk — covered by shared/reviewSanitize.test.ts,
 * which the CI pipeline runs on every change.
 */

/** Whole-value placeholders ("Unknown", "N/A", …) that mean "no real data". */
const PLACEHOLDER_RE =
  /^(unknown|unknowns?|n\/?a|none|null|nil|tbd|pending|-|—|no data( available)?|not (yet )?(determined|available|verified)|unable to (be )?determine(d)?( .*)?|unverified|not verified|pricing unknown( .*)?)\.?$/i;

/**
 * Verification-pipeline language, not product information. Any review text
 * carrying these signals is internal QA chatter and must never render.
 */
const VERIFICATION_JUNK_RE =
  /unverifiab|insufficient (information|data|details)|domain (is |was )?(inaccessible|not found|unreachable|dead|expired|parked)|(site|website|url) (is |was )?(down|inaccessible|unreachable|not found)|unable to (verify|access|reach|confirm)|could ?n[o']t (be )?(verif|access|reach|confirm)|cannot (be )?(verif|access|reach|confirm)|unable to determine|not verifiable|verification (failed|pending)|404 (error|not found)|unverified|cannot recommend|no ?puedo recomendar|unreachable|is offline|does not exist|no pricing (data |information )?(available|found)|search results show/i;

/** Strip decorative wrappers like "(unverified)" or "[N/A]." before testing. */
function normalize(text: string): string {
  return text.trim().replace(/^[(\[\s]+|[)\]\s.]+$/g, "");
}

/** True for strict whole-value placeholders ("Unknown", "N/A", "TBD", …). */
export function isPlaceholderValue(text: string): boolean {
  const n = normalize(text);
  return n.length === 0 || PLACEHOLDER_RE.test(n);
}

/** True when review text is a placeholder OR contains verification junk. */
export function isJunkReviewText(text: string): boolean {
  const n = normalize(text);
  return n.length === 0 || PLACEHOLDER_RE.test(n) || VERIFICATION_JUNK_RE.test(n);
}

/** Split a pros/cons cell (semicolon- or newline-separated) into clean items. */
export function splitReviewItems(text: string | undefined): string[] {
  if (!text) return [];
  return text
    .split(/;|\n/)
    .map((s) => s.trim().replace(/^[•\-–]\s*/, ""))
    .filter((s) => s.length > 1 && !isJunkReviewText(s));
}

/** Clean a single review text value (cost etc.) — "" when junk. */
export function cleanReviewText(text: string | undefined): string {
  const t = (text ?? "").trim();
  return t && !isJunkReviewText(t) ? t : "";
}

/** Verdicts that amount to "couldn't be determined" are omitted entirely. */
export function cleanVerdict(text: string | undefined): string {
  const t = cleanReviewText(text);
  if (!t) return "";
  return /^(cannot|can't|could not|couldn't|unable|product details)\b/i.test(t) ? "" : t;
}

/** Only real http(s) URLs pass — "Unknown"/"N/A" in a URL cell is not a link. */
export function validHttpUrl(v: string): string {
  const t = (v ?? "").trim();
  return /^https?:\/\//i.test(t) ? t : "";
}

/** Bare hostname of a URL for display or favicon lookup, "" if unparsable. */
export function hostnameOf(url: string): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
