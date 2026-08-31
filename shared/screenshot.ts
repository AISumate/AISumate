/**
 * Automatic homepage screenshot for tool landing pages, via WordPress.com's
 * free, keyless mShots service. Used until curated images land in a Teable
 * `Images` column (which then takes precedence). The visitor's browser fetches
 * the image directly from s.wordpress.com — disclosed on /privacy.
 * First-ever request for a URL may return a placeholder while the shot
 * renders; it self-populates on subsequent loads.
 */
export function mshotsUrl(siteUrl: string, width = 1200): string {
  return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(siteUrl)}?w=${width}`;
}
