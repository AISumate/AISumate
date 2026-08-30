import { Link } from "wouter";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

/** Branded in-app 404 (unknown client-side routes). Unknown paths that never
 *  reach the app return a real HTTP 404 at the edge — see vercel.json. */
export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container flex flex-1 flex-col items-center justify-center py-24 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: "color-mix(in oklch, var(--primary) 12%, var(--card))" }}
        >
          <Compass className="h-8 w-8 text-primary" />
        </div>
        <h1
          className="mt-6 text-5xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          404
        </h1>
        <h2 className="mt-2 text-xl font-semibold text-foreground">{t("notFoundTitle")}</h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          {t("notFoundBody")}
        </p>
        <Button asChild className="mt-8">
          <Link href="/">{t("goHome")}</Link>
        </Button>
      </main>
      <Footer />
    </div>
  );
}
