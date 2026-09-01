import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { SectionHeading } from "./toolVisuals";
import { ThisWeeksAiPicksSection } from "./ThisWeeksAiPicksSection";
import { SumateTopRecommendationsSection } from "./SumateTopRecommendationsSection";
import { WeeklyViralGithubSection } from "./WeeklyViralGithubSection";
import { formatPublishedDate } from "./BlogArticle";
import { blogSlug } from "@shared/blogSlug";

interface BlogRow {
  id: string;
  name: string;
  slug?: string;
  descriptionEn?: string;
  descriptionEs?: string;
  bodyEn?: string;
  author?: string;
  category?: string;
  readingTimeMinutes?: number;
  publishedDate?: string;
}

/**
 * The blog row on the home page. Cards, not a grid of tool tiles — a post is a
 * headline plus a standfirst, and it wants the room to show both.
 */
function BlogRowSection() {
  const { t, language } = useLanguage();
  const { data, isLoading } = trpc.aiMedia.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const posts = ((data?.tools ?? []) as BlogRow[])
    .filter((p) => p.bodyEn?.trim())
    // Newest first; posts with no date sink to the bottom.
    .sort((a, b) => String(b.publishedDate ?? "").localeCompare(String(a.publishedDate ?? "")))
    .slice(0, 3);

  if (isLoading || posts.length === 0) return null;

  return (
    <section className="pt-10 pb-2">
      <SectionHeading title={t("aiMediaTitle")} subtitle={t("aiMediaSubtitle")} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const standfirst =
            (language === "es" ? post.descriptionEs : post.descriptionEn) || post.descriptionEn || "";
          return (
            <Link
              key={post.id}
              href={`/blog/${blogSlug(post.slug, post.id)}`}
              className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                {post.category && (
                  <span
                    className="rounded-full px-2.5 py-0.5 font-medium"
                    style={{
                      backgroundColor: "color-mix(in oklch, var(--primary) 15%, transparent)",
                      color: "var(--primary)",
                    }}
                  >
                    {post.category}
                  </span>
                )}
                {post.publishedDate && (
                  <span>
                    {formatPublishedDate(post.publishedDate, language === "es" ? "es-ES" : "en-US")}
                  </span>
                )}
                {(post.readingTimeMinutes ?? 0) > 0 && (
                  <span>
                    {t("blogReadingTime").replace("{minutes}", String(post.readingTimeMinutes))}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                {post.name}
              </h3>

              {standfirst && (
                <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                  {standfirst}
                </p>
              )}

              <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-[13px] font-semibold text-primary">
                {t("readPost")}
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/**
 * The front page. Four curated rows that answer "what's worth knowing this
 * week" — the picks, the channels we rate, the repos that went viral, and our
 * own long-form pieces. The full AI Tools catalogue stays one tab away.
 *
 * Every row is an existing section component reused as-is, so the home page
 * can't drift from the tab each row also appears on. Each hides itself when
 * its table is empty, so a Teable outage thins the page instead of breaking it.
 */
export function HomeSection() {
  return (
    <div>
      <ThisWeeksAiPicksSection />
      <SumateTopRecommendationsSection limit={6} />
      <WeeklyViralGithubSection />
      <BlogRowSection />
    </div>
  );
}
