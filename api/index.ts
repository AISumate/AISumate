import { createApp } from "../server/_core/app";

// Vercel serverless entry: every /api/* request is rewritten here (see
// vercel.json) and handled by the shared Express app. Static assets are
// served by Vercel's CDN from dist/public, not by Express.
const app = createApp();

export default app;
