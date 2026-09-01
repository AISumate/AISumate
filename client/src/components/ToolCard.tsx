import { useState } from "react";
import { Link, useLocation } from "wouter";
import { isLandingTable } from "@shared/simpleTables";
import { Check, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bot } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  accentClassFor,
  AiRelevanceBadge,
  ContentLanguageBadge,
  ReviewDetails,
  ReviewMark,
  StarRating,
  ToolIcon,
  VisitButton,
  type ReviewInfo,
} from "./toolVisuals";

export interface AiTool extends ReviewInfo {
  id: string;
  name: string;
  descriptionEn: string;
  descriptionEs: string;
  category: string;
  url: string;
  affiliateUrl: string;
  iconUrl: string;
  isAffiliate?: boolean;
  rating?: number;
  isNew?: boolean;
  isEnglishContent?: boolean;
  isSpanishContent?: boolean;
  aiRelevance?: string;
  /** Hand-written personal review; presence drives the mark next to the rating. */
  blogPostEn?: string;
  blogPostEs?: string;
}

export function ToolCard({
  tool,
  index = 0,
  visitLabel,
  onOpenDetails,
  rank,
  cornerBadge,
  detailExtra,
  compact = false,
  tableKey,
}: {
  tool: AiTool;
  index?: number;
  visitLabel?: string;
  /** Override the built-in detail dialog (e.g. AI Media opens a blog post instead). */
  onOpenDetails?: () => void;
  /** Show a numbered rank badge in the top-left (Weekly Viral GitHub). */
  rank?: number;
  /** Small badge for the top-right corner, e.g. a trending delta pill. */
  cornerBadge?: React.ReactNode;
  /** Extra content rendered inside the detail dialog, under the description. */
  detailExtra?: React.ReactNode;
  /**
   * Which table this listing lives in (e.g. "llms", "freeApis"). When set, the
   * detail dialog offers "Open page" / "Copy link" for the shareable URL
   * /tool/<tableKey>/<id>.
   */
  tableKey?: string;
  /**
   * Denser card: drops the description teaser and shrinks the tile, so pages
   * with many entries (AI Influencers) fit more per screen. The full
   * description is still one click away via the Description button.
   */
  compact?: boolean;
}) {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [, navigate] = useLocation();
  const pageHref = tableKey ? `/tool/${tableKey}/${tool.id}` : undefined;
  // Landing tables go straight to the tool's landing page on click; excluded
  // tables (channels, sites, blog...) keep the quick detail dialog, as does
  // any caller that overrides onOpenDetails (AI Media's blog post).
  const goesToPage = Boolean(pageHref && !onOpenDetails && tableKey && isLandingTable(tableKey));
  // The English review is the source of truth for "a review exists" — a Spanish
  // one is only ever written alongside it, never on its own.
  const hasReview = Boolean(tool.blogPostEn?.trim());

  const copyPageLink = async () => {
    if (!pageHref) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${pageHref}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable (permissions/iframe) — quietly do nothing */
    }
  };
  const accentClass = accentClassFor(index);

  const description = language === "es" ? tool.descriptionEs : tool.descriptionEn;
  const visitUrl = tool.isAffiliate && tool.affiliateUrl ? tool.affiliateUrl : tool.url;
  const label = visitLabel ?? t("visitTool");
  const openDetails =
    onOpenDetails ?? (goesToPage ? () => navigate(pageHref!) : () => setOpen(true));

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={openDetails}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") openDetails();
        }}
        className={`group relative flex flex-col rounded-xl border border-border bg-card cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:z-20 focus-within:z-20 hover:border-[color-mix(in_oklch,var(--tool-accent)_45%,var(--border))] hover:shadow-xl ${
          compact ? "gap-2 min-h-[128px] p-3" : "gap-2.5 min-h-[220px] p-4"
        } ${rank != null || cornerBadge ? "pt-9" : ""} ${accentClass}`}
      >
        {/* Rank badge (top-left) — used by the Weekly Viral GitHub strip. */}
        {rank != null && (
          <div
            className="absolute top-3 left-3 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold shrink-0"
            style={{ backgroundColor: "var(--tool-accent)", color: "oklch(0.96 0.01 60)" }}
          >
            {rank}
          </div>
        )}

        {/* Corner badge (top-right), e.g. "+8.8k this week". */}
        {cornerBadge && <div className="absolute top-3 right-3">{cornerBadge}</div>}

        {/* Header: icon + title/category only. The rating sits on its own row below —
            sharing this row with it cost ~92px, which at 5-up (218px cards) left the
            title just ~31px and truncated nearly every name. */}
        <div className="flex items-center gap-2.5">
          <div
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden ring-2 ring-border group-hover:ring-[var(--tool-accent)] transition-all duration-200"
            style={{ backgroundColor: "color-mix(in oklch, var(--tool-accent) 12%, var(--card))" }}
          >
            <ToolIcon
              iconUrl={tool.iconUrl}
              siteUrl={tool.url}
              alt={tool.name}
              className="h-full w-full object-contain"
              fallback={<Bot className="h-5 w-5" style={{ color: "var(--tool-accent)" }} />}
            />
            <ContentLanguageBadge isEnglish={tool.isEnglishContent} isSpanish={tool.isSpanishContent} />
          </div>
          <div className="min-w-0 flex-1">
            {/* Compact tiles are narrower, so long names (YouTube channels) get
                two lines instead of an ellipsis — the room freed by dropping
                the description teaser. */}
            <h3
              className={`text-sm font-semibold leading-tight text-card-foreground ${
                compact ? "line-clamp-2" : "truncate"
              }`}
            >
              {tool.name}
            </h3>
            {tool.category && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{tool.category}</p>
            )}
          </div>
        </div>

        {((tool.rating ?? 0) > 0 || tool.aiRelevance || hasReview) && (
          <div className="-mt-1 flex items-center gap-2">
            {(tool.rating ?? 0) > 0 && (
              <StarRating rating={tool.rating!} accent="var(--tool-accent)" starClassName="h-3 w-3" />
            )}
            <ReviewMark hasReview={hasReview} />
            <AiRelevanceBadge relevance={tool.aiRelevance} />
          </div>
        )}

        {/* The corner badge owns the top-right slot when present, so they can't collide. */}
        {tool.isNew && !cornerBadge && (
          <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 leading-none">
            New
          </Badge>
        )}

        {/* Description — freed up a full row by folding the rating into the header
            above. Hidden in compact mode: on dense pages it only ever showed a
            truncated fragment, so it's better read in full via the button. */}
        {description && !compact && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 flex-1">
            {description}
          </p>
        )}

        {/* Actions — stacked, not side by side. At 5-up the card is 179px (145px of
            content) but the two buttons need ~198px in a row, so they overflowed.
            Description sits on top and opens the detail modal; it replaced the old
            hover teaser as the way into the full review. */}
        <div className="flex flex-col gap-1.5 mt-auto">
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-full px-3 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              openDetails();
            }}
          >
            {goesToPage ? t("openToolPage") : t("description")}
          </Button>
          <div onClick={(e) => e.stopPropagation()} className="flex justify-center">
            <VisitButton url={visitUrl} label={label} compact />
          </div>
        </div>
      </div>

      {/* Tool detail modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={`sm:max-w-lg max-h-[85vh] overflow-y-auto ${accentClass}`}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden shrink-0"
                style={{ backgroundColor: "color-mix(in oklch, var(--tool-accent) 13%, var(--card))" }}
              >
                <ToolIcon
                  iconUrl={tool.iconUrl}
                  siteUrl={tool.url}
                  alt={tool.name}
                  className="h-full w-full object-contain"
                  fallback={<Bot className="h-6 w-6" style={{ color: "var(--tool-accent)" }} />}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <DialogTitle>{tool.name}</DialogTitle>
                  {tool.isNew && (
                    <Badge className="shrink-0 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 leading-none">
                      New
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {tool.category && (
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{
                        borderColor: "color-mix(in oklch, var(--tool-accent) 30%, transparent)",
                        color: "var(--tool-accent)",
                      }}
                    >
                      {tool.category}
                    </Badge>
                  )}
                  {(tool.rating ?? 0) > 0 && (
                    <StarRating rating={tool.rating!} accent="var(--tool-accent)" />
                  )}
                  <ReviewMark hasReview={hasReview} />
                  <AiRelevanceBadge relevance={tool.aiRelevance} />
                </div>
              </div>
            </div>
            <DialogDescription>{description || t("noDescription")}</DialogDescription>
          </DialogHeader>

          {tool.isAffiliate && tool.affiliateUrl && (
            <p className="text-xs text-muted-foreground italic -mt-2">{t("affiliateDisclosure")}</p>
          )}

          {detailExtra}

          <ReviewDetails review={tool} />

          <VisitButton url={visitUrl} label={label} />

          {/* Shareable URL for this listing — a real page, so links survive. */}
          {pageHref && (
            <div className="flex items-center justify-center gap-4 text-xs font-semibold">
              <Link
                href={pageHref}
                className="text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                {t("openToolPage")}
              </Link>
              <button
                type="button"
                onClick={copyPageLink}
                className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-primary"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
                {copied ? t("linkCopied") : t("copyLink")}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
