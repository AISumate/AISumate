import { Sparkles } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import {
  accentClassFor,
  ReviewDetails,
  reviewHoverCardClass,
  SectionHeading,
  StarRating,
  ToolIcon,
  VisitButton,
  type ReviewInfo,
} from "./toolVisuals";

interface TopRecommendation extends ReviewInfo {
  id: string;
  name: string;
  descriptionEn: string;
  descriptionEs: string;
  url: string;
  iconUrl: string;
  category: string;
  rating: number;
  rank: number;
}

/**
 * Curated highlight strip above the AI Influencers grid. Source content is
 * English-only (Teable's "English"/"Spanish" columns confirm this), so the
 * whole strip hides when the site's language toggle is set to Spanish rather
 * than show untranslated cards.
 */
export function SumateTopRecommendationsSection() {
  const { t, language } = useLanguage();
  const { data, isLoading } = trpc.sumateTopRecommendations.list.useQuery(undefined);

  const items = (data?.tools ?? []) as TopRecommendation[];

  if (language === "es" || isLoading || items.length === 0) return null;

  const sorted = [...items].sort((a, b) => (a.rank || Infinity) - (b.rank || Infinity));

  return (
    <section className="pt-10 pb-2">
      <div className="container">
        <SectionHeading
          title={t("sumateTopRecommendationsTitle")}
          subtitle={t("sumateTopRecommendationsSubtitle")}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {sorted.map((item, idx) => {
            const accentClass = accentClassFor(idx);
            return (
              <HoverCard key={item.id} openDelay={300} closeDelay={200}>
                <HoverCardTrigger asChild>
                  <div className={`group relative flex flex-col items-center justify-center rounded-xl border border-border bg-card p-4 pt-8 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer min-h-[120px] overflow-hidden ${accentClass}`}>
                    {/* Rank badge */}
                    <div
                      className="absolute top-2.5 left-2.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shrink-0"
                      style={{ backgroundColor: "var(--tool-accent)", color: "oklch(0.96 0.01 60)" }}
                    >
                      {item.rank || idx + 1}
                    </div>

                    <div className="relative mb-3 flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden ring-2 ring-border group-hover:ring-[var(--tool-accent)] transition-all duration-200" style={{ backgroundColor: "color-mix(in oklch, var(--tool-accent) 12%, var(--card))" }}>
                      <ToolIcon
                        iconUrl={item.iconUrl}
                        siteUrl={item.url}
                        alt={item.name}
                        className="h-full w-full object-contain"
                        fallback={<Sparkles className="h-6 w-6" style={{ color: "var(--tool-accent)" }} />}
                      />
                    </div>
                    <p className="text-sm font-medium text-center text-foreground line-clamp-2">
                      {item.name}
                    </p>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className={`${reviewHoverCardClass(item, "p-4")} ${accentClass}`} side="top" align="center">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <ToolIcon
                        iconUrl={item.iconUrl}
                        siteUrl={item.url}
                        alt={item.name}
                        className="h-8 w-8 rounded object-contain shrink-0"
                        fallback={null}
                      />
                      <h4 className="font-semibold text-foreground">{item.name}</h4>
                    </div>
                    {(item.rating ?? 0) > 0 && (
                      <StarRating rating={item.rating} accent="var(--tool-accent)" />
                    )}
                    {item.descriptionEn && (
                      <p className="text-sm text-muted-foreground line-clamp-4">{item.descriptionEn}</p>
                    )}
                    {item.category && (
                      <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: "color-mix(in oklch, var(--tool-accent) 15%, transparent)", color: "var(--tool-accent)" }}>
                        {item.category}
                      </span>
                    )}
                    <ReviewDetails review={item} />
                    <VisitButton url={item.url} label={t("visitChannel")} />
                  </div>
                </HoverCardContent>
              </HoverCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
