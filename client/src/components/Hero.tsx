import { useCallback, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { GlobalSearch } from "./GlobalSearch";

export function Hero({ toolCount, isLoading }: { toolCount: number; isLoading?: boolean }) {
  const { t } = useLanguage();
  const [chipQuery, setChipQuery] = useState<string | undefined>(undefined);
  const [searchOpen, setSearchOpen] = useState(false);
  const handleSearchOpenChange = useCallback((open: boolean) => setSearchOpen(open), []);

  // The results dropdown is absolutely positioned over these two rows and is
  // narrower than them, so their ends bleed out around its edges. Hide them
  // while it's open, keeping their layout space so the page doesn't jump.
  // Must be `visibility`, not opacity: these rows carry `fade-up`, whose
  // `animation-fill-mode: both` retains `opacity: 1` and outranks an opacity
  // utility in the cascade. The keyframes don't touch visibility.
  const hiddenUnderDropdown = searchOpen ? "invisible" : "visible";

  const chips = [
    { label: t("heroChipVoiceCloning"), value: "voice cloning" },
    { label: t("heroChipFreeLlmApi"), value: "free LLM API" },
    { label: t("heroChipImageUpscaler"), value: "image upscaler" },
  ];

  return (
    // z-40: the search dropdown must paint over the sticky category nav (z-30) below.
    // overflow stays visible so the dropdown can extend past the hero's bottom edge.
    <section className="relative z-40 border-b border-border">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(640px 300px at 22% -10%, color-mix(in srgb, var(--primary) 16%, transparent), transparent 70%), radial-gradient(720px 340px at 78% 0%, color-mix(in srgb, var(--chart-3) 9%, transparent), transparent 70%)",
        }}
      />

      <div className="relative container max-w-3xl mx-auto text-center py-16 sm:py-20">
        {/* Tools-indexed pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 backdrop-blur-sm px-3.5 py-1.5 text-xs font-semibold text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--chart-2)] pulse-dot" />
          {isLoading ? (
            <span className="h-4 w-10 animate-pulse rounded bg-muted-foreground/20" />
          ) : (
            <span className="text-foreground font-extrabold tabular-nums" style={{ fontFamily: "var(--font-mono)" }}>
              {toolCount.toLocaleString()}
            </span>
          )}{" "}
          {t("heroBadgeSuffix")}
        </div>

        {/* Headline */}
        <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.06] tracking-tight text-foreground fade-up">
          {t("heroHeadlineLine1")} <span className="text-primary">{t("heroHeadlineHighlight")}</span>.
          <br />
          {t("heroHeadlineLine2")}
        </h1>

        {/* Description */}
        <p className="mt-4 max-w-xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed fade-up fade-up-delay-1">
          {t("heroDescription")}
        </p>

        {/* Search */}
        <div className="mt-7 fade-up fade-up-delay-1">
          <GlobalSearch
            presetQuery={chipQuery}
            placeholder={t("heroSearchPlaceholder")}
            onOpenChange={handleSearchOpenChange}
          />
        </div>

        {/* Quick-search chips — kept tight under the search bar with the trust row */}
        <div
          className={`mt-3 flex flex-wrap items-center justify-center gap-2 text-xs fade-up fade-up-delay-2 ${hiddenUnderDropdown}`}
        >
          <span className="text-muted-foreground font-medium">{t("heroTryLabel")}</span>
          {chips.map((chip) => (
            <button
              key={chip.value}
              onClick={() => setChipQuery(chip.value)}
              className="rounded-full border border-border px-3 py-1 font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Trust row */}
        <div
          className={`mt-3 flex flex-wrap items-center justify-center gap-5 text-xs font-semibold text-muted-foreground fade-up fade-up-delay-2 ${hiddenUnderDropdown}`}
        >
          <span className="inline-flex items-center gap-1.5">
            <span className="text-[color:var(--chart-2)]">✓</span> {t("trustCurated")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-[color:var(--chart-2)]">✓</span> {t("trustNoPayToRank")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-[color:var(--chart-2)]">✓</span> {t("trustBilingual")}
          </span>
        </div>
      </div>
    </section>
  );
}
