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
      <div className="container flex h-16 items-center justify-between gap-3">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src="/aisumate-logo-192.png"
            alt=""
            aria-hidden="true"
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-full"
          />
          <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
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
