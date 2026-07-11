# Project TODO

- [x] Set up Teable API key as environment secret
- [x] Build backend proxy endpoint for Teable API (secure, no key exposure)
- [x] Create tRPC router for fetching tools from Teable
- [x] Build bilingual i18n system (English/Spanish) with language context
- [x] Implement light/dark mode toggle (black & white scheme)
- [x] Build hero section with aisumate.com branding and tagline
- [x] Build tools grid with cards (icon, name, category)
- [x] Implement hover popup on tool cards (description, category, visit button)
- [x] Implement real-time search bar (filter by tool name)
- [x] Implement category/type filter (dropdown or tabs)
- [x] Implement alphabetical carousel (A-Z scrollable)
- [x] Ensure "Visit Tool" button label is bilingual
- [x] Ensure all static UI text switches dynamically (no page reload)
- [x] Write vitest tests for backend proxy (8 tests passing)
- [x] Connect to live Teable data (1747 tools loaded successfully)
- [x] Create Category field in Teable table (singleSelect type)
- [x] Add in-memory caching for Teable API responses (5-min TTL)
- [x] Polish UI: hide category filter when no categories have values
- [x] Final test run and checkpoint

## New Features — Multi-Section Tabs

- [x] Explore all 4 new Teable tables (GitHub Repos, LLMs, AI News, LTDs) for field structures
- [x] Add Teable table IDs as environment secrets
- [x] Update backend teable.ts to support multiple tables with generic fetch
- [x] Add tRPC routers for GitHub Repos, LLMs, AI News, and LTDs
- [x] Build tabbed navigation section (Tools | GitHub Repos | LLMs | AI News | LTDs)
- [x] Build GitHub Repos table view (name, details, stars)
- [x] Build LLMs view
- [x] Build AI News view
- [x] Build LTDs view
- [x] Remove Browse A-Z carousel section from Home page
- [x] Update Home page with tabbed sections
- [x] Add i18n translations for all new section labels
- [x] Write vitest tests for new routers
- [x] Final test run and checkpoint

## Sorting Feature — GitHub Repos

- [x] Add sortable columns (stars, name, language) to GitHub Repos table
- [x] Add i18n translations for sort labels
- [x] Test and checkpoint

## Load More — GitHub Repos

- [x] Add "Load more" button to display results beyond the first 100
- [x] Add i18n translations for load more labels
- [x] Test and checkpoint

## Load More — AI Tools Grid

- [x] Add "Load more" button to AI Tools grid (batch of 100)
- [x] Test and checkpoint

## Redesign & New Sections

- [x] Research n8n.io design language (colors, fonts, spacing)
- [x] Explore 3 new Teable tables (Video/Image, Music/Voice, Chatbots/Agents)
- [x] Update color scheme with n8n-inspired palette
- [x] Update fonts to modern typography
- [x] Remove ".com" from all branding in the app
- [x] Add 3 new Teable table IDs as environment secrets
- [x] Update backend teable.ts with new table configs and mappers
- [x] Add tRPC routers for videoImage, musicVoice, chatbots
- [x] Build Video & Image Creator section component
- [x] Build Music & Voice section component
- [x] Build Chatbots & Agents section component
- [x] Update SectionTabs to include all 8 tabs
- [x] Add i18n translations for all new sections
- [x] Test and checkpoint

## Redesign v2 — Earthy Tones + Hero Video + Colorful Cards

- [x] Upload hero video to S3
- [x] Research earthy color palettes for light and dark modes
- [x] Update index.css with earthy tone color scheme
- [x] Add hero video background with glass box heading overlay
- [x] Make tool cards pop with color accents and improved styling
- [x] Update all components with new earthy color scheme
- [x] Test and checkpoint

## Detailed Filtering System

- [x] Review all section components and data structures for filter options
- [x] Build reusable FilterBar component (search, dropdowns, sort)
- [x] Add filters to AI Tools section (search, category, sort by name/category)
- [x] Add filters to GitHub Repos section (search, language filter, sort by stars/name/language)
- [x] Add filters to LLMs section (search, provider type filter, sort)
- [x] Add filters to Video & Image section (search, type filter, sort)
- [x] Add filters to Music & Voice section (search, type filter, sort)
- [x] Add filters to Chatbots & Agents section (search, type filter, sort)
- [x] Add filters to AI News section (search, sort by date)
- [x] Add filters to LTDs section (search, sort by name/price)
- [x] Add i18n translations for all filter labels
- [x] Test and checkpoint

## Comprehensive Update — Bilingual Descriptions, Ratings, Affiliate Logic, UI Fixes

- [x] Review all 8 Teable tables for updated field structures
- [x] Update backend teable.ts with new field mappings (bilingual desc, rating, affiliate checkbox)
- [x] Add bilingual descriptions (EN/ES) to ToolCard popup based on selected language
- [x] Add rating stars to ToolCard description/popup area
- [x] Fix affiliate link logic: use affiliate URL when checkbox is ticked, show note about affiliate
- [x] Fix tool count in hero to aggregate ALL table counts collectively
- [x] Soften gridlines to be easier on the eyes
- [x] Change tool card color to bone colour for dark mode, darker variant for light mode
- [x] Remove affiliate filter from FilterBar, add rating filter instead
- [x] Update all section filters with better fields (rating, etc.)
- [x] Ensure smart detection picks up field changes when Teable tables are updated
- [x] Test and checkpoint

## 6 New Teable Tables

- [x] Add 6 new table IDs as environment secrets
- [x] Update server/_core/env.ts with 6 new table ID env vars
- [x] Add 6 new fetch functions and cache vars to server/teable.ts
- [x] Update fetchTotalToolCount to include all 6 new tables
- [x] Add 6 new tRPC routers in server/routers.ts
- [x] Build GenericToolSection components (reuse existing pattern) for all 6 tabs
- [x] Add 6 new tabs to SectionTabs component
- [x] Add i18n translations for all 6 new section labels (EN + ES)
- [x] Update test mock data to cover new routers
- [x] Run vitest and TypeScript checks
- [x] Save checkpoint and deliver

## 5 New Section Tabs + 4 Icon Links

- [x] Inspect all 9 new Teable tables for field structures
- [x] Add 5 new section tab table IDs as secrets (Testing Tools, AI Security, Business Productivity, MCP Providers, VPS & Cloud)
- [x] Add 4 icon-link table IDs as secrets (AI Media, AI Influencers, AI Sites, AI Discord)
- [x] Update server/_core/env.ts with 9 new table ID env vars
- [x] Add 5 new fetch functions + cache vars to server/teable.ts
- [x] Add 4 icon-link fetch functions to server/teable.ts
- [x] Update fetchTotalToolCount to include all new tables
- [x] Add 5 new tRPC routers + 4 icon-link routers in server/routers.ts
- [x] Add 5 new GenericToolSection tabs to SectionTabs
- [x] Build IconLinks component for header with 4 icons
- [x] Add IconLinks to header in Header.tsx
- [x] Add i18n translations for all new labels (EN + ES)
- [x] Update test mock data and add test cases
- [x] Run vitest and TypeScript checks
- [x] Save checkpoint and deliver

## Global Search Feature

- [x] Add backend global search procedure in routers.ts
- [x] Build GlobalSearch component with search input and unified results display
- [x] Integrate GlobalSearch into the header/hero area
- [x] Add i18n translations for global search (EN + ES)
- [x] Run tests, save checkpoint, and deliver

## LLM/LTD Card Redesign + Tick Mark Removal + InputDate

- [x] Make LLM cards use same hover popup style as AI Tools ToolCard
- [x] Make LTD cards use same hover popup style as AI Tools ToolCard
- [x] Remove red/green tick marks from all card types (keep affiliate note in description only)
- [x] Switch isNew logic from createdTime to InputDate field in teable.ts
- [x] Run tests, save checkpoint, and deliver
