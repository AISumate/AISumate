import { useEffect, useMemo } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { BlogArticle, type BlogPostToolInfo } from "@/components/BlogArticle";
import { blogSlug } from "@shared/blogSlug";
import { lastTab } from "@/lib/lastTab";

/**
 * A single blog post at its own URL: /blog/:slug
 *
 * The posts live in the AI Media table and used to be readable only through a
 * modal on the Blog tab — no URL to share, and nothing for a crawler to index.
 * This page gives each one a real address; scripts/prerender.ts writes the
 * matching static twin so the body text is visible to search engines.
 *
 * Matched on the record's Slug, falling back to the record id so a post with
 * an empty Slug column is still reachable.
 */
export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const { t } = useLanguage();
  const slug = params.slug ?? "";

  const query = trpc.aiMedia.list.useQuery(undefined, { refetchOnWindowFocus: false });

  const post = useMemo(() => {
    const rows = (query.data?.tools ?? []) as (BlogPostToolInfo & { id: string })[];
    // Compare on the normalised slug, so the page resolves for exactly the
    // addresses the links and the crawler twins use.
    return rows.find((r) => blogSlug(r.slug, r.id) === slug) ?? rows.find((r) => r.id === slug);
  }, [query.data, slug]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (post?.name) document.title = `${post.name} — aisumate`;
    return () => {
      document.title = "aisumate — AI Productivity Tools Directory";
    };
  }, [post?.name]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container flex-1 py-7">
        <Link
          href={`/#${lastTab("aiMedia")}`}
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backHome")}
        </Link>

        {query.isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : post ? (
          <div className="mx-auto max-w-3xl">
            <BlogArticle post={post} />
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">{t("toolNotFound")}</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
