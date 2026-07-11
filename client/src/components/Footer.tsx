import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-8 mt-auto bg-secondary/30">
      <div className="container text-center">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-primary">{t("brandName")}</span> — {t("footerText")}
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          © {year} {t("brandName")}. {t("footerRights")}.
        </p>
      </div>
    </footer>
  );
}
