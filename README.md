# VaultMind

**An Obsidian RAG assistant whose answers can be cross-examined.**

[Open the live demo](https://vaultmind-soham.builditsoham.chatgpt.site) · [GitHub repository](https://github.com/sohamsadegaonkar/Obsidian-Vault-RAG-Knowledge-Assistant)

Built by Soham Sadegaonkar for the Generative AI Developer Intern build sprint.

Most knowledge assistants stop at an answer with citations. VaultMind makes the evidence inspectable: remove a source, rerun the same question, and compare the supporting passages. It also surfaces explicit changes between dated notes and turns missing references into evidence requests.

## Submission walkthrough

Use **Start guided demo** in the sample workspace for four steps: source inspection, source exclusion, dated retrieval, and missing evidence. Expand **Evidence used for this answer** to inspect applied filters and download a JSON evidence record. The tour uses real evidence retrieval without a model key.

See [upgrade details and validation steps](docs/SUBMISSION-UPGRADE.md). These repository changes require a fresh build and deployment before they appear on the live demo.

## Working features

- Import a vault ZIP or multiple Markdown notes. Filenames, headings, tags, dates, original line numbers, and Obsidian links are retained.
- Retrieve relevant passages using BM25, heading matches, and explicit note links.
- Connect Gemini for semantic retrieval and structured, cited generation. Model keys stay in memory for the current browser tab, or may be configured as a server secret.
- Inspect original source text alongside exact line references.
- Remove sources and rerun a question. Compare removed, introduced, and retained passages.
- Select an “As of” date; future and undated notes are excluded.
- Review matching fields with different recorded values, missing linked notes, and undated notes.
- Export answers as Markdown with Obsidian wikilinks, or export a question scaffold for missing evidence.
- Start immediately with a synthetic 12-note Project Atlas vault.

## Current verification status

The evidence engine works without a model key. This is clearly labelled **Evidence mode** and returns retrieved excerpts, not a simulated LLM answer. The Gemini adapter is implemented and tested against controlled provider responses; a live model call has **not** been verified because no API credentials were available during this build.

`eval/results.json` records the actual lexical retrieval evaluation: 18/18 source-retrieval cases and 2/2 unrelated-question abstention cases passed on the included synthetic vault. This small, hand-authored suite is not an independent benchmark or a model-quality score.

The public demo runs the same application. To exercise live AI generation, configure a Gemini API key in AI settings or as a deployment secret. Evidence mode, imports, source experiments, and exports work without a key.

## Quick start

Node.js 22.13+ and Linux/WSL are supported by the included build scripts.

```bash
npm ci
npm run dev
```

Open the URL printed by Vite. No key is needed to use the sample vault, imports, evidence search, source experiments, or exports.

For a generated answer, open **AI settings**, enter a Gemini API key, choose a model, and click **Use for this tab**. Then run a question with **Generate with AI** enabled. This uses the key owner's API quota. See [Google's API-key documentation](https://ai.google.dev/gemini-api/docs/api-key).

For a server-managed key, copy `.dev.vars.example` to `.dev.vars` in local development. Set `GEMINI_API_KEY` as a secret on the deployed Worker. Do not put real keys in source control. The `/api/status` route reports only whether a key is configured, never its value.

```bash
npm run test:evidence   # deterministic core and provider-contract tests
npm run eval            # writes the measured retrieval report
npm run typecheck
npm run build
```

`npm test` also builds and checks the rendered workspace and the bundled component contracts. See `docs/TESTING.md` for what is and is not covered.

## Architecture

| Layer | Implementation | Reason |
|---|---|---|
| Interface | React 19, TypeScript, Radix/Shadcn primitives, CSS | Inspectable sources, keyboard-accessible controls, responsive workspace |
| Web runtime | Vinext/Vite and Cloudflare Workers | One deployable full-stack application |
| Obsidian ingestion | Bounded Markdown parser and ZIP reader | Original paths and lines retained; unsafe paths and corrupt archives rejected |
| Retrieval | BM25 + heading match + small explicit-link boost | Useful, measurable retrieval without API dependencies |
| Optional semantic search | Gemini Embedding 001, 768 dimensions, reciprocal rank fusion | Complements word matches for small vaults |
| Generation | Gemini `generateContent`, JSON schema, separate system instructions | Structured claims and evidence references |
| Provenance checks | Existing source IDs + exact contiguous quotations | Invalid citations are rejected before rendering |
| State | Browser memory; request-scoped server data | No shared upload store or cross-user vault leakage |

For at most 80 passages, semantic retrieval embeds the entire active view. Larger views use a bounded lexical candidate set of up to 64 passages before semantic reranking. This is explicitly reported in the answer. The MVP does not pretend to maintain a persistent vector database.

## Obsidian note conventions

Normal Markdown notes work for retrieval. This MVP parses simple one-line frontmatter values; it is not a general YAML parser. Dates use valid `YYYY-MM-DD` values in `updated`, `date`, or `created`. Inline tags such as `tags: [launch, planning]` are supported.

Structural disagreement checks additionally need an explicit shared entity and matching fields:

```markdown
---
title: Release decision
entity: Project Atlas
updated: 2026-09-05
supersedes: [[Launch brief]]
tags: [launch, decision]
---
# Release decision
Launch date: 25 September 2026
The date is a target, conditional on [[Security review]].
```

`[[Note]]`, `[[Folder/Note]]`, `[[Note#Heading]]`, and `[[Note|Alias]]` contribute to note-level links. Ambiguous short links are not traversed. Images, PDFs, block embeds, arbitrary plugins, and automatic desktop vault synchronization are outside this MVP.

## A three-minute demo

1. Ask “Can we launch Project Atlas on 18 September?”
2. Inspect the older proposal, revised decision, and missing sign-off.
3. Open a citation to see the exact original lines.
4. Exclude **Security review** in the Source Lab and rerun. Explain why less evidence is not evidence that the problem has gone away.
5. Set the date to `2026-08-31` and rerun. The September decision must disappear.
6. Open the review queue and download an evidence request for **Go-live sign-off**.
7. With an API key configured, generate a cited answer, then ask about unavailable revenue metrics.

Full walkthrough: `docs/DEMO.md`. Design trade-offs: `docs/DECISIONS.md`. Security boundaries: `docs/SECURITY.md`.

## Important limits

- Exact quote validation proves provenance, not truth or semantic entailment. A model can still make an unsupported inference using a real quote.
- The rule-based review queue compares explicit fields for the same entity. It does not detect every semantic contradiction.
- “As of” filters user-supplied dates. It is not a trustworthy reconstruction of file version history.
- Imported notes and keys disappear on refresh. Exports are downloaded by the user; the app does not update a desktop vault automatically.
- Evidence mode runs locally. AI requests send the supplied vault to this app's server; embedding candidates and retrieved text are sent to Google. This app does not persist or log request bodies. Hosting infrastructure and the model provider have their own data policies.
- Upload limits: 100 notes, 100 KB per note, 1.5 MB expanded total, ZIP up to 5 MB. Files must be UTF-8.
- The per-isolate request throttle is a lightweight abuse guard, not a distributed quota guarantee. Persistent indexes, durable rate limits, and authenticated team workspaces are future work.

## Primary references

- [Obsidian's file storage](https://obsidian.md/help/data-storage)
- [Gemini text generation](https://ai.google.dev/api/generate-content)
- [Gemini embeddings](https://ai.google.dev/api/embeddings)
- [Gemini model catalog](https://ai.google.dev/gemini-api/docs/models)

AI tools assisted with implementation. The intended submission explains the architecture, trade-offs, tests, and known limits rather than claiming the code was written without assistance.
