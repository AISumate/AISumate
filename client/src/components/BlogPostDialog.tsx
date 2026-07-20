import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
function formatPublishedDate(iso: string, locale: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

export function BlogPostDialog({
  tool,
  open,
  onOpenChange,
}: {
  tool: BlogPostToolInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t, language } = useLanguage();
  // Falls back to the English body until a "Body - ES" column exists in Teable.
  const body = (language === "es" && tool?.bodyEs) ? tool.bodyEs : (tool?.bodyEn ?? "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-5xl max-h-[85vh] overflow-y-auto">
        {tool && (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  {tool.category && (
                    <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium mb-2" style={{ backgroundColor: "color-mix(in oklch, var(--primary) 15%, transparent)", color: "var(--primary)" }}>
                      {tool.category}
                    </span>
                  )}
                  <DialogTitle className="text-xl sm:text-2xl leading-snug">{tool.name}</DialogTitle>
                  {tool.slug && (
                    <p className="text-xs text-muted-foreground mt-1 font-mono truncate">/{tool.slug}</p>
                  )}
                </div>
                {tool.publishedDate && (
                  <p className="shrink-0 text-xs text-muted-foreground whitespace-nowrap pt-1">
                    {formatPublishedDate(tool.publishedDate, language === "es" ? "es-ES" : "en-US")}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground pt-1">
                {tool.author && <span>{t("blogByAuthor")} {tool.author}</span>}
                {(tool.readingTimeMinutes ?? 0) > 0 && (
                  <span>{t("blogReadingTime").replace("{minutes}", String(tool.readingTimeMinutes))}</span>
                )}
              </div>
              {(tool.tags?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tool.tags!.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs font-normal">{tag}</Badge>
                  ))}
                </div>
              )}
            </DialogHeader>

            <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-headings:scroll-mt-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
            </article>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
