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

/**
 * Notes our own pipeline wrote ABOUT A RECORD — wrong URL, thin source data,
 * duplicate listing — that were saved into the public review fields. They read
 * like product criticism but describe the catalogue, not the tool, and they go
 * stale the moment the record is corrected: Otter kept publishing "affiliate
 * link provided instead of official domain" as its Verdict long after its URL
 * had been changed to otter.ai. Never render.
 *
 * Deliberately narrow. Real criticism of a product's own affiliate programme or
 * data handling must still render, so every branch requires pipeline-specific
 * phrasing rather than a bare keyword.
 */
const EDITORIAL_META_RE =
  /data[- ]quality issue|data integrity issue|problema de (calidad|integridad) de datos|(url|link)[^.;]{0,40}\b(is|was)\b[^.;]{0,20}affiliate|affiliate\/partner referral|(rather than|instead of|not)[^.;]{0,20}(the )?official (product )?domain|en lugar del dominio oficial|no dominio oficial|generic (placeholder|llm)[^.;]{0,20}(summary|description)|template summary|resumen gen[eé]rico de llm|source data (is )?unreliable|datos de origen no confiables|no website content available|does not match (the )?actual product|no coincide con el producto real|duplicate listing|entrada duplicada|desajuste de categor|category (and|or) summary mismatch|cannot evaluate|no se puede evaluar|(pricing|features|product details)[^.;]{0,25}not verified|no verified pricing|actual destination (is )?unclear|insufficient detail|for (a )?meaningful (assessment|review|evaluation)|resumen gen[eé]rico|informaci[oó]n del producto inaccesible|product information (is )?inaccessible|appwiki|(url|link|enlace)[^.;]{0,40}(redirect(s|ed)?|points to|se redirige)[^.;]{0,25}(affiliate|afiliado)|\b(affiliate|referral|afiliado)\b[^.;]{0,80}\b(url|domain|landing|tracking|dominio)\b|\b(url|domain|landing|tracking|dominio)\b[^.;]{0,80}\b(affiliate|referral|afiliado)\b|pricing not (directly )?(accessible|available) (via|through)|generic summary|summary provides no|no meaningful description|sin descripci[oó]n significativa|(site|website|url|domain)[^.;]{0,25}appears (to be )?(inaccessible|unreachable|down|parked)|misclassified as|purpose is unclear from|marcador de posici[oó]n|(affiliate|referral) link[^.;]{0,60}(pricing|verification|verify)|enlace de afiliado[^.;]{0,60}(precio|verificaci)/i;

/** Strip decorative wrappers like "(unverified)" or "[N/A]." before testing. */
function normalize(text: string): string {
  return text.trim().replace(/^[(\[\s]+|[)\]\s.]+$/g, "");
}

/** True for strict whole-value placeholders ("Unknown", "N/A", "TBD", …). */
export function isPlaceholderValue(text: string): boolean {
  const n = normalize(text);
  return n.length === 0 || PLACEHOLDER_RE.test(n);
}

/** True when review text is a placeholder, verification junk, or an editorial note. */
export function isJunkReviewText(text: string): boolean {
  const n = normalize(text);
  return (
    n.length === 0 ||
    PLACEHOLDER_RE.test(n) ||
    VERIFICATION_JUNK_RE.test(n) ||
    EDITORIAL_META_RE.test(n)
  );
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
