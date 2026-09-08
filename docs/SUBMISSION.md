# Submission readiness

Chosen assignment: **Obsidian Vault RAG Knowledge Assistant**

## Short approach explanation

I built VaultMind to address evidence drift in an Obsidian vault. The application retains source paths, headings, dates, and original line numbers, retrieves relevant passages, and optionally generates structured Gemini answers whose citations must contain exact source quotations. Its Source Lab lets a user remove notes and rerun a question to inspect how the evidence changes. A review queue highlights explicit field revisions and missing linked notes. The stack is React, TypeScript, Vinext/Vite, Cloudflare Workers, BM25 retrieval, and optional Gemini embeddings with reciprocal rank fusion. I included deterministic failure-case tests and a measured retrieval evaluation, and documented the limits of provenance checks and date filtering.

## Required links and final gates

- GitHub repository: https://github.com/sohamsadegaonkar/Obsidian-Vault-RAG-Knowledge-Assistant
- Public demo: https://vaultmind-soham.builditsoham.chatgpt.site
- Live AI generation: configure a provider key and complete the live checks in `TESTING.md`. Do not submit evidence-only mode as a fully verified GenAI workflow.

There is no claim that all submission gates have passed yet.
