export type Language = "en" | "es";

export const translations = {
  en: {
    // Hero section
    brandName: "aisumate",
    tagline: "Discover the best AI productivity tools in one place",
    subtitle: "Browse, search, and find the perfect AI tool for your workflow",
    ctaExplore: "Explore Tools",

    // Search & Filter
    searchPlaceholder: "Filter this section by name...",
    homeSearchPlaceholder: "Search every tool, model and repo…",
    sortByRelevance: "Sort by relevance",
    allCategories: "All Categories",
    filterByCategory: "Filter by category",
    aiRelevanceFilter: "AI relevance",
    aiRelevanceAll: "All tools",
    aiRelevanceAiOnly: "AI only",
    aiRelevanceAiFirstOnly: "AI-first only",
    badgeAiFirst: "AI-first",
    badgeAiEnabled: "AI-enabled",
    results: "results",
    result: "result",
    noResults: "No tools found",
    noResultsDesc: "Try adjusting your search or filter",

    // Carousel
    carouselTitle: "Browse A–Z",
    carouselSubtitle: "Scroll through all available tools",

    // Tool card
    visitTool: "Visit Tool",
    category: "Category",
    description: "Description",
    noDescription: "No description available",
    affiliateDisclosure: "Affiliate link — we may earn a commission",

    visitChannel: "Visit Channel",
    visitSite: "Visit Site",
    visitServer: "Join Server",

    // Verified review sections
    reviewPros: "Pros",
    reviewCons: "Cons",
    reviewCost: "Cost",
    reviewVerdict: "Verdict",
    confidenceHigh: "High confidence",
    confidenceMedium: "Medium confidence",
    confidenceLow: "Low confidence",

    // Language switcher
    english: "English",
    spanish: "Español",

    // Theme
    lightMode: "Light",
    darkMode: "Dark",

    // Footer
    footerText: "Your gateway to AI productivity",
    footerRights: "All rights reserved",
    footerContactLabel: "Contact us:",
    privacyLink: "Privacy",
    termsLink: "Terms",
    legalUpdated: "Last updated",
    backHome: "Back to the directory",
    notFoundTitle: "Page not found",
    notFoundBody: "That page doesn't exist — the whole directory lives on the home page.",
    goHome: "Go to the directory",
    openToolPage: "Open page",
    copyLink: "Copy link",
    linkCopied: "Link copied",
    toolNotFound: "Listing not found — it may have been removed from the directory.",
    relatedIn: "Related in",
    fromTheMaker: "From the maker",
    makerReserved: "This space is reserved for {name} — makers can add their own note, screenshots and a video here.",
    claimPage: "Claim this page",
    ourVerdict: "Our verdict",
    verdictSignature: "— aisumate editors",
    viewTool: "View tool",
    costVerifyNote: "Verify current pricing on the tool's site.",
    // Deliberately precise: the site loads Google Fonts and falls back to Google's
    // favicon service for tool logos, so a blanket "we collect nothing" would be
    // untrue. Revisit this wording if those third-party calls are ever removed.
    footerPrivacy:
      "We run no analytics and set no tracking or advertising cookies — we don't collect, store or sell your personal data. Your language and theme choices are saved only in your own browser. Fonts and some tool logos load from Google, so your IP address is visible to them.",
    footerRatingsDisclaimer:
      "Ratings are opinions only and may be changed after further review.",
    footerAffiliateDisclaimer:
      "Affiliate links may be added to some sites, which provides funding to keep this site alive.",

    // Section tabs
    tabTools: "AI Tools",
    tabGithub: "GitHub Repos",
    tabLlms: "LLMs",
    tabLtds: "LTDs",
    tabVideoImage: "Video & Image",
    tabMusicVoice: "Music & Voice",
    tabChatbots: "Chatbots & Agents",
    tabFreeApis: "Free APIs",
    tabFreeLlmIde: "Free LLM & IDE",
    tabVibeCoding: "Vibe Coding",
    tabDesignerTools: "Designer Tools",
    tabAiInfra: "AI Infrastructure",
    tabHardware: "Hardware & Computers",
    tabTestingTools: "Testing Tools",
    tabAiSecurity: "AI Security",
    tabBusinessProductivity: "Business Productivity",
    tabMcpProviders: "MCP Providers",
    tabVpsCloud: "VPS & Cloud",
    // Tab key stays `aiMedia` (and the #aiMedia hash with it) — label only.
    iconAiMedia: "Blog",
    iconAiInfluencers: "AI Influencers",
    iconAiSites: "AI Sites",
    iconAiDiscord: "AI Discord",
    tabAuSeoTools: "AU SEO Tools",

    // GitHub Repos section
    githubTitle: "GitHub Repositories",
    githubSubtitle: "Explore popular AI-related repositories sorted by stars",
    repoName: "Repository",
    repoStars: "Stars",
    repoOwner: "Owner",
    repoLanguage: "Language",
    repoDescription: "Description",
    repoStatus: "Status",
    visitRepo: "Visit Repo",

    // Weekly Viral GitHub Repos section
    weeklyViralGithubTitle: "This Week's Viral GitHub Repos",
    weeklyViralGithubSubtitle: "The AI repos exploding on GitHub this week, ranked by trending velocity",
    weeklyViralWeekOf: "Week of",
    weeklyViralWhyViral: "Why it's viral",
    weeklyViralStarsThisWeek: "this week",

    // AU SEO Tools section
    auSeoToolsTitle: "AU SEO Tools",
    auSeoToolsSubtitle: "AI-powered SEO and GEO/AEO tools for content optimization and search visibility",

    // LLMs section
    llmTitle: "Large Language Models",
    llmSubtitle: "Browse AI model providers and their offerings",
    llmProviderType: "Provider Type",
    visitModel: "Visit Model",

    // LTDs section
    ltdTitle: "Lifetime Deals",
    ltdSubtitle: "Exclusive lifetime deals on AI tools and software",
    ltdPlatform: "Platform",
    ltdStatus: "Status",
    visitDeal: "Visit Deal",
    noDeals: "No lifetime deals available yet",

    // Video & Image section
    videoImageTitle: "Video & Image Creators",
    videoImageSubtitle: "AI tools for generating and editing videos and images",
    visitToolGeneric: "Visit Tool",
    noResultsGeneric: "No tools available yet",

    // Music & Voice section
    musicVoiceTitle: "Music & Voice",
    musicVoiceSubtitle: "AI tools for music generation and voice synthesis",

    // Chatbots & Agents section
    chatbotsTitle: "Chatbots & Agents",
    chatbotsSubtitle: "AI chatbots and autonomous agents for every use case",

    // Free APIs section
    freeApisTitle: "Free APIs",
    freeApisSubtitle: "Free API resources and endpoints for developers",

    // Free LLM & IDE section
    freeLlmIdeTitle: "Free LLM & IDE",
    freeLlmIdeSubtitle: "Free large language models and integrated development environments",

    // Vibe Coding section
    vibeCodingTitle: "Vibe Coding",
    vibeCodingSubtitle: "AI-powered coding tools for the vibe coding movement",

    // Designer Tools section
    designerToolsTitle: "Designer Tools",
    designerToolsSubtitle: "AI tools for designers and creative professionals",

    // AI Infrastructure section
    aiInfraTitle: "AI Infrastructure",
    aiInfraSubtitle: "Infrastructure and platform tools for building AI applications",

    // Hardware & Computers section
    hardwareTitle: "Hardware & Computers",
    hardwareSubtitle: "Hardware and computing devices optimized for AI workloads",

    // Testing Tools section
    testingToolsTitle: "Testing Tools",
    testingToolsSubtitle: "AI-powered testing tools for QA and software testing teams",

    // AI Security section
    aiSecurityTitle: "AI Security",
    aiSecuritySubtitle: "Security tools and platforms for protecting AI systems and data",

    // Business Productivity section
    businessProductivityTitle: "Business Productivity",
    businessProductivitySubtitle: "AI tools for boosting business productivity and team collaboration",

    // MCP Providers section
    mcpProvidersTitle: "MCP Providers",
    mcpProvidersSubtitle: "Model Context Protocol providers and integration platforms",

    // VPS & Cloud Providers section
    vpsCloudTitle: "VPS & Cloud Providers",
    vpsCloudSubtitle: "Cloud hosting and VPS providers optimized for AI workloads",

    // AI Media section
    aiMediaTitle: "Blog",
    aiMediaSubtitle: "Long-form comparisons and reports on the AI models and tools we test",

    // AI Influencers section
    aiInfluencersTitle: "AI Influencers",
    aiInfluencersSubtitle: "Key voices and influencers shaping the AI industry and community",

    // Sumate Top Recommendations — English-only, hidden entirely in Spanish
    sumateTopRecommendationsTitle: "Sumate Top Recommendations",
    sumateTopRecommendationsSubtitle: "Our editors' picks — the creators and channels we rate highest",
    thisWeeksAiPicksTitle: "This Week's AI Picks",
    thisWeeksAiPicksSubtitle: "Our top 5 tools this week — hand-picked, tested and reviewed",

    // AI Sites section
    aiSitesTitle: "AI Sites",
    aiSitesSubtitle: "Curated directories and websites dedicated to AI tools and resources",

    // AI Discord section
    aiDiscordTitle: "AI Discord",
    aiDiscordSubtitle: "Active Discord communities and servers for AI discussions and networking",

    // Misc
    loading: "Loading...",
    errorLoading: "Failed to load data. Please try again later.",
    toolsCount: "tools available",
    toggleLanguage: "Toggle language",
    toggleTheme: "Toggle theme",
    clearSearch: "Clear search",
    previousSlide: "Previous slide",
    nextSlide: "Next slide",
    of: "of",
    sortByName: "Sort by name",
    sortByCategory: "Sort by category",
    sortByStars: "Sort by stars",
    sortByPopularity: "Sort by popularity",
    sortBy: "Sort by",
    sortAscending: "Ascending",
    sortDescending: "Descending",
    ratingsLegend: "1 = Indie · 5 = Market Leader",
    ratingsLegendFull: "Ratings run from 1 (Indie) to 5 (Market Leader)",
    loadMore: "Load more",
    showingResults: "Showing {shown} of {total}",
    allOption: "All",
    resetFilters: "Reset filters",
    filterByLanguage: "Filter by language",
    filterByProvider: "Filter by provider",
    filterByPlatform: "Filter by platform",
    filterByStatus: "Filter by status",
    filterByTopic: "Filter by topic",
    filterBySource: "Filter by source",
    filterByType: "Filter by type",
    filterByAffiliate: "Filter by affiliate",
    affiliateOnly: "Affiliate only",
    directOnly: "Direct only",
    sortByDate: "Sort by date",
    sortByPlatform: "Sort by platform",
    sortByStatus: "Sort by status",
    sortByProvider: "Sort by provider",
    sortByRating: "Sort by rating",
    languageFilterEnglish: "English",
    languageFilterSpanish: "Spanish",
    languageFilterBoth: "Both",
    blogByAuthor: "By",
    blogReadingTime: "{minutes} min read",

    // Home tab
    tabHome: "Home",
    readPost: "Read post",

    // Hand-written personal review on a tool ("Blog Post" columns in Teable)
    reviewButton: "Read our review",
    reviewSectionTitle: "Our review",
    hasReviewTooltip: "We've written a hands-on review of this tool",

    // Global search
    globalSearchPlaceholder: "Search across all tools...",
    globalSearchResults: "results found across all categories",
    globalSearchNoResults: "No tools found. Try a different search term.",
    globalSearchLoading: "Searching across all tables...",
    globalSearchTitle: "Global Search Results",
    sourceTable: "Category",

    // Hero redesign (2026-07 Claude Design handoff)
    heroBadgeSuffix: "tools indexed · updated daily",
    heroHeadlineLine1: "Find the right",
    heroHeadlineHighlight: "AI tool",
    heroHeadlineLine2: "Skip the noise.",
    heroDescription: "Every tool is tested, rated, and reviewed in English and Spanish — updated daily to save you time and money.",
    heroSearchPlaceholder: "Search a tool, task, or category…",
    heroTryLabel: "Try:",
    heroChipVoiceCloning: "voice cloning",
    heroChipFreeLlmApi: "free LLM API",
    heroChipImageUpscaler: "image upscaler",
    trustCurated: "Human-curated",
    trustNoPayToRank: "No pay-to-rank",
    trustBilingual: "EN / ES reviews",

    // Header
    submitATool: "Submit a tool",
    submitToolComingSoon: "Tool submissions are coming soon!",

    // Tool card hover teaser
    clickForDetails: "Click for details →",

    // Category bar visibility toggle
    hideCategoryBar: "Hide category bar",
    showCategoryBar: "Show category bar",

    // Category groups
    groupDiscover: "Discover",
    groupModels: "Models & APIs",
    groupBuild: "Build & Code",
    groupCreate: "Create",
    groupWork: "Work",
    groupRun: "Infra & Ops",
  },
  es: {
    // Hero section
    brandName: "aisumate",
    tagline: "Descubre las mejores herramientas de productividad con IA en un solo lugar",
    subtitle: "Explora, busca y encuentra la herramienta de IA perfecta para tu flujo de trabajo",
    ctaExplore: "Explorar Herramientas",

    // Search & Filter
    searchPlaceholder: "Filtrar esta sección por nombre...",
    homeSearchPlaceholder: "Busca en todas las herramientas, modelos y repos…",
    sortByRelevance: "Ordenar por relevancia",
    allCategories: "Todas las Categorías",
    filterByCategory: "Filtrar por categoría",
    aiRelevanceFilter: "Relevancia de IA",
    aiRelevanceAll: "Todas las herramientas",
    aiRelevanceAiOnly: "Solo IA",
    aiRelevanceAiFirstOnly: "Solo IA nativa",
    badgeAiFirst: "IA nativa",
    badgeAiEnabled: "Con IA",
    results: "resultados",
    result: "resultado",
    noResults: "No se encontraron herramientas",
    noResultsDesc: "Intenta ajustar tu búsqueda o filtro",

    // Carousel
    carouselTitle: "Explorar A–Z",
    carouselSubtitle: "Desplázate por todas las herramientas disponibles",

    // Tool card
    visitTool: "Visitar Herramienta",
    category: "Categoría",
    description: "Descripción",
    noDescription: "No hay descripción disponible",
    affiliateDisclosure: "Enlace de afiliado — podemos ganar una comisión",

    visitChannel: "Visitar Canal",
    visitSite: "Visitar Sitio",
    visitServer: "Unirse al Servidor",

    // Verified review sections
    reviewPros: "Ventajas",
    reviewCons: "Desventajas",
    reviewCost: "Precio",
    reviewVerdict: "Veredicto",
    confidenceHigh: "Confianza alta",
    confidenceMedium: "Confianza media",
    confidenceLow: "Confianza baja",

    // Language switcher
    english: "English",
    spanish: "Español",

    // Theme
    lightMode: "Claro",
    darkMode: "Oscuro",

    // Footer
    footerText: "Tu puerta de entrada a la productividad con IA",
    footerRights: "Todos los derechos reservados",
    footerContactLabel: "Contáctanos:",
    privacyLink: "Privacidad",
    termsLink: "Términos",
    legalUpdated: "Última actualización",
    backHome: "Volver al directorio",
    notFoundTitle: "Página no encontrada",
    notFoundBody: "Esa página no existe — todo el directorio vive en la página de inicio.",
    goHome: "Ir al directorio",
    openToolPage: "Abrir página",
    copyLink: "Copiar enlace",
    linkCopied: "Enlace copiado",
    toolNotFound: "Ficha no encontrada — puede haber sido retirada del directorio.",
    relatedIn: "Relacionados en",
    fromTheMaker: "Del creador",
    makerReserved: "Este espacio está reservado para {name} — los creadores pueden añadir aquí su propia nota, capturas y un vídeo.",
    claimPage: "Reclamar esta página",
    ourVerdict: "Nuestro veredicto",
    verdictSignature: "— editores de aisumate",
    viewTool: "Ver herramienta",
    costVerifyNote: "Verifica el precio actual en el sitio de la herramienta.",
    footerPrivacy:
      "No usamos analíticas ni cookies de rastreo o publicidad, y no recopilamos, almacenamos ni vendemos tus datos personales. Tus preferencias de idioma y tema se guardan solo en tu propio navegador. Las fuentes y algunos logos de herramientas se cargan desde Google, por lo que tu dirección IP es visible para ellos.",
    footerRatingsDisclaimer:
      "Las calificaciones son solo opiniones y pueden cambiar tras una revisión posterior.",
    footerAffiliateDisclaimer:
      "Es posible que se añadan enlaces de afiliados a algunos sitios, lo que ayuda a financiar el mantenimiento de este sitio.",

    // Section tabs
    tabTools: "Herramientas IA",
    tabGithub: "Repos GitHub",
    tabLlms: "LLMs",
    tabLtds: "Ofertas LTD",
    tabVideoImage: "Video e Imagen",
    tabMusicVoice: "Música y Voz",
    tabChatbots: "Chatbots y Agentes",
    tabFreeApis: "APIs Gratis",
    tabFreeLlmIde: "LLM e IDE Gratis",
    tabVibeCoding: "Vibe Coding",
    tabDesignerTools: "Herramientas para Diseñadores",
    tabAiInfra: "Infraestructura IA",
    tabHardware: "Hardware y Computadoras",
    tabTestingTools: "Herramientas de Testing",
    tabAiSecurity: "Seguridad IA",
    tabBusinessProductivity: "Productividad Empresarial",
    tabMcpProviders: "Proveedores MCP",
    tabVpsCloud: "VPS y Nube",
    iconAiMedia: "Blog",
    iconAiInfluencers: "IA Influencers",
    iconAiSites: "Sitios IA",
    iconAiDiscord: "IA Discord",
    tabAuSeoTools: "SEO AU",

    // GitHub Repos section
    githubTitle: "Repositorios de GitHub",
    githubSubtitle: "Explora repositorios populares relacionados con IA ordenados por estrellas",
    repoName: "Repositorio",
    repoStars: "Estrellas",
    repoOwner: "Propietario",
    repoLanguage: "Lenguaje",
    repoDescription: "Descripción",
    repoStatus: "Estado",
    visitRepo: "Visitar Repo",

    // Weekly Viral GitHub Repos section
    weeklyViralGithubTitle: "Repos Virales de GitHub de la Semana",
    weeklyViralGithubSubtitle: "Los repos de IA que están explotando en GitHub esta semana, ordenados por velocidad de tendencia",
    weeklyViralWeekOf: "Semana de",
    weeklyViralWhyViral: "Por qué es viral",
    weeklyViralStarsThisWeek: "esta semana",

    // Sección AU SEO Tools
    auSeoToolsTitle: "Herramientas SEO AU",
    auSeoToolsSubtitle: "Herramientas de SEO y GEO/AEO con IA para optimización de contenido y visibilidad en buscadores",

    // LLMs section
    llmTitle: "Modelos de Lenguaje Grande",
    llmSubtitle: "Explora proveedores de modelos de IA y sus ofertas",
    llmProviderType: "Tipo de Proveedor",
    visitModel: "Visitar Modelo",

    // LTDs section
    ltdTitle: "Ofertas de por Vida",
    ltdSubtitle: "Ofertas exclusivas de por vida en herramientas y software de IA",
    ltdPlatform: "Plataforma",
    ltdStatus: "Estado",
    visitDeal: "Visitar Oferta",
    noDeals: "No hay ofertas de por vida disponibles aún",

    // Video & Image section
    videoImageTitle: "Creadores de Video e Imagen",
    videoImageSubtitle: "Herramientas de IA para generar y editar videos e imágenes",
    visitToolGeneric: "Visitar Herramienta",
    noResultsGeneric: "No hay herramientas disponibles aún",

    // Music & Voice section
    musicVoiceTitle: "Música y Voz",
    musicVoiceSubtitle: "Herramientas de IA para generación de música y síntesis de voz",

    // Chatbots & Agents section
    chatbotsTitle: "Chatbots y Agentes",
    chatbotsSubtitle: "Chatbots de IA y agentes autónomos para cada caso de uso",

    // Free APIs section
    freeApisTitle: "APIs Gratis",
    freeApisSubtitle: "Recursos y endpoints de API gratuitos para desarrolladores",

    // Free LLM & IDE section
    freeLlmIdeTitle: "LLM e IDE Gratis",
    freeLlmIdeSubtitle: "Modelos de lenguaje gratuitos y entornos de desarrollo integrados",

    // Vibe Coding section
    vibeCodingTitle: "Vibe Coding",
    vibeCodingSubtitle: "Herramientas de programación con IA para el movimiento vibe coding",

    // Designer Tools section
    designerToolsTitle: "Herramientas para Diseñadores",
    designerToolsSubtitle: "Herramientas de IA para diseñadores y profesionales creativos",

    // AI Infrastructure section
    aiInfraTitle: "Infraestructura IA",
    aiInfraSubtitle: "Herramientas de infraestructura y plataforma para construir aplicaciones de IA",

    // Hardware & Computers section
    hardwareTitle: "Hardware y Computadoras",
    hardwareSubtitle: "Hardware y dispositivos de cómputo optimizados para cargas de trabajo de IA",

    // Testing Tools section
    testingToolsTitle: "Herramientas de Testing",
    testingToolsSubtitle: "Herramientas de testing con IA para equipos de QA y pruebas de software",

    // AI Security section
    aiSecurityTitle: "Seguridad IA",
    aiSecuritySubtitle: "Herramientas y plataformas de seguridad para proteger sistemas y datos de IA",

    // Business Productivity section
    businessProductivityTitle: "Productividad Empresarial",
    businessProductivitySubtitle: "Herramientas de IA para impulsar la productividad empresarial y la colaboración en equipo",

    // MCP Providers section
    mcpProvidersTitle: "Proveedores MCP",
    mcpProvidersSubtitle: "Proveedores de Model Context Protocol y plataformas de integración",

    // VPS & Cloud Providers section
    vpsCloudTitle: "VPS y Proveedores Cloud",
    vpsCloudSubtitle: "Proveedores de hosting en la nube y VPS optimizados para cargas de trabajo de IA",

    // AI Media section
    aiMediaTitle: "Blog",
    aiMediaSubtitle: "Comparativas e informes a fondo sobre los modelos y herramientas de IA que probamos",

    // AI Influencers section
    aiInfluencersTitle: "IA Influencers",
    aiInfluencersSubtitle: "Voces clave e influencers que dan forma a la industria y comunidad de IA",

    // Sumate Top Recommendations — solo en inglés, se oculta por completo en español
    sumateTopRecommendationsTitle: "Sumate Top Recommendations",
    sumateTopRecommendationsSubtitle: "Las selecciones de nuestros editores — los creadores y canales mejor valorados",
    thisWeeksAiPicksTitle: "Selecciones IA de la Semana",
    thisWeeksAiPicksSubtitle: "Nuestras 5 mejores herramientas de la semana — elegidas, probadas y reseñadas",

    // AI Sites section
    aiSitesTitle: "Sitios IA",
    aiSitesSubtitle: "Directorios y sitios web curados dedicados a herramientas y recursos de IA",

    // AI Discord section
    aiDiscordTitle: "IA Discord",
    aiDiscordSubtitle: "Comunidades y servidores de Discord activos para discusiones y networking de IA",

    // Misc
    loading: "Cargando...",
    errorLoading: "Error al cargar los datos. Inténtalo de nuevo más tarde.",
    toolsCount: "herramientas disponibles",
    toggleLanguage: "Cambiar idioma",
    toggleTheme: "Cambiar tema",
    clearSearch: "Borrar búsqueda",
    previousSlide: "Diapositiva anterior",
    nextSlide: "Diapositiva siguiente",
    of: "de",
    sortByName: "Ordenar por nombre",
    sortByCategory: "Ordenar por categoría",
    sortByStars: "Ordenar por estrellas",
    sortByPopularity: "Ordenar por popularidad",
    sortBy: "Ordenar por",
    sortAscending: "Ascendente",
    sortDescending: "Descendente",
    ratingsLegend: "1 = Indie · 5 = Líder del mercado",
    ratingsLegendFull: "Las calificaciones van de 1 (Indie) a 5 (Líder del mercado)",
    loadMore: "Cargar más",
    showingResults: "Mostrando {shown} de {total}",
    allOption: "Todos",
    resetFilters: "Restablecer filtros",
    filterByLanguage: "Filtrar por lenguaje",
    filterByProvider: "Filtrar por proveedor",
    filterByPlatform: "Filtrar por plataforma",
    filterByStatus: "Filtrar por estado",
    filterByTopic: "Filtrar por tema",
    filterBySource: "Filtrar por fuente",
    filterByType: "Filtrar por tipo",
    filterByAffiliate: "Filtrar por afiliado",
    affiliateOnly: "Solo afiliados",
    directOnly: "Solo directos",
    sortByDate: "Ordenar por fecha",
    sortByPlatform: "Ordenar por plataforma",
    sortByStatus: "Ordenar por estado",
    sortByProvider: "Ordenar por proveedor",
    sortByRating: "Ordenar por calificación",
    languageFilterEnglish: "Inglés",
    languageFilterSpanish: "Español",
    languageFilterBoth: "Ambos",
    blogByAuthor: "Por",
    blogReadingTime: "{minutes} min de lectura",

    // Pestaña de inicio
    tabHome: "Inicio",
    readPost: "Leer artículo",

    // Reseña personal escrita a mano sobre una herramienta
    reviewButton: "Leer nuestra reseña",
    reviewSectionTitle: "Nuestra reseña",
    hasReviewTooltip: "Hemos escrito una reseña práctica de esta herramienta",

    // Global search
    globalSearchPlaceholder: "Buscar en todas las herramientas...",
    globalSearchResults: "resultados encontrados en todas las categorías",
    globalSearchNoResults: "No se encontraron herramientas. Prueba con otro término de búsqueda.",
    globalSearchLoading: "Buscando en todas las tablas...",
    globalSearchTitle: "Resultados de búsqueda global",
    sourceTable: "Categoría",

    // Hero redesign (2026-07 Claude Design handoff)
    heroBadgeSuffix: "herramientas indexadas · actualizado a diario",
    heroHeadlineLine1: "Encuentra la",
    heroHeadlineHighlight: "herramienta de IA correcta",
    heroHeadlineLine2: "Sin el ruido.",
    heroDescription: "Cada herramienta es probada, calificada y reseñada en inglés y español — actualizada a diario para ahorrarte tiempo y dinero.",
    heroSearchPlaceholder: "Busca una herramienta, tarea o categoría…",
    heroTryLabel: "Prueba:",
    heroChipVoiceCloning: "clonación de voz",
    heroChipFreeLlmApi: "API LLM gratis",
    heroChipImageUpscaler: "mejorador de imágenes",
    trustCurated: "Curado por humanos",
    trustNoPayToRank: "Sin pago por ranking",
    trustBilingual: "Reseñas EN / ES",

    // Header
    submitATool: "Enviar una herramienta",
    submitToolComingSoon: "¡Los envíos de herramientas llegarán pronto!",

    // Tool card hover teaser
    clickForDetails: "Clic para ver detalles →",

    // Category bar visibility toggle
    hideCategoryBar: "Ocultar barra de categorías",
    showCategoryBar: "Mostrar barra de categorías",

    // Category groups
    groupDiscover: "Descubrir",
    groupModels: "Modelos y APIs",
    groupBuild: "Desarrollo",
    groupCreate: "Crear",
    groupWork: "Trabajo",
    groupRun: "Infra y Ops",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
