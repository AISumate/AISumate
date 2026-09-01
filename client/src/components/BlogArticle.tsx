import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

export interface BlogPostToolInfo {
  name: string;
  slug?: string;
  bodyEn?: string;
  bodyEs?: string;
  author?: string;
  tags?: string[];
  readingTimeMinutes?: number;
  publishedDate?: string;
  category?: string;
}

/** Teable's InputDate is a date-only value with no meaningful time-of-day — format in UTC so the
 * calendar date shown matches what's in Teable, regardless of the viewer's local timezone. */
export function formatPublishedDate(iso: string, locale: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

/** True when the post has a body worth opening. */
export function hasBody(post: BlogPostToolInfo | null | undefined): boolean {
  return Boolean(post?.bodyEn?.trim());
}

/**
 * One blog post, header + body. Lives on its own page at /blog/<slug> so the
 * article has a real URL and the crawler can index the text — it used to be
 * trapped in a modal, which meant neither.
 */
export function BlogArticle({ post }: { post: BlogPostToolInfo }) {
  const { t, language } = useLanguage();
  // Falls back to the English body until a "Body - ES" value exists in Teable.
  const body = (language === "es" && post.bodyEs) ? post.bodyEs : (post.bodyEn ?? "");

  return (
    <>
      <header>
        {post.category && (
          <span
            className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium mb-2"
            style={{
              backgroundColor: "color-mix(in oklch, var(--primary) 15%, transparent)",
              color: "var(--primary)",
            }}
          >
            {post.category}
          </span>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold leading-snug text-foreground">{post.name}</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs text-muted-foreground">
          {post.author && <span>{t("blogByAuthor")} {post.author}</span>}
          {(post.readingTimeMinutes ?? 0) > 0 && (
            <span>{t("blogReadingTime").replace("{minutes}", String(post.readingTimeMinutes))}</span>
          )}
          {post.publishedDate && (
            <span>{formatPublishedDate(post.publishedDate, language === "es" ? "es-ES" : "en-US")}</span>
          )}
        </div>
        {(post.tags?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-3">
            {post.tags!.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs font-normal">{tag}</Badge>
            ))}
          </div>
        )}
      </header>

      <article className="prose prose-sm sm:prose-base dark:prose-invert mt-6 max-w-none prose-headings:scroll-mt-4">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
      </article>
    </>
  );
}
