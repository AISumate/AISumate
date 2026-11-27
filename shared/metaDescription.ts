/**
 * Search-snippet text for a page.
 *
 * Teable descriptions are written for the card, not for Google: about a fifth
 * of the main table runs past the ~160 characters a result snippet shows. The
 * old helper sliced at a fixed offset, so a long description ended mid-word
 * ("complete AI-agent-to-deploym…"), which reads as broken rather than
 * abbreviated.
 *
 * This ends on a complete sentence when one fits, and otherwise on a whole
 * word. Shortening the source text in Teable is still better — a sentence
 * written to length beats one trimmed to length — but this makes every
 * over-long description presentable without touching the data.
 *
 * Shared so the crawler pages, the og:/twitter: cards and the catalogue line
 * can never disagree about how a description is shortened.
 */

/** Sentence-ending punctuation, allowing a closing quote or bracket after it. */
const SENTENCE_END = /[.!?]["')\]]?(?=\s|$)/g;

/** Index just past the last sentence that ends within `s`, or -1. */
function lastSentenceEnd(s: string): number {
  let end = -1;
  let m: RegExpExecArray | null;
  SENTENCE_END.lastIndex = 0;
  while ((m = SENTENCE_END.exec(s)) !== null) end = m.index + m[0].length;
  return end;
}

export function metaDescription(raw: string | undefined, limit = 160): string {
  const text = String(raw ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text || text.length <= limit) return text;

  const window = text.slice(0, limit);

  // A complete sentence is the best ending — but only if it leaves a snippet
  // worth showing. A description whose first sentence is four words long is
  // better served by the word-boundary path below.
  const sentence = lastSentenceEnd(window);
  if (sentence >= Math.floor(limit * 0.6)) return window.slice(0, sentence).trim();

  // Otherwise cut on whitespace and mark the elision. One character is held
  // back for the ellipsis so the result still fits the limit.
  const cut = window.slice(0, limit - 1);
  const space = cut.lastIndexOf(" ");
  const base = space > Math.floor(limit * 0.5) ? cut.slice(0, space) : cut;
  // Dangling punctuation before an ellipsis reads as a typo ("the chat, …").
  return base.replace(/[\s,;:·\-–—([{]+$/, "") + "…";
}
