import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import type { LegalDoc } from "@shared/legalContent";

/**
 * Shared renderer for the Privacy and Terms pages. Content lives in
 * shared/legalContent.ts (bilingual, also baked into static pages for
 * crawlers by scripts/prerender.ts) — this component only presents it in the
 * site chrome, following the language toggle.
 */
export function LegalPage({ doc }: { doc: { en: LegalDoc; es: LegalDoc } }) {
  const { language, t } = useLanguage();
  const d = language === "es" ? doc.es : doc.en;

  useEffect(() => {
    document.title = `${d.title} — aisumate`;
    return () => {
      document.title = "aisumate — AI Productivity Tools Directory";
    };
  }, [d.title]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container max-w-3xl flex-1 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backHome")}
        </Link>

        <div className="mt-6 border-l-4 border-primary pl-4">
          <h1
            className="text-3xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {d.title}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
            {t("legalUpdated")}: {d.updated}
          </p>
        </div>

        <p className="mt-6 text-base leading-relaxed text-foreground">{d.intro}</p>

        {d.sections.map((s) => (
          <section key={s.heading} className="mt-8">
            <h2 className="text-xl font-semibold text-foreground">{s.heading}</h2>
            {s.paragraphs.map((p, i) => (
              <p key={i} className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
          </section>
        ))}
      </main>
      <Footer />
    </div>
  );
}
