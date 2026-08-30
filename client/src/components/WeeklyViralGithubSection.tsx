import { Flame, GitBranch, Star, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import {
  accentClassFor,
  formatCompactNumber,
  ReviewDetails,
  reviewHoverCardClass,
  SectionHeading,
  StarRating,
  ToolIcon,
  VisitButton,
  type ReviewInfo,
} from "./toolVisuals";

interface WeeklyViralRepo extends ReviewInfo {
  id: string;
  name: string;
  repoUrl: string;
  descriptionEn: string;
  descriptionEs: string;
  owner: string;
  language: string;
  stars: number;
  starsThisWeek: number;
  weeklyRank: number;
  weekEnding: string;
  whyViral: string;
  iconUrl: string;
  rating: number;
}

function formatWeekOf(dateStr: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

/**
 * This week's curated trending AI repos — a highlight strip above the full
 * GitHub Repos table, ranked by Weekly Rank (1 = most viral).
 */
export function WeeklyViralGithubSection() {
  const { t, language } = useLanguage();
  const { data, isLoading } = trpc.weeklyViralGithub.list.useQuery(undefined);

  const repos = (data?.repos ?? []) as WeeklyViralRepo[];

  // Supplementary content: while loading or if the table is empty, render
  // nothing rather than an empty box above the real GitHub Repos table.
  if (isLoading || repos.length === 0) return null;

  const weekOf = formatWeekOf(repos[0]?.weekEnding);

  return (
    <section className="pt-10 pb-2">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <SectionHeading
            title={t("weeklyViralGithubTitle")}
            subtitle={t("weeklyViralGithubSubtitle")}
          />
          {weekOf && (
            <span
              className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.1em] text-muted-foreground"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <Flame className="h-3 w-3" style={{ color: "var(--primary)" }} />
              {t("weeklyViralWeekOf")} {weekOf}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {repos.map((repo, idx) => {
            const description =
              language === "es" ? repo.descriptionEs : repo.descriptionEn;
            const accentClass = accentClassFor(idx);
            return (
              <HoverCard key={repo.id} openDelay={200} closeDelay={150}>
                <HoverCardTrigger asChild>
                  <div
                    className={`group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 pt-9 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer overflow-hidden ${accentClass}`}
                  >
                    {/* Rank badge — positional (1-based) within this week's
                        strip. The list arrives already sorted by Weekly Rank
                        (most viral first), so position is the true display rank
                        and stays a clean 1..N even when the source data has
                        gaps or ties (e.g. two rows both entered as rank 5). */}
                    <div
                      className="absolute top-3 left-3 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold shrink-0"
                      style={{
                        backgroundColor: "var(--tool-accent)",
                        color: "oklch(0.96 0.01 60)",
                      }}
                    >
                      {idx + 1}
                    </div>

                    {/* Trending-this-week badge */}
                    {repo.starsThisWeek > 0 && (
                      <div
                        className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{
                          backgroundColor:
                            "color-mix(in oklch, var(--tool-accent) 15%, transparent)",
                          color: "var(--tool-accent)",
                        }}
                      >
                        <TrendingUp className="h-3 w-3" />+
                        {formatCompactNumber(repo.starsThisWeek)}
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg overflow-hidden ring-2 ring-border group-hover:ring-[var(--tool-accent)] transition-all"
                        style={{
                          backgroundColor:
                            "color-mix(in oklch, var(--tool-accent) 12%, var(--card))",
                        }}
                      >
                        <ToolIcon
                          iconUrl={repo.iconUrl}
                          siteUrl={repo.repoUrl}
                          alt={repo.name}
                          className="h-full w-full object-cover"
                          fallback={
                            <GitBranch
                              className="h-5 w-5"
                              style={{ color: "var(--tool-accent)" }}
                            />
                          }
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-card-foreground truncate">
                          {repo.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {repo.owner}
                        </p>
                      </div>
                    </div>

                    {repo.whyViral && (
                      <p className="text-xs text-muted-foreground italic line-clamp-3 flex-1">
                        {repo.whyViral}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
                        <Star
                          className="h-3 w-3 fill-current"
                          style={{ color: "var(--tool-accent)" }}
                        />
                        {formatCompactNumber(repo.stars)}
                      </span>
                      {repo.language && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-normal"
                          style={{
                            backgroundColor:
                              "color-mix(in oklch, var(--tool-accent) 15%, transparent)",
                            color: "var(--tool-accent)",
                          }}
                        >
                          {repo.language}
                        </Badge>
                      )}
                    </div>
                  </div>
                </HoverCardTrigger>

                <HoverCardContent
                  className={`${reviewHoverCardClass(repo, "p-5")} ${accentClass}`}
                  side="top"
                  align="center"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden shrink-0"
                        style={{
                          backgroundColor:
                            "color-mix(in oklch, var(--tool-accent) 12%, var(--popover))",
                        }}
                      >
                        <ToolIcon
                          iconUrl={repo.iconUrl}
                          siteUrl={repo.repoUrl}
                          alt={repo.name}
                          className="h-full w-full object-cover"
                          fallback={
                            <GitBranch
                              className="h-5 w-5"
                              style={{ color: "var(--tool-accent)" }}
                            />
                          }
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm text-popover-foreground truncate">
                          {repo.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          {repo.language && (
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{
                                borderColor:
                                  "color-mix(in oklch, var(--tool-accent) 30%, transparent)",
                                color: "var(--tool-accent)",
                              }}
                            >
                              {repo.language}
                            </Badge>
                          )}
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Star
                              className="h-3 w-3 fill-current"
                              style={{ color: "var(--tool-accent)" }}
                            />
                            {formatCompactNumber(repo.stars)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {repo.rating > 0 && (
                      <StarRating
                        rating={repo.rating}
                        accent="var(--tool-accent)"
                      />
                    )}

                    {description && (
                      <p className="text-sm text-popover-foreground leading-relaxed">
                        {description}
                      </p>
                    )}

                    {repo.whyViral && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          {t("weeklyViralWhyViral")}
                        </p>
                        <p className="text-sm italic text-popover-foreground leading-relaxed">
                          {repo.whyViral}
                        </p>
                      </div>
                    )}

                    <ReviewDetails review={repo} />

                    <VisitButton url={repo.repoUrl} label={t("visitRepo")} />
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
