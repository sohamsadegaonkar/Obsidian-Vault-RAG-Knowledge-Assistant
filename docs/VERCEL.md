# Deploy VaultMind on Vercel

Import this repository in Vercel, select Next.js, and use the repository root.
The included vercel.json sets npm ci and npm run build:vercel.
Use Node 22.13 or later. The API routes use process.env.GEMINI_API_KEY.

The Next.js production build and TypeScript checks passed in the migration sandbox. All 33 core/provider-contract tests passed. Chromium verified the four-step tour against next start; the evidence API returned 200 and generated requests without credentials returned 503. These are local production-runtime checks, not confirmation of a successful Vercel deployment.

Add GEMINI_API_KEY as a production environment variable and redeploy to enable generated answers without asking reviewers for their own key. Do not commit the key. Without it, evidence mode works and tab-scoped keys can still be entered through AI settings.

After deployment, use the production domain shown by Vercel, open it in an unsigned-in browser, and verify all four tour steps and a generated answer. Check deployment protection if reviewers encounter a login prompt.

The existing Sites deployment remains available. Its original build command is unchanged. This repository has not been configured for automatic Vercel deployment by the connector.
