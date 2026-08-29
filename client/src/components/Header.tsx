import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const segClass = (active: boolean) =>
    `rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${
      active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md shadow-sm">
      <div className="container flex h-20 items-center justify-between gap-3">
        {/* Logo — wordmark deliberately oversized. The mark scales with it, and the
            header grows to h-20 so a 36px cap-height still clears the bar. */}
        <a href="/" className="flex items-center gap-3 shrink-0">
          <img
            src="/aisumate-logo-192.png"
            alt=""
            aria-hidden="true"
            width={48}
            height={48}
            className="h-10 w-10 shrink-0 rounded-full sm:h-12 sm:w-12"
          />
          <span
            className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <span className="text-primary">ai</span><span className="text-foreground">sumate</span>
          </span>
        </a>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Language pill toggle */}
          <div className="flex items-center gap-0.5 rounded-full border border-border bg-secondary p-0.5">
            <button className={segClass(language === "en")} onClick={() => setLanguage("en")} aria-label={t("english")}>
              EN
            </button>
            <button className={segClass(language === "es")} onClick={() => setLanguage("es")} aria-label={t("spanish")}>
              ES
            </button>
          </div>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={t("toggleTheme")}
            className="h-9 w-9 rounded-full"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
