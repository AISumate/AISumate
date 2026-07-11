import { useLanguage } from "@/contexts/LanguageContext";
import { GlobalSearch } from "./GlobalSearch";

const VIDEO_URL = "/hero-video.mp4";

export function Hero({ toolCount, isLoading }: { toolCount: number; isLoading?: boolean }) {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden border-b border-border min-h-[420px] flex items-center justify-center">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster=""
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>

      {/* Dark overlay for video readability */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

      {/* Content with glass box */}
      <div className="container relative py-20 sm:py-28 text-center z-10">
        <div className="glass-box inline-block px-8 sm:px-12 py-8 sm:py-10 max-w-2xl fade-up">
          {/* Mono tick label — Command Centre signature */}
          <p
            className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/70 mb-3 drop-shadow"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            AI Tool Directory — EN / ES
          </p>

          {/* Brand name — no .com */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-white mb-4 drop-shadow-lg">
            <span className="text-primary drop-shadow-lg">ai</span>sumate
          </h1>

          {/* Tagline */}
          <p className="text-lg sm:text-xl text-white/90 max-w-xl mx-auto leading-relaxed mb-2 drop-shadow">
            {t("tagline")}
          </p>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-white/70 max-w-lg mx-auto mb-6 drop-shadow">
            {t("subtitle")}
          </p>

          {/* Tool count badge */}
          {isLoading ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-5 py-2">
              <span className="h-2 w-2 rounded-full bg-primary pulse-dot" />
              <span className="h-4 w-10 animate-pulse rounded bg-white/30" />
              <span className="text-sm text-white/80">
                {t("toolsCount")}
              </span>
            </div>
          ) : toolCount > 0 ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-5 py-2">
              <span className="h-2 w-2 rounded-full bg-primary pulse-dot" />
              <span
                className="text-sm font-semibold text-white tabular-nums"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {toolCount.toLocaleString()}
              </span>
              <span className="text-sm text-white/80">
                {t("toolsCount")}
              </span>
            </div>
          ) : null}
        </div>

        {/* Global search bar */}
        <div className="mt-8 relative z-20 fade-up fade-up-delay-1">
          <GlobalSearch />
        </div>
      </div>
    </section>
  );
}
