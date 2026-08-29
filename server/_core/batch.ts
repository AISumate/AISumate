/** Delay helper for staggering API calls to avoid rate limits. */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Run async tasks in staggered batches to avoid overwhelming an upstream API.
 * batchSize=2 / delayMs=350 keeps a cold serverless instance (which fetches all
 * ~24 Teable tables at once for the total count / global search) under Teable's
 * rate limit; combined with fetchWithRetry's 429/503 backoff this stays well
 * inside the 30s function budget.
 */
export async function staggeredAll<T>(tasks: (() => Promise<T>)[], batchSize = 2, delayMs = 350): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((task) => task()));
    results.push(...batchResults);
    if (i + batchSize < tasks.length) {
      await delay(delayMs);
    }
  }
  return results;
}
