import { useState, type ReactNode } from "react";
import { Star, ThumbsUp, ThumbsDown, Coins, Scale, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  cleanReviewText,
  cleanVerdict,
  hostnameOf,
  splitReviewItems,
} from "@shared/reviewSanitize";

export { hostnameOf };

/** Rotating earthy accent colors for tool cards (defined in index.css). */
export const ACCENT_CLASSES = [
  "tool-accent-0",
  "tool-accent-1",
  "tool-accent-2",
  "tool-accent-3",
  "tool-accent-4",
  "tool-accent-5",
];

export function accentClassFor(index: number): string {
  return ACCENT_CLASSES[index % ACCENT_CLASSES.length];
}

/**
 * Small EN/ES chip for a record's own content language (e.g. an AI
 * Influencers channel that broadcasts in Spanish) — independent of the
 * site's UI language toggle, which still controls which translated summary
 * is shown. Pinned to the icon's corner like an avatar status badge.
 */
export function ContentLanguageBadge({
  isEnglish,
  isSpanish,
}: {
  isEnglish?: boolean;
  isSpanish?: boolean;
}) {
  if (!isEnglish && !isSpanish) return null;
  const label = isEnglish && isSpanish ? "EN/ES" : isEnglish ? "EN" : "ES";
  return (
    <span
      className="absolute -bottom-1 -right-1 rounded-full border border-border bg-card px-1 py-px text-[8px] font-bold leading-tight text-foreground shadow-sm"
      style={{ fontFamily: "var(--font-mono)" }}
      title={isEnglish && isSpanish ? "English & Spanish channel" : isEnglish ? "English-language channel" : "Spanish-language channel"}
    >
      {label}
    </span>
  );
}

/** Compact number formatting for star counts etc. (12500 -> "12.5k"). */
export function formatCompactNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function StarRating({
  rating,
  accent,
  starClassName = "h-3.5 w-3.5",
}: {
  rating: number;
  accent: string;
  starClassName?: string;
}) {
  if (!rating || rating < 1) return null;
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < fullStars;
        const half = i === fullStars && hasHalf;
        return (
          <Star
            key={i}
            className={`${starClassName} ${filled || half ? "fill-current" : ""}`}
            style={{
              color: filled || half ? accent : "var(--muted-foreground)",
              opacity: filled ? 1 : half ? 0.6 : 0.3,
            }}
          />
        );
      })}
      <span className="ml-1 text-xs font-medium text-muted-foreground">{rating.toFixed(1)}</span>
    </div>
  );
}

/**
 * Section header in the Sau5 Command Centre language: terracotta hairline,
 * uppercase mono tick label, Geist display title.
 */
export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="relative mb-6 overflow-hidden">
      {/* Animated theme-aware dot field, masked to fade in from the left so the
          title stays legible. Purely decorative. */}
      <div className="heading-dots" aria-hidden="true" />
      <div className="relative border-l-4 border-primary pl-4 py-1">
        <p
          className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground mb-1"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          aisumate / index
        </p>
        <h2
          className="text-2xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {title}
        </h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

// --- Verified review fields (Pros / Cons / Cost / Verdict + confidence) ---

/** Review fields present on all content records (optional so older shapes still compile). */
export interface ReviewInfo {
  prosEn?: string;
  consEn?: string;
  costEn?: string;
  verdictEn?: string;
  prosEs?: string;
  consEs?: string;
  costEs?: string;
  verdictEs?: string;
  reviewConfidence?: string;
}

// Placeholder / verification-junk filtering lives in @shared/reviewSanitize —
// tested by shared/reviewSanitize.test.ts and shared with the server mappers.
const cleanText = cleanReviewText;

const CONFIDENCE_STYLES: Record<string, { dot: string; labelKey: "confidenceHigh" | "confidenceMedium" | "confidenceLow" }> = {
  high: { dot: "#4E7A4E", labelKey: "confidenceHigh" },
  medium: { dot: "#B8863B", labelKey: "confidenceMedium" },
  low: { dot: "#A03D12", labelKey: "confidenceLow" },
};

/** Compact high/medium/low review-confidence pill. */
export function ConfidenceBadge({ level }: { level?: string }) {
  const { t } = useLanguage();
  const style = CONFIDENCE_STYLES[(level ?? "").toLowerCase().trim()];
  if (!style) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-muted-foreground"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: style.dot }} />
      {t(style.labelKey)}
    </span>
  );
}

function ReviewSection({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p
        className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-1"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {icon}
        {label}
      </p>
      {children}
    </div>
  );
}

/** True when a record has any usable review content in either language — used to widen the hover card. */
export function hasReviewContent(review: ReviewInfo): boolean {
  return !!(
    splitReviewItems(review.prosEn).length ||
    splitReviewItems(review.prosEs).length ||
    splitReviewItems(review.consEn).length ||
    splitReviewItems(review.consEs).length ||
    cleanText(review.costEn) ||
    cleanText(review.costEs) ||
    cleanVerdict(review.verdictEn) ||
    cleanVerdict(review.verdictEs)
  );
}

/**
 * Hover-card sizing: two-column layout when review data exists, compact
 * otherwise. Kept deliberately modest (≈440×420) — an oversized card is still
 * correctly anchored to its tile, but it's tall enough to reach the top of the
 * viewport, which reads as a detached box floating in the corner. This size sits
 * neatly above/below the hovered tile and lets Radix's collision handling flip
 * it cleanly on edge rows.
 */
export function reviewHoverCardClass(review: ReviewInfo, padding = "p-5"): string {
  return hasReviewContent(review)
    ? `w-[440px] max-w-[90vw] ${padding} max-h-[380px] overflow-y-auto`
    : `w-80 ${padding}`;
}

/**
 * Language-aware verified-review block for hover cards: pros, cons, cost, and
 * verdict in the active language, plus the confidence pill. Sections with no
 * usable data (empty or placeholder values) are omitted entirely. Laid out as
 * a two-column grid (Pros | Cons, then Cost | Verdict) so long reviews read
 * left-to-right instead of one tall scrolling column.
 */
export function ReviewDetails({ review }: { review: ReviewInfo }) {
  const { t, language } = useLanguage();

  const pros = splitReviewItems(language === "es" ? review.prosEs : review.prosEn);
  const cons = splitReviewItems(language === "es" ? review.consEs : review.consEn);
  const cost = cleanText(language === "es" ? review.costEs : review.costEn);
  const verdict = cleanVerdict(language === "es" ? review.verdictEs : review.verdictEn);
  const hasConfidence = !!CONFIDENCE_STYLES[(review.reviewConfidence ?? "").toLowerCase().trim()];

  if (!pros.length && !cons.length && !cost && !verdict && !hasConfidence) return null;

  return (
    <div className="space-y-3 border-t border-border pt-3">
      {hasConfidence && <ConfidenceBadge level={review.reviewConfidence} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        {pros.length > 0 && (
          <ReviewSection icon={<ThumbsUp className="h-3 w-3" />} label={t("reviewPros")}>
            <ul className="space-y-1">
              {pros.map((item, i) => (
                <li key={i} className="flex gap-1.5 text-xs text-popover-foreground leading-snug">
                  <span className="shrink-0" style={{ color: "#4E7A4E" }}>+</span>
                  {item}
                </li>
              ))}
            </ul>
          </ReviewSection>
        )}

        {cons.length > 0 && (
          <ReviewSection icon={<ThumbsDown className="h-3 w-3" />} label={t("reviewCons")}>
            <ul className="space-y-1">
              {cons.map((item, i) => (
                <li key={i} className="flex gap-1.5 text-xs text-popover-foreground leading-snug">
                  <span className="shrink-0" style={{ color: "#A03D12" }}>−</span>
                  {item}
                </li>
              ))}
            </ul>
          </ReviewSection>
        )}

        {cost && (
          <ReviewSection icon={<Coins className="h-3 w-3" />} label={t("reviewCost")}>
            <p className="text-xs text-popover-foreground leading-snug">{cost}</p>
          </ReviewSection>
        )}

        {verdict && (
          <ReviewSection icon={<Scale className="h-3 w-3" />} label={t("reviewVerdict")}>
            <p className="text-xs italic text-popover-foreground leading-snug">{verdict}</p>
          </ReviewSection>
        )}
      </div>
    </div>
  );
}

/**
 * The one visit action used in every popup and result row. Always a solid
 * accent button, and deliberately the ONLY link out — the raw URL is never
 * displayed, so affiliate links can't be bypassed by copying the domain.
 */
export function VisitButton({
  url,
  label,
  compact = false,
}: {
  url: string;
  label: string;
  compact?: boolean;
}) {
  if (!url) return null;
  return (
    <Button
      asChild
      size="sm"
      className={compact ? "h-7 px-3 text-xs" : "w-full"}
      style={{
        backgroundColor: "var(--tool-accent, var(--primary))",
        color: "oklch(0.96 0.01 60)",
      }}
    >
      {/* sponsored+nofollow: this is a directory whose outbound links may become
          affiliate links — Google requires rel=sponsored on paid links, and
          blanket-applying it keeps us compliant the day AffiliateUrls land. */}
      <a href={url} target="_blank" rel="sponsored nofollow noopener noreferrer">
        {label}
        <ExternalLink className={compact ? "ml-1.5 h-3 w-3" : "ml-2 h-3.5 w-3.5"} />
      </a>
    </Button>
  );
}

/** Derive a favicon URL from a tool's website — mirrors the server fallback. */
export function faviconUrl(siteUrl: string): string {
  if (!siteUrl) return "";
  try {
    const { hostname } = new URL(siteUrl);
    if (!hostname) return "";
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=128`;
  } catch {
    return "";
  }
}

/**
 * Tool icon with graceful degradation through independent sources:
 * curated logo → Google favicon → DuckDuckGo favicon → the provided fallback
 * node. Multiple sources matter because ~100 tiles load at once and any single
 * service can transiently drop requests — one flaky response must not leave a
 * tile blank while the hover popup (loading later) shows the icon fine.
 */
export function ToolIcon({
  iconUrl,
  siteUrl,
  alt,
  className,
  fallback,
}: {
  iconUrl?: string;
  siteUrl?: string;
  alt: string;
  className?: string;
  fallback: ReactNode;
}) {
  const host = siteUrl ? hostnameOf(siteUrl) : "";
  const sources = [
    iconUrl || "",
    host ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128` : "",
    host ? `https://icons.duckduckgo.com/ip3/${encodeURIComponent(host)}.ico` : "",
  ].filter(Boolean);
  const uniqueSources = Array.from(new Set(sources));
  const sourcesKey = uniqueSources.join("|");

  const [state, setState] = useState({ key: sourcesKey, index: 0 });
  // Reset the fallback chain when the tool (and its sources) changes.
  const index = state.key === sourcesKey ? state.index : 0;

  if (index >= uniqueSources.length) return <>{fallback}</>;

  return (
    <img
      src={uniqueSources[index]}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setState({ key: sourcesKey, index: index + 1 })}
    />
  );
}
