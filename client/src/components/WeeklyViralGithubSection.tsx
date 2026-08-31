import { Flame, Star, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import {
  formatCompactNumber,
  SectionHeading,
  type ReviewInfo,
} from "./toolVisuals";
import { ToolCard, type AiTool } from "./ToolCard";

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
 *
 * Uses the shared ToolCard (Description button + Visit Repo button) so it works
 * on touch devices; the rank badge and the "+stars this week" pill are passed
 * through ToolCard's optional rank/cornerBadge slots.
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
      <div>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {repos.map((repo, idx) => {
            const description =
              language === "es" ? repo.descriptionEs : repo.descriptionEn;
            return (
              <ToolCard
                key={repo.id}
                index={idx}
                // Positional rank: the list arrives sorted by Weekly Rank, so
                // this stays a clean 1..N even when the source data has gaps.
                rank={idx + 1}
                tableKey="weeklyViralGithub"
                visitLabel={t("visitRepo")}
                cornerBadge={
                  repo.starsThisWeek > 0 ? (
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{
                        backgroundColor:
                          "color-mix(in oklch, var(--tool-accent) 15%, transparent)",
                        color: "var(--tool-accent)",
                      }}
                    >
                      <TrendingUp className="h-3 w-3" />+
                      {formatCompactNumber(repo.starsThisWeek)}
                    </span>
                  ) : undefined
                }
                detailExtra={
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
                        <Star
                          className="h-3 w-3 fill-current"
                          style={{ color: "var(--tool-accent)" }}
                        />
                        {formatCompactNumber(repo.stars)}
                      </span>
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
                    </div>
                    {repo.whyViral && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          {t("weeklyViralWhyViral")}
                        </p>
                        <p className="text-sm italic text-foreground leading-relaxed">
                          {repo.whyViral}
                        </p>
                      </div>
                    )}
                  </div>
                }
                tool={
                  {
                    ...repo,
                    descriptionEn: description || repo.whyViral || "",
                    descriptionEs: description || repo.whyViral || "",
                    // Owner reads better than language under the repo name.
                    category: repo.owner || repo.language || "",
                    url: repo.repoUrl,
                    affiliateUrl: "",
                  } as AiTool
                }
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
