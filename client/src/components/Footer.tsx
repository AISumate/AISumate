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

        <p className="mt-3 text-sm text-muted-foreground">
          {t("footerContactLabel")}{" "}
          <a
            href="mailto:hello@aisumate.com"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            hello@aisumate.com
          </a>
        </p>

        {/* Disclosures — kept narrow and quiet so they read as fine print, not body copy. */}
        <div className="mx-auto mt-4 max-w-2xl space-y-1.5 text-xs leading-relaxed text-muted-foreground/80">
          <p>{t("footerPrivacy")}</p>
          <p>{t("footerRatingsDisclaimer")}</p>
          <p>{t("footerAffiliateDisclaimer")}</p>
        </div>

        <p className="text-xs text-muted-foreground/70 mt-4">
          © {year} {t("brandName")}. {t("footerRights")}.
        </p>
      </div>
    </footer>
  );
}
