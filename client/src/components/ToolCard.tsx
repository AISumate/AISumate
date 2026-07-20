import { useState } from "react";
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
import { cleanVerdict } from "@shared/reviewSanitize";
import {
  accentClassFor,
  ConfidenceBadge,
  ContentLanguageBadge,
  hasReviewContent,
  ReviewDetails,
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
}

export function ToolCard({
  tool,
  index = 0,
  visitLabel,
  onOpenDetails,
}: {
  tool: AiTool;
  index?: number;
  visitLabel?: string;
  /** Override the built-in detail dialog (e.g. AI Media opens a blog post instead). */
  onOpenDetails?: () => void;
}) {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const accentClass = accentClassFor(index);

  const description = language === "es" ? tool.descriptionEs : tool.descriptionEn;
  const visitUrl = tool.isAffiliate && tool.affiliateUrl ? tool.affiliateUrl : tool.url;
  const label = visitLabel ?? t("visitTool");
  const showOverlay = hasReviewContent(tool);
  const verdict = cleanVerdict(language === "es" ? tool.verdictEs : tool.verdictEn);
  const openDetails = onOpenDetails ?? (() => setOpen(true));

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={openDetails}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") openDetails();
        }}
        className={`group relative flex flex-col gap-2.5 min-h-[220px] rounded-xl border border-border bg-card p-4 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:z-20 focus-within:z-20 hover:border-[color-mix(in_oklch,var(--tool-accent)_45%,var(--border))] hover:shadow-xl ${accentClass}`}
      >
        {/* Header: icon on the left, title + rating share one row so the description gets more room below */}
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
            <h3 className="text-sm font-semibold leading-tight text-card-foreground truncate">
              {tool.name}
            </h3>
            {tool.category && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{tool.category}</p>
            )}
          </div>
          {(tool.rating ?? 0) > 0 && (
            <div className="shrink-0">
              <StarRating rating={tool.rating!} accent="var(--tool-accent)" starClassName="h-3 w-3" />
            </div>
          )}
        </div>

        {tool.isNew && (
          <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 leading-none">
            New
          </Badge>
        )}

        {/* Description — freed up a full row by folding the rating into the header above */}
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 flex-1">
            {description}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto">
          <div onClick={(e) => e.stopPropagation()} className="flex-1">
            <VisitButton url={visitUrl} label={label} compact />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              openDetails();
            }}
          >
            {t("description")}
          </Button>
        </div>

        {/* Hover teaser — a small peek (verdict + confidence) on a rounded plane slightly
            larger than the card. The full review lives in the click-to-open modal. */}
        {showOverlay && (
          <div
            className="absolute -left-4 -right-4 -top-2 z-20 flex flex-col gap-2 rounded-2xl p-4 max-h-0 opacity-0 pointer-events-none overflow-hidden transition-[max-height,opacity,box-shadow] duration-300 ease-out group-hover:max-h-56 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:shadow-2xl"
            style={{
              background: "color-mix(in oklch, var(--card) 96%, var(--tool-accent))",
              backdropFilter: "blur(6px)",
              border: "1px solid color-mix(in oklch, var(--tool-accent) 35%, var(--border))",
            }}
          >
            <div className="flex items-center gap-2 shrink-0">
              <h3 className="text-sm font-semibold text-card-foreground truncate">{tool.name}</h3>
              <ConfidenceBadge level={tool.reviewConfidence} />
            </div>
            <p className="text-xs leading-relaxed text-card-foreground line-clamp-3">
              {verdict || description}
            </p>
            <div className="mt-auto flex items-center gap-2 shrink-0">
              <span className="flex-1 text-xs font-bold" style={{ color: "var(--tool-accent)" }}>
                {t("clickForDetails")}
              </span>
              <div onClick={(e) => e.stopPropagation()}>
                <VisitButton url={visitUrl} label={label} compact />
              </div>
            </div>
          </div>
        )}
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
                </div>
              </div>
            </div>
            <DialogDescription>{description || t("noDescription")}</DialogDescription>
          </DialogHeader>

          {tool.isAffiliate && tool.affiliateUrl && (
            <p className="text-xs text-muted-foreground italic -mt-2">{t("affiliateDisclosure")}</p>
          )}

          <ReviewDetails review={tool} />

          <VisitButton url={visitUrl} label={label} />
        </DialogContent>
      </Dialog>
    </>
  );
}
