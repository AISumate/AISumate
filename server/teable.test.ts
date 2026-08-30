import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the Teable module
vi.mock("./teable", () => ({
  fetchAllTools: vi.fn(),
  fetchGithubRepos: vi.fn(),
  fetchWeeklyViralGithubRepos: vi.fn(),
  fetchLlmModels: vi.fn(),
  fetchLtdDeals: vi.fn(),
  fetchVideoImageTools: vi.fn(),
  fetchMusicVoiceTools: vi.fn(),
  fetchChatbotsTools: vi.fn(),
  fetchFreeApisTools: vi.fn(),
  fetchFreeLlmIdeTools: vi.fn(),
  fetchVibeCodingTools: vi.fn(),
  fetchDesignerTools: vi.fn(),
  fetchAiInfraTools: vi.fn(),
  fetchHardwareTools: vi.fn(),
  fetchTestingTools: vi.fn(),
  fetchAiSecurityTools: vi.fn(),
  fetchBusinessProductivityTools: vi.fn(),
  fetchMcpProvidersTools: vi.fn(),
  fetchVpsCloudTools: vi.fn(),
  fetchAiMediaTools: vi.fn(),
  fetchAiInfluencersTools: vi.fn(),
  fetchAiSitesTools: vi.fn(),
  fetchAiDiscordTools: vi.fn(),
  fetchAuSeoTools: vi.fn(),
  fetchSumateTopRecommendations: vi.fn(),
  fetchThisWeeksAiPicks: vi.fn(),
  fetchTotalToolCount: vi.fn(),
}));

import {
  fetchAllTools,
  fetchGithubRepos,
  fetchWeeklyViralGithubRepos,
  fetchLlmModels,
  fetchLtdDeals,
  fetchVideoImageTools,
  fetchMusicVoiceTools,
  fetchChatbotsTools,
  fetchFreeApisTools,
  fetchFreeLlmIdeTools,
  fetchVibeCodingTools,
  fetchDesignerTools,
  fetchAiInfraTools,
  fetchHardwareTools,
  fetchTestingTools,
  fetchAiSecurityTools,
  fetchBusinessProductivityTools,
  fetchMcpProvidersTools,
  fetchVpsCloudTools,
  fetchAiMediaTools,
  fetchAiInfluencersTools,
  fetchAiSitesTools,
  fetchAiDiscordTools,
  fetchAuSeoTools,
  fetchSumateTopRecommendations,
  fetchThisWeeksAiPicks,
} from "./teable";

const mockFetchAllTools = vi.mocked(fetchAllTools);
const mockFetchGithubRepos = vi.mocked(fetchGithubRepos);
const mockFetchWeeklyViralGithubRepos = vi.mocked(fetchWeeklyViralGithubRepos);
const mockFetchLlmModels = vi.mocked(fetchLlmModels);
const mockFetchLtdDeals = vi.mocked(fetchLtdDeals);
const mockFetchVideoImageTools = vi.mocked(fetchVideoImageTools);
const mockFetchMusicVoiceTools = vi.mocked(fetchMusicVoiceTools);
const mockFetchChatbotsTools = vi.mocked(fetchChatbotsTools);
const mockFetchFreeApisTools = vi.mocked(fetchFreeApisTools);
const mockFetchFreeLlmIdeTools = vi.mocked(fetchFreeLlmIdeTools);
const mockFetchVibeCodingTools = vi.mocked(fetchVibeCodingTools);
const mockFetchDesignerTools = vi.mocked(fetchDesignerTools);
const mockFetchAiInfraTools = vi.mocked(fetchAiInfraTools);
const mockFetchHardwareTools = vi.mocked(fetchHardwareTools);
const mockFetchTestingTools = vi.mocked(fetchTestingTools);
const mockFetchAiSecurityTools = vi.mocked(fetchAiSecurityTools);
const mockFetchBusinessProductivityTools = vi.mocked(fetchBusinessProductivityTools);
const mockFetchMcpProvidersTools = vi.mocked(fetchMcpProvidersTools);
const mockFetchVpsCloudTools = vi.mocked(fetchVpsCloudTools);
const mockFetchAiMediaTools = vi.mocked(fetchAiMediaTools);
const mockFetchAiInfluencersTools = vi.mocked(fetchAiInfluencersTools);
const mockFetchAiSitesTools = vi.mocked(fetchAiSitesTools);
const mockFetchAiDiscordTools = vi.mocked(fetchAiDiscordTools);
const mockFetchAuSeoTools = vi.mocked(fetchAuSeoTools);
const mockFetchSumateTopRecommendations = vi.mocked(fetchSumateTopRecommendations);
const mockFetchThisWeeksAiPicks = vi.mocked(fetchThisWeeksAiPicks);

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
  return { ctx };
}

const sampleTools = [
  { id: "rec1", name: "ChatGPT", descriptionEn: "AI chat assistant", descriptionEs: "Asistente de chat IA", category: "Chatbot", url: "https://chat.openai.com", affiliateUrl: "", iconUrl: "", isAffiliate: false, rating: 0 },
  { id: "rec2", name: "Midjourney", descriptionEn: "AI image generation", descriptionEs: "Generación de imágenes IA", category: "Image", url: "https://midjourney.com", affiliateUrl: "", iconUrl: "", isAffiliate: true, rating: 0 },
  { id: "rec3", name: "Notion AI", descriptionEn: "AI writing assistant", descriptionEs: "Asistente de escritura IA", category: "Writing", url: "https://notion.so", affiliateUrl: "", iconUrl: "", isAffiliate: false, rating: 0 },
  { id: "rec4", name: "AlphaFold", descriptionEn: "Protein structure prediction", descriptionEs: "Predicción de estructura de proteínas", category: "Research", url: "https://alphafold.com", affiliateUrl: "", iconUrl: "", isAffiliate: false, rating: 0 },
];

// Pre-sorted by stars descending (as fetchGithubRepos would do)
const sampleRepos = [
  { id: "r2", name: "langchain/langchain", repoUrl: "https://github.com/langchain/langchain", description: "Building applications with LLMs", owner: "langchain", language: "Python", stars: 80000, status: "Active" },
  { id: "r1", name: "openai/whisper", repoUrl: "https://github.com/openai/whisper", description: "Robust speech recognition", owner: "openai", language: "Python", stars: 50000, status: "Active" },
  { id: "r3", name: "microsoft/semantic-kernel", repoUrl: "https://github.com/microsoft/semantic-kernel", description: "Integrate AI services", owner: "microsoft", language: "C#", stars: 20000, status: "Active" },
];

// Pre-sorted by Weekly Rank ascending (as fetchWeeklyViralGithubRepos would do)
const sampleWeeklyViralRepos = [
  { id: "w1", name: "Zackriya-Solutions/meetily", repoUrl: "https://github.com/Zackriya-Solutions/meetily", descriptionEn: "Privacy-first AI meeting assistant", descriptionEs: "Asistente de reuniones IA que prioriza la privacidad", owner: "Zackriya-Solutions", language: "Rust", stars: 22957, starsThisWeek: 8795, weeklyRank: 1, weekEnding: "2026-07-11T00:00:00.000Z", whyViral: "Growing backlash against cloud meeting bots.", iconUrl: "", rating: 0 },
  { id: "w2", name: "asgeirtj/system_prompts_leaks", repoUrl: "https://github.com/asgeirtj/system_prompts_leaks", descriptionEn: "Extracted system prompts from major AI providers", descriptionEs: "Prompts de sistema extraídos de los principales proveedores de IA", owner: "asgeirtj", language: "JavaScript", stars: 56033, starsThisWeek: 7765, weeklyRank: 2, weekEnding: "2026-07-11T00:00:00.000Z", whyViral: "Perennial curiosity about frontier assistants.", iconUrl: "", rating: 0 },
];

// Pre-sorted alphabetically (as fetchLlmModels would do)
const sampleLlms = [
  { id: "l2", name: "Claude", summaryEn: "AI assistant for text", summaryEs: "Asistente de IA para texto", providerType: "Model Provider", url: "https://claude.ai", affiliateUrl: "", iconUrl: "", isAffiliate: false, rating: 0 },
  { id: "l3", name: "Gemini", summaryEn: "AI platform by Google", summaryEs: "Plataforma de IA de Google", providerType: "Model Provider", url: "https://gemini.google.com", affiliateUrl: "", iconUrl: "", isAffiliate: false, rating: 0 },
  { id: "l1", name: "OpenAI", summaryEn: "GPT-based APIs", summaryEs: "APIs basadas en GPT", providerType: "Model Provider", url: "https://openai.com", affiliateUrl: "", iconUrl: "", isAffiliate: false, rating: 0 },
];

const sampleLtds = [
  { id: "d1", name: "ToolX LTD", website: "https://toolx.com", summaryEn: "Lifetime deal for AI tool", summaryEs: "Oferta de por vida para herramienta IA", dealUrl: "https://toolx.com/deal", platform: "AppSumo", status: "Active", iconUrl: "", rating: 0 },
  { id: "d2", name: "WriteAI LTD", website: "https://writeai.com", summaryEn: "Lifetime deal for writing AI", summaryEs: "Oferta de por vida para IA de escritura", dealUrl: "https://writeai.com/deal", platform: "StackSocial", status: "Active", iconUrl: "", rating: 0 },
];

// Pre-sorted alphabetically (as fetch functions would do)
const sampleGenericTools = [
  { id: "g1", name: "DALL-E", descriptionEn: "AI image generator", descriptionEs: "Generador de imágenes IA", url: "https://openai.com/dall-e", affiliateUrl: "", iconUrl: "", category: "Image", isAffiliate: false, rating: 0 },
  { id: "g2", name: "Suno", descriptionEn: "AI music generator", descriptionEs: "Generador de música IA", url: "https://suno.com", affiliateUrl: "", iconUrl: "", category: "Music", isAffiliate: true, rating: 0 },
  { id: "g3", name: "Synthesia", descriptionEn: "AI video creator", descriptionEs: "Creador de video IA", url: "https://synthesia.io", affiliateUrl: "", iconUrl: "", category: "Video", isAffiliate: false, rating: 0 },
];

describe("tools.list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all tools sorted alphabetically when no filter is provided", async () => {
    mockFetchAllTools.mockResolvedValue(sampleTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tools.list({});

    expect(result.tools).toHaveLength(4);
    expect(result.tools[0].name).toBe("AlphaFold");
    expect(result.tools[1].name).toBe("ChatGPT");
    expect(result.tools[2].name).toBe("Midjourney");
    expect(result.tools[3].name).toBe("Notion AI");
    expect(result.total).toBe(4);
  });

  it("filters tools by search term (case-insensitive)", async () => {
    mockFetchAllTools.mockResolvedValue(sampleTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tools.list({ search: "chat" });

    expect(result.tools).toHaveLength(1);
    expect(result.tools[0].name).toBe("ChatGPT");
  });

  it("filters tools by category", async () => {
    mockFetchAllTools.mockResolvedValue(sampleTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tools.list({ category: "Image" });

    expect(result.tools).toHaveLength(1);
    expect(result.tools[0].name).toBe("Midjourney");
  });

  it("returns all tools when category is 'all'", async () => {
    mockFetchAllTools.mockResolvedValue(sampleTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tools.list({ category: "all" });

    expect(result.tools).toHaveLength(4);
  });

  it("returns empty array when Teable returns no data", async () => {
    mockFetchAllTools.mockResolvedValue([]);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tools.list({});

    expect(result.tools).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});

describe("tools.categories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns sorted unique categories", async () => {
    mockFetchAllTools.mockResolvedValue(sampleTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tools.categories();

    expect(result.categories).toEqual(["Chatbot", "Image", "Research", "Writing"]);
  });

  it("returns empty array when no tools exist", async () => {
    mockFetchAllTools.mockResolvedValue([]);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tools.categories();

    expect(result.categories).toEqual([]);
  });
});

describe("github.list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all repos sorted by stars descending", async () => {
    mockFetchGithubRepos.mockResolvedValue(sampleRepos);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.github.list({});

    expect(result.repos).toHaveLength(3);
    expect(result.repos[0].name).toBe("langchain/langchain");
    expect(result.repos[0].stars).toBe(80000);
    expect(result.repos[1].name).toBe("openai/whisper");
    expect(result.repos[2].name).toBe("microsoft/semantic-kernel");
    expect(result.total).toBe(3);
  });

  it("filters repos by search term", async () => {
    mockFetchGithubRepos.mockResolvedValue(sampleRepos);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.github.list({ search: "openai" });

    expect(result.repos).toHaveLength(1);
    expect(result.repos[0].name).toBe("openai/whisper");
  });

  it("returns empty array when no repos exist", async () => {
    mockFetchGithubRepos.mockResolvedValue([]);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.github.list({});

    expect(result.repos).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});

describe("weeklyViralGithub.list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all weekly viral repos, ranked (Weekly Rank ascending)", async () => {
    mockFetchWeeklyViralGithubRepos.mockResolvedValue(sampleWeeklyViralRepos);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.weeklyViralGithub.list({});

    expect(result.repos).toHaveLength(2);
    expect(result.repos[0].name).toBe("Zackriya-Solutions/meetily");
    expect(result.repos[1].name).toBe("asgeirtj/system_prompts_leaks");
    expect(result.total).toBe(2);
  });

  it("filters by search term across name, description, owner, and why-viral", async () => {
    mockFetchWeeklyViralGithubRepos.mockResolvedValue(sampleWeeklyViralRepos);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.weeklyViralGithub.list({ search: "meeting" });

    expect(result.repos).toHaveLength(1);
    expect(result.repos[0].name).toBe("Zackriya-Solutions/meetily");
  });

  it("returns empty array when the table has no records", async () => {
    mockFetchWeeklyViralGithubRepos.mockResolvedValue([]);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.weeklyViralGithub.list({});

    expect(result.repos).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});

describe("llms.list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all LLMs sorted alphabetically", async () => {
    mockFetchLlmModels.mockResolvedValue(sampleLlms);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.llms.list({});

    expect(result.models).toHaveLength(3);
    expect(result.models[0].name).toBe("Claude");
    expect(result.models[1].name).toBe("Gemini");
    expect(result.models[2].name).toBe("OpenAI");
    expect(result.total).toBe(3);
  });

  it("filters LLMs by search term", async () => {
    mockFetchLlmModels.mockResolvedValue(sampleLlms);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.llms.list({ search: "gemini" });

    expect(result.models).toHaveLength(1);
    expect(result.models[0].name).toBe("Gemini");
  });
});

describe("ltds.list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all LTDs sorted alphabetically", async () => {
    mockFetchLtdDeals.mockResolvedValue(sampleLtds);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ltds.list({});

    expect(result.deals).toHaveLength(2);
    expect(result.deals[0].name).toBe("ToolX LTD");
    expect(result.deals[1].name).toBe("WriteAI LTD");
    expect(result.total).toBe(2);
  });

  it("filters LTDs by search term", async () => {
    mockFetchLtdDeals.mockResolvedValue(sampleLtds);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ltds.list({ search: "write" });

    expect(result.deals).toHaveLength(1);
    expect(result.deals[0].name).toBe("WriteAI LTD");
  });
});

describe("videoImage.list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all video/image tools sorted alphabetically", async () => {
    mockFetchVideoImageTools.mockResolvedValue(sampleGenericTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.videoImage.list({});

    expect(result.tools).toHaveLength(3);
    expect(result.tools[0].name).toBe("DALL-E");
    expect(result.tools[1].name).toBe("Suno");
    expect(result.tools[2].name).toBe("Synthesia");
    expect(result.total).toBe(3);
  });

  it("filters video/image tools by search term", async () => {
    mockFetchVideoImageTools.mockResolvedValue(sampleGenericTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.videoImage.list({ search: "suno" });

    expect(result.tools).toHaveLength(1);
    expect(result.tools[0].name).toBe("Suno");
  });

  it("returns empty array when no tools exist", async () => {
    mockFetchVideoImageTools.mockResolvedValue([]);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.videoImage.list({});

    expect(result.tools).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});

describe("musicVoice.list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all music/voice tools sorted alphabetically", async () => {
    mockFetchMusicVoiceTools.mockResolvedValue(sampleGenericTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.musicVoice.list({});

    expect(result.tools).toHaveLength(3);
    expect(result.tools[0].name).toBe("DALL-E");
    expect(result.total).toBe(3);
  });

  it("filters music/voice tools by search term", async () => {
    mockFetchMusicVoiceTools.mockResolvedValue(sampleGenericTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.musicVoice.list({ search: "synth" });

    expect(result.tools).toHaveLength(1);
    expect(result.tools[0].name).toBe("Synthesia");
  });
});

describe("chatbots.list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all chatbots/agents tools sorted alphabetically", async () => {
    mockFetchChatbotsTools.mockResolvedValue(sampleGenericTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chatbots.list({});

    expect(result.tools).toHaveLength(3);
    expect(result.tools[0].name).toBe("DALL-E");
    expect(result.total).toBe(3);
  });

  it("filters chatbots/agents tools by search term", async () => {
    mockFetchChatbotsTools.mockResolvedValue(sampleGenericTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chatbots.list({ search: "dall" });

    expect(result.tools).toHaveLength(1);
    expect(result.tools[0].name).toBe("DALL-E");
  });
});

describe("freeApis.list", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns all free APIs tools sorted alphabetically", async () => {
    mockFetchFreeApisTools.mockResolvedValue(sampleGenericTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.freeApis.list({});
    expect(result.tools).toHaveLength(3);
    expect(result.tools[0].name).toBe("DALL-E");
    expect(result.total).toBe(3);
  });

  it("filters free APIs by search term", async () => {
    mockFetchFreeApisTools.mockResolvedValue(sampleGenericTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.freeApis.list({ search: "suno" });
    expect(result.tools).toHaveLength(1);
    expect(result.tools[0].name).toBe("Suno");
  });
});

describe("freeLlmIde.list", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns all free LLM & IDE tools sorted alphabetically", async () => {
    mockFetchFreeLlmIdeTools.mockResolvedValue(sampleGenericTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.freeLlmIde.list({});
    expect(result.tools).toHaveLength(3);
    expect(result.tools[0].name).toBe("DALL-E");
    expect(result.total).toBe(3);
  });
});

describe("vibeCoding.list", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns all vibe coding tools sorted alphabetically", async () => {
    mockFetchVibeCodingTools.mockResolvedValue(sampleGenericTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.vibeCoding.list({});
    expect(result.tools).toHaveLength(3);
    expect(result.tools[0].name).toBe("DALL-E");
    expect(result.total).toBe(3);
  });
});

describe("designerTools.list", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns all designer tools sorted alphabetically", async () => {
    mockFetchDesignerTools.mockResolvedValue(sampleGenericTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.designerTools.list({});
    expect(result.tools).toHaveLength(3);
    expect(result.tools[0].name).toBe("DALL-E");
    expect(result.total).toBe(3);
  });
});

describe("aiInfra.list", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns all AI infrastructure tools sorted alphabetically", async () => {
    mockFetchAiInfraTools.mockResolvedValue(sampleGenericTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.aiInfra.list({});
    expect(result.tools).toHaveLength(3);
    expect(result.tools[0].name).toBe("DALL-E");
    expect(result.total).toBe(3);
  });
});

describe("hardware.list", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns all hardware tools sorted alphabetically", async () => {
    mockFetchHardwareTools.mockResolvedValue(sampleGenericTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.hardware.list({});
    expect(result.tools).toHaveLength(3);
    expect(result.tools[0].name).toBe("DALL-E");
    expect(result.total).toBe(3);
  });
});

describe("testingTools.list", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns all testing tools sorted alphabetically", async () => {
    mockFetchTestingTools.mockResolvedValue(sampleGenericTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.testingTools.list({});
    expect(result.tools).toHaveLength(3);
    expect(result.tools[0].name).toBe("DALL-E");
    expect(result.total).toBe(3);
  });

  it("filters testing tools by search term", async () => {
    mockFetchTestingTools.mockResolvedValue(sampleGenericTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.testingTools.list({ search: "suno" });
    expect(result.tools).toHaveLength(1);
    expect(result.tools[0].name).toBe("Suno");
  });
});

describe("aiSecurity.list", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns all AI security tools sorted alphabetically", async () => {
    mockFetchAiSecurityTools.mockResolvedValue(sampleGenericTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.aiSecurity.list({});
    expect(result.tools).toHaveLength(3);
    expect(result.total).toBe(3);
  });
});

describe("businessProductivity.list", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns all business productivity tools sorted alphabetically", async () => {
    mockFetchBusinessProductivityTools.mockResolvedValue(sampleGenericTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.businessProductivity.list({});
    expect(result.tools).toHaveLength(3);
    expect(result.total).toBe(3);
  });
});

describe("mcpProviders.list", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns all MCP provider tools sorted alphabetically", async () => {
    mockFetchMcpProvidersTools.mockResolvedValue(sampleGenericTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.mcpProviders.list({});
    expect(result.tools).toHaveLength(3);
    expect(result.total).toBe(3);
  });
});

describe("vpsCloud.list", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns all VPS & cloud tools sorted alphabetically", async () => {
    mockFetchVpsCloudTools.mockResolvedValue(sampleGenericTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.vpsCloud.list({});
    expect(result.tools).toHaveLength(3);
    expect(result.total).toBe(3);
  });
});

describe("aiMedia.list", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns all AI media tools sorted alphabetically", async () => {
    mockFetchAiMediaTools.mockResolvedValue(sampleGenericTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.aiMedia.list({});
    expect(result.tools).toHaveLength(3);
    expect(result.total).toBe(3);
  });
});

describe("aiInfluencers.list", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns all AI influencers sorted alphabetically", async () => {
    mockFetchAiInfluencersTools.mockResolvedValue(sampleGenericTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.aiInfluencers.list({});
    expect(result.tools).toHaveLength(3);
    expect(result.total).toBe(3);
  });
});

describe("aiSites.list", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns all AI sites sorted alphabetically", async () => {
    mockFetchAiSitesTools.mockResolvedValue(sampleGenericTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.aiSites.list({});
    expect(result.tools).toHaveLength(3);
    expect(result.total).toBe(3);
  });
});

describe("aiDiscord.list", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns all AI Discord servers sorted alphabetically", async () => {
    mockFetchAiDiscordTools.mockResolvedValue(sampleGenericTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.aiDiscord.list({});
    expect(result.tools).toHaveLength(3);
    expect(result.total).toBe(3);
  });
});

describe("auSeoTools.list", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns all AU SEO tools sorted alphabetically", async () => {
    mockFetchAuSeoTools.mockResolvedValue(sampleGenericTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auSeoTools.list({});
    expect(result.tools).toHaveLength(3);
    expect(result.tools[0].name).toBe("DALL-E");
    expect(result.total).toBe(3);
  });

  it("filters AU SEO tools by search term", async () => {
    mockFetchAuSeoTools.mockResolvedValue(sampleGenericTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auSeoTools.list({ search: "suno" });
    expect(result.tools).toHaveLength(1);
    expect(result.tools[0].name).toBe("Suno");
  });
});

describe("sumateTopRecommendations.list", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns all Sumate Top Recommendations sorted alphabetically", async () => {
    mockFetchSumateTopRecommendations.mockResolvedValue(sampleGenericTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.sumateTopRecommendations.list({});
    expect(result.tools).toHaveLength(3);
    expect(result.tools[0].name).toBe("DALL-E");
    expect(result.total).toBe(3);
  });

  it("filters Sumate Top Recommendations by search term", async () => {
    mockFetchSumateTopRecommendations.mockResolvedValue(sampleGenericTools);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.sumateTopRecommendations.list({ search: "suno" });
    expect(result.tools).toHaveLength(1);
    expect(result.tools[0].name).toBe("Suno");
  });
});

describe("search.global", () => {
  // search.global calls all 24 table fetchers, unlike the single-fetcher
  // `.list` endpoints above — resetAllMocks (not clearAllMocks) is required so
  // an un-mocked fetcher here returns undefined (caught, treated as empty)
  // instead of silently keeping whatever another describe block last resolved.
  beforeEach(() => { vi.resetAllMocks(); });

  it("dedupes a tool cross-listed in AI Tools and its specialized table, preferring the specialized match", async () => {
    mockFetchAllTools.mockResolvedValue([
      { id: "g2", name: "Suno", descriptionEn: "AI music generator", descriptionEs: "Generador de música IA", url: "https://suno.com", affiliateUrl: "", iconUrl: "", category: "Music", isAffiliate: true, rating: 0 },
    ]);
    mockFetchMusicVoiceTools.mockResolvedValue([
      { id: "mv1", name: "Suno", descriptionEn: "AI music generator", descriptionEs: "Generador de música IA", url: "https://suno.com", affiliateUrl: "", iconUrl: "", category: "Music & Voice", isAffiliate: true, rating: 0 },
    ]);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.search.global({ query: "suno" });

    expect(result.results).toHaveLength(1);
    expect(result.results[0].sourceTable).toBe("Music & Voice");
    expect(result.total).toBe(1);
  });

  it("keeps distinct tools from different tables un-deduped", async () => {
    mockFetchAllTools.mockResolvedValue([
      { id: "g1", name: "DALL-E", descriptionEn: "AI image generator", descriptionEs: "Generador de imágenes IA", url: "https://openai.com/dall-e", affiliateUrl: "", iconUrl: "", category: "Image", isAffiliate: false, rating: 0 },
    ]);
    mockFetchMusicVoiceTools.mockResolvedValue([
      { id: "mv1", name: "Suno", descriptionEn: "AI music generator", descriptionEs: "Generador de música IA", url: "https://suno.com", affiliateUrl: "", iconUrl: "", category: "Music & Voice", isAffiliate: true, rating: 0 },
    ]);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.search.global({ query: "ai" });

    expect(result.results).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it("matches a multi-word query when every word appears (not as one contiguous substring)", async () => {
    mockFetchFreeApisTools.mockResolvedValue([
      { id: "fa1", name: "OpenRouter", descriptionEn: "A free LLM API gateway for many models", descriptionEs: "Una API LLM gratuita", url: "https://openrouter.ai", affiliateUrl: "", iconUrl: "", category: "Free APIs", isAffiliate: false, rating: 0 },
    ]);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Words appear in a different order and separated — the old whole-phrase
    // substring matcher returned nothing for this.
    const result = await caller.search.global({ query: "free api llm" });

    expect(result.results).toHaveLength(1);
    expect(result.results[0].name).toBe("OpenRouter");
  });

  it("ranks a name match above a description-only match", async () => {
    mockFetchAllTools.mockResolvedValue([
      { id: "d1", name: "Zebra Writer", descriptionEn: "An assistant powered by Claude under the hood", descriptionEs: "", url: "https://zebra.example", affiliateUrl: "", iconUrl: "", category: "Writing", isAffiliate: false, rating: 5 },
    ]);
    mockFetchChatbotsTools.mockResolvedValue([
      { id: "c1", name: "Claude", descriptionEn: "Anthropic's AI assistant", descriptionEs: "El asistente de Anthropic", url: "https://claude.ai", affiliateUrl: "", iconUrl: "", category: "Chatbots", isAffiliate: false, rating: 0 },
    ]);
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.search.global({ query: "claude" });

    expect(result.results).toHaveLength(2);
    // The tool literally named "Claude" must rank first, ahead of the
    // higher-rated tool that only mentions Claude in its description.
    expect(result.results[0].name).toBe("Claude");
  });
});
