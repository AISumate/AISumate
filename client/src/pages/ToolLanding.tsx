import { useState } from "react";
import { Link } from "wouter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  ArrowRight,
  Bot,
  Check,
  Coins,
  Link2,
  Pencil,
  PenLine,
  Quote,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  AiRelevanceBadge,
  ConfidenceBadge,
  StarRating,
  ToolIcon,
  VisitButton,
} from "@/components/toolVisuals";
import {
  cleanReviewText,
  cleanVerdict,
  hostnameOf,
  splitReviewItems,
} from "@shared/reviewSanitize";
import { mshotsUrl } from "@shared/screenshot";
import type { AnyListing } from "./ToolPage";

/**
 * The rich landing layout for a listing — built to match the approved design
 * canvas (hero + screenshot card, pros/cons cards, cost chips, dark verdict
 * pull-quote, "From the maker" slot, related tools). Rendered by ToolPage for
 * landing-enabled tables; the screenshot is an automatic homepage shot until
 * curated images exist in Teable.
 */
export function ToolLanding({
  table,
  id,
  item,
  rows,
}: {
  table: string;
  id: string;
  item: AnyListing;
  rows: AnyListing[];
}) {
  const { t, language } = useLanguage();
  const [failedShots, setFailedShots] = useState<Set<string>>(new Set());
  const [activeShot, setActiveShot] = useState(0);
  const [mshotsTry, setMshotsTry] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const name = item.name || item.title || "";
  const description =
    (language === "es"
      ? item.descriptionEs || item.summaryEs
      : item.descriptionEn || item.summaryEn) ||
    item.description ||
    "";
  const category = item.category || item.providerType || item.topic || item.platform || "";
  const url = item.url || item.repoUrl || item.dealUrl || item.website || "";
  const visitUrl = item.isAffiliate && item.affiliateUrl ? item.affiliateUrl : url;
  const domain = hostnameOf(url);

  const pros = splitReviewItems(language === "es" ? item.prosEs : item.prosEn);
  const cons = splitReviewItems(language === "es" ? item.consEs : item.consEn);
  const costChips = splitReviewItems(language === "es" ? item.costEs : item.costEn);
  const verdict = cleanVerdict(language === "es" ? item.verdictEs : item.verdictEn);
  const providerNote = cleanReviewText(
    language === "es" ? item.providerNoteEs : item.providerNoteEn,
  );

  // Hand-written personal review (Teable "Blog Post" columns). Falls back to
  // the English text when no Spanish one has been written yet — same rule as
  // BlogPostDialog uses for the Sumate Media posts.
  const reviewBody =
    (language === "es" && item.blogPostEs?.trim() ? item.blogPostEs : item.blogPostEn) ?? "";
  const reviewTitle =
    (language === "es" && item.blogTitleEs?.trim() ? item.blogTitleEs : item.blogTitleEn) ?? "";
  const hasReview = Boolean(item.blogPostEn?.trim());

  // Curated images (Teable `Images` column, one URL per line) win; otherwise
  // the auto homepage screenshot. Up to 6 shown: the first as the main image,
  // the rest as click-to-select thumbnails; clicking the main image opens a
  // full-size lightbox. Broken URLs drop out silently.
  const curated: string[] = Array.isArray(item.images) ? item.images : [];
  const autoShotBase = url ? mshotsUrl(url, 1200) : "";
  const liveCurated = curated.slice(0, 6).filter((s) => !failedShots.has(s));
  // A curated image that 404s falls back to the auto screenshot rather than
  // leaving a gap; if that fails too, `mainShot` is undefined and the whole
  // card (browser frame included) never renders — no empty box.
  const usingAutoShot =
    liveCurated.length === 0 && !!autoShotBase && !failedShots.has(autoShotBase);
  const shots = usingAutoShot
    ? [mshotsTry ? `${autoShotBase}&retry=${mshotsTry}` : autoShotBase]
    : liveCurated;
  const mainShot = shots[Math.min(activeShot, Math.max(shots.length - 1, 0))];
  // failedShots is keyed on the un-busted URL so a failure sticks across retries.
  const mainShotKey = usingAutoShot ? autoShotBase : mainShot;

  /**
   * mShots serves a 400x300 "Generating Preview" placeholder until it has
   * rendered the site (real shots come back at the requested 1200px). Poll a
   * few times while it generates; if the placeholder never resolves (some
   * sites block the renderer) give up so the card hides instead of promising
   * a screenshot forever.
   */
  const handleShotLoad = (img: HTMLImageElement) => {
    if (!usingAutoShot || img.naturalWidth > 420) return;
    if (mshotsTry >= 4) {
      setFailedShots((prev) => new Set(prev).add(autoShotBase));
      return;
    }
    window.setTimeout(() => setMshotsTry((n) => n + 1), 3500);
  };

  // Same-category neighbours from the already-cached table list — internal
  // links, zero extra fetches. Rating-first so the strongest tools show.
  const related = rows
    .filter((r) => r.id !== id && (r.category || r.providerType) === (item.category || item.providerType))
    .sort((a, b) => (b.rating || 0) - (a.rating || 0) || String(a.name).localeCompare(String(b.name)))
    .slice(0, 3);

  const copyPageLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/tool/${table}/${id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — quietly do nothing */
    }
  };

  return (
    <article>
      {/* Hero: identity + CTA left, screenshot card right */}
      {/* Same two-column grid as the pros/cons row below, so the image card's
          edges line up exactly with the box underneath it. */}
      <div className="mt-3 grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-6">
        <div className="flex w-full flex-col gap-4 lg:w-auto lg:max-w-[600px]">
          <div className="flex items-center gap-4">
            <div
              className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-border bg-card shadow-sm"
            >
              <ToolIcon
                iconUrl={item.iconUrl}
                siteUrl={url}
                alt={name}
                className="h-11 w-11 rounded-lg object-contain"
                fallback={<Bot className="h-8 w-8 text-primary" />}
              />
            </div>
            <div className="flex flex-col gap-1">
              <div
                className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                aisumate / tool
              </div>
              <h1
                className="text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-[44px]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {name}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {(item.rating ?? 0) > 0 && (
              <>
                <StarRating rating={item.rating!} accent="var(--primary)" />
                <span className="text-[13px] font-bold text-foreground">
                  {Number(item.rating).toFixed(1)}
                </span>
                <span className="h-3.5 w-px bg-border" />
              </>
            )}
            <ConfidenceBadge level={item.reviewConfidence} />
            <AiRelevanceBadge relevance={item.aiRelevance} />
          </div>

          {description && (
            <p className="max-w-[520px] text-lg leading-relaxed text-foreground">{description}</p>
          )}

          <div className="mt-1 flex flex-wrap items-center gap-3">
            {visitUrl && (
              <VisitButton
                url={visitUrl}
                label={t("visitToolGeneric")}
                className="h-11 w-auto min-w-[230px] justify-center rounded-full px-10 text-[14px] font-bold"
              />
            )}
            <button
              type="button"
              onClick={copyPageLink}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-[13px] font-semibold text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
              {copied ? t("linkCopied") : t("copyLink")}
            </button>
          </div>
          {/* Sits under the Visit button, on its own line. A plain anchor, so it
              still jumps to the review in the crawler's static twin. */}
          {hasReview && (
            <div>
              <a
                href="#our-review"
                className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-5 py-2.5 text-[13px] font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                <PenLine className="h-3.5 w-3.5" />
                {t("reviewButton")}
              </a>
            </div>
          )}
          {item.isAffiliate && item.affiliateUrl && (
            <p className="text-xs italic text-muted-foreground">{t("affiliateDisclosure")}</p>
          )}
        </div>

        {/* Screenshot / gallery card (browser chrome frame) */}
        {mainShot && (
          <div className="flex w-full flex-col gap-2.5">
            <div className="rounded-2xl border border-border bg-card p-2 shadow-[0_10px_24px_rgba(26,26,26,0.10)]">
              <div className="flex items-center gap-1.5 px-1 pb-2.5 pt-0.5">
                <span className="h-2 w-2 rounded-full bg-border" />
                <span className="h-2 w-2 rounded-full bg-border" />
                <span className="h-2 w-2 rounded-full bg-border" />
                <span className="flex-1" />
                {domain && (
                  <span
                    className="text-[10px] text-muted-foreground"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {domain}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="block w-full cursor-zoom-in"
                aria-label={`${name} — enlarge image`}
              >
                <img
                  src={mainShot}
                  alt={`${name} website`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onLoad={(e) => handleShotLoad(e.currentTarget)}
                  onError={() =>
                    setFailedShots((prev) => new Set(prev).add(mainShotKey))
                  }
                  // Fixed 16:10 frame so every tool page's image card is the
                  // same size — source images range from wide og banners to
                  // square icons, and object-contain letterboxes rather than
                  // zoom-cropping the odd shapes.
                  className="block w-full aspect-[16/10] object-contain bg-muted rounded-xl"
                />
              </button>
            </div>

            {/* Thumbnail selector — only when the maker supplied several images */}
            {shots.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {shots.map((s, i) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setActiveShot(i)}
                    className={`h-14 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                      s === mainShot ? "border-primary" : "border-border hover:border-primary/50"
                    }`}
                    aria-label={`${name} image ${i + 1}`}
                  >
                    <img
                      src={s}
                      alt=""
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={() => setFailedShots((prev) => new Set(prev).add(s))}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Lightbox */}
            <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
              <DialogContent className="max-w-5xl border-none bg-transparent p-0 shadow-none">
                <DialogTitle className="sr-only">{name}</DialogTitle>
                <img
                  src={mainShot}
                  alt={`${name} website`}
                  referrerPolicy="no-referrer"
                  className="w-full rounded-2xl"
                />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Pros / Cons */}
      {(pros.length > 0 || cons.length > 0) && (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {pros.length > 0 && (
            <div className="flex flex-col gap-3.5 rounded-xl border border-border bg-card p-7">
              <div
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em]"
                style={{ color: "#4E7A4E" }}
              >
                <ThumbsUp className="h-4 w-4" />
                {t("reviewPros")}
              </div>
              <div className="flex flex-col gap-2.5">
                {pros.map((p, i) => (
                  <div key={i} className="flex gap-2.5 text-sm leading-relaxed text-foreground">
                    <span className="font-bold" style={{ color: "#4E7A4E" }}>
                      +
                    </span>
                    {p}
                  </div>
                ))}
              </div>
            </div>
          )}
          {cons.length > 0 && (
            <div className="flex flex-col gap-3.5 rounded-xl border border-border bg-card p-7">
              <div
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em]"
                style={{ color: "#A03D12" }}
              >
                <ThumbsDown className="h-4 w-4" />
                {t("reviewCons")}
              </div>
              <div className="flex flex-col gap-2.5">
                {cons.map((c, i) => (
                  <div key={i} className="flex gap-2.5 text-sm leading-relaxed text-foreground">
                    <span className="font-bold" style={{ color: "#A03D12" }}>
                      −
                    </span>
                    {c}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cost + Verdict */}
      {(costChips.length > 0 || verdict) && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {costChips.length > 0 && (
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-7">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
                <Coins className="h-4 w-4" />
                {t("reviewCost")}
              </div>
              <div className="flex flex-wrap gap-2">
                {costChips.map((c, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-secondary px-3.5 py-1.5 text-xs font-semibold text-foreground"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{t("costVerifyNote")}</p>
            </div>
          )}
          {verdict && (
            <div className="flex flex-col gap-3 rounded-xl bg-foreground p-7">
              <div
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em]"
                style={{ color: "#CFA45E" }}
              >
                <Quote className="h-4 w-4" />
                {t("ourVerdict")}
              </div>
              <p className="text-[17px] italic leading-relaxed text-background">"{verdict}"</p>
              <div
                className="text-[11px]"
                style={{ fontFamily: "var(--font-mono)", color: "#A08B72" }}
              >
                {t("verdictSignature")}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Our review — Duncan's own hands-on write-up, rendered inline (not in a
          dialog) so it is real page content the crawler twin can index. */}
      {hasReview && (
        <section
          id="our-review"
          className="mt-6 scroll-mt-6 rounded-xl border border-border bg-card p-7"
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
            <PenLine className="h-4 w-4" />
            {t("reviewSectionTitle")}
          </div>
          {reviewTitle && (
            <h2 className="mt-3 text-xl font-bold leading-snug text-foreground">{reviewTitle}</h2>
          )}
          <article className="prose prose-sm sm:prose-base dark:prose-invert mt-4 max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{reviewBody}</ReactMarkdown>
          </article>
        </section>
      )}

      {/* From the maker — renders ONLY when a real provider note exists in
          Teable (Provider Note column). No empty placeholder, no claim pill:
          Duncan's call — the slot stays invisible until a maker actually
          supplies content. */}
      {providerNote && (
        <div className="mt-6 flex items-start gap-4 rounded-xl border border-border bg-card p-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Pencil className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="text-sm font-bold text-foreground">{t("fromTheMaker")}</div>
            <div className="text-[13px] leading-relaxed text-muted-foreground">{providerNote}</div>
          </div>
        </div>
      )}

      {/* Related tools */}
      {related.length > 0 && (
        <div className="mt-10 flex flex-col gap-4">
          <div className="border-l-4 border-primary pl-4">
            <div
              className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              aisumate / index
            </div>
            <div className="text-[22px] font-extrabold text-foreground">
              {t("relatedIn")} {category}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {related.map((r) => {
              const rDesc =
                (language === "es"
                  ? r.descriptionEs || r.summaryEs
                  : r.descriptionEn || r.summaryEn) || "";
              return (
                <Link
                  key={r.id}
                  href={`/tool/${table}/${r.id}`}
                  className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <div className="text-[15px] font-bold text-foreground">{r.name}</div>
                  <div className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {rDesc}
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-primary">
                    {t("viewTool")}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}
