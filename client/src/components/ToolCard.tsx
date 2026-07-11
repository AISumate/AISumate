import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Bot } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { accentClassFor, ReviewDetails, reviewHoverCardClass, StarRating, ToolIcon, VisitButton, type ReviewInfo } from "./toolVisuals";

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
}

export function ToolCard({ tool, index = 0 }: { tool: AiTool; index?: number }) {
  const { t, language } = useLanguage();
  const accentClass = accentClassFor(index);

  // Use the correct language description
  const description = language === "es" ? tool.descriptionEs : tool.descriptionEn;

  // If affiliate is checked and affiliate URL exists, use it as the visit link
  const visitUrl = tool.isAffiliate && tool.affiliateUrl ? tool.affiliateUrl : tool.url;

  return (
    <HoverCard openDelay={200} closeDelay={150}>
      <HoverCardTrigger asChild>
        <div
          className={`group relative flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-6 text-center transition-all duration-200 hover:shadow-2xl hover:-translate-y-1.5 hover:border-[var(--tool-accent)] cursor-pointer min-h-[160px] overflow-hidden ${accentClass}`}
        >
          {/* Colored top bar that appears on hover */}
          <div
            className="absolute top-0 left-0 right-0 h-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300"
            style={{ backgroundColor: "var(--tool-accent)" }}
          />

          {/* Subtle accent glow on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 0%, color-mix(in oklch, var(--tool-accent) 8%, transparent), transparent 70%)",
            }}
          />

          {/* Icon with colored ring */}
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden shrink-0 ring-2 ring-border group-hover:ring-[var(--tool-accent)] transition-all duration-200"
            style={{
              backgroundColor: "color-mix(in oklch, var(--tool-accent) 12%, var(--card))",
            }}
          >
            <ToolIcon
              iconUrl={tool.iconUrl}
              siteUrl={tool.url}
              alt={tool.name}
              className="h-full w-full object-cover"
              fallback={<Bot className="h-6 w-6" style={{ color: "var(--tool-accent)" }} />}
            />
          </div>

          {/* Tool name */}
          <h3 className="text-sm font-semibold leading-tight text-card-foreground line-clamp-2">
            {tool.name}
          </h3>

          {/* Category badge with accent color */}
          {tool.category && (
            <Badge
              variant="secondary"
              className="text-xs font-normal"
              style={{
                backgroundColor: "color-mix(in oklch, var(--tool-accent) 15%, transparent)",
                color: "var(--tool-accent)",
              }}
            >
              {tool.category}
            </Badge>
          )}

          {/* New badge pinned to the corner so it never crowds the title */}
          {tool.isNew && (
            <Badge className="absolute bottom-2 right-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 leading-none">New</Badge>
          )}
        </div>
      </HoverCardTrigger>

      {/* Accent class repeated here: the content renders in a portal, so it
          doesn't inherit --tool-accent from the card — without it the visit
          button and badges lose their color. */}
      <HoverCardContent
        className={`${reviewHoverCardClass(tool)} ${accentClass}`}
        align="center"
        sideOffset={8}
      >
        <div className="space-y-3">
          {/* Header with icon + name */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden shrink-0"
              style={{
                backgroundColor: "color-mix(in oklch, var(--tool-accent) 12%, var(--popover))",
              }}
            >
              <ToolIcon
                iconUrl={tool.iconUrl}
                siteUrl={tool.url}
                alt={tool.name}
                className="h-full w-full object-cover"
                fallback={<Bot className="h-5 w-5" style={{ color: "var(--tool-accent)" }} />}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-semibold text-sm text-popover-foreground truncate">
                  {tool.name}
                </h4>
                {tool.isNew && (
                  <Badge className="shrink-0 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 leading-none">New</Badge>
                )}
              </div>
              {tool.category && (
                <Badge
                  variant="outline"
                  className="text-xs mt-1"
                  style={{
                    borderColor: "color-mix(in oklch, var(--tool-accent) 30%, transparent)",
                    color: "var(--tool-accent)",
                  }}
                >
                  {tool.category}
                </Badge>
              )}
            </div>
          </div>

          {/* Rating stars */}
          {tool.rating && tool.rating > 0 && (
            <StarRating rating={tool.rating} accent="var(--tool-accent)" />
          )}

          {/* Description in the selected language */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              {t("description")}
            </p>
            <p className="text-sm text-popover-foreground leading-relaxed">
              {description || t("noDescription")}
            </p>
            {tool.isAffiliate && tool.affiliateUrl && (
              <p className="text-xs text-muted-foreground italic mt-2">
                {t("affiliateDisclosure")}
              </p>
            )}
          </div>

          {/* Verified review: pros / cons / cost / verdict in the active language */}
          <ReviewDetails review={tool} />

          {/* Visit button — the only link out, so affiliate URLs can't be bypassed */}
          <VisitButton url={visitUrl} label={t("visitTool")} />
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
