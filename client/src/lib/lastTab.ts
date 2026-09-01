const KEY = "aisumate:lastTab";

/**
 * Which section tab the visitor was last looking at.
 *
 * Switching tabs doesn't change the URL (SectionTabs keeps the active tab in
 * React state and only ever *reads* the hash), so a detail page has no way to
 * work out where its visitor came from. Without this, "Back to directory"
 * guesses from the record's own table — which sends someone who opened a post
 * from the home page to the Blog tab instead of back home.
 *
 * sessionStorage, not localStorage: this is "where I am right now", and it
 * should not survive into a new visit. Every access is guarded because
 * storage throws outright in some privacy modes.
 */
export function rememberTab(tab: string): void {
  try {
    sessionStorage.setItem(KEY, tab);
  } catch {
    // Private mode / storage disabled — callers fall back to their own default.
  }
}

/** The remembered tab, or `fallback` when there is nothing sensible to return to. */
export function lastTab(fallback: string): string {
  try {
    return sessionStorage.getItem(KEY) || fallback;
  } catch {
    return fallback;
  }
}
