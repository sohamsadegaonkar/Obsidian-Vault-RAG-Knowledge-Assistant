# Three-minute demo and interview notes

## Opening: 20 seconds

“The problem I chose is evidence drift. Your notes can contain an old plan, a revised decision, and an unresolved blocker. I built an assistant that lets you inspect and challenge the evidence behind its answer.”

## Ask and inspect: 45 seconds

Use the bundled Project Atlas vault. Ask whether the product can launch on 18 September. Show that the earlier target was revised to 25 September and that a newer security review still blocks release. Open the original lines behind a citation.

If AI is not configured, clearly state that the screen is returning retrieved excerpts. Do not call evidence mode an LLM-generated answer.

## The source experiment: 45 seconds

Exclude Security review and rerun the same question. Open the “What changed?” panel. Explain which passages disappeared, which replaced them, and why hiding a blocker does not fix the blocker. With the provider configured, compare the generated answer as well.

## Time and missing evidence: 40 seconds

Choose 31 August 2026. The September decision must disappear; undated notes are excluded. Explain that this is filtering declared note dates, not reconstructing version history.

Open Review queue. Export an evidence request for Go-live sign-off. Show that it asks for an approval rather than fabricating one.

## Engineering and limits: 30 seconds

Explain heading-based chunking, BM25, optional Gemini embeddings, reciprocal rank fusion, and schema-constrained generation. Explain that exact quote checks verify provenance but cannot prove entailment. Show the measured retrieval report and distinguish mocked provider tests from live-model evaluation.

## Questions you should be ready to answer

- Why use RAG rather than fine-tuning? These notes change, and answers need source attribution. Retrieval makes updates and provenance explicit.
- Why keep an evidence-only mode? It provides useful behavior without a provider and makes missing model configuration honest and testable.
- What is innovative here? The workflow lets a user perform a source-removal experiment, examine dated revisions, and create an evidence request from a gap.
- Why not use a large agent framework? This MVP has a fixed, auditable pipeline and no autonomous external actions. A framework would add surface area without solving a needed orchestration problem.
- What is a failure you found? Heading-only chunks could be retrieved as if they were evidence. The parser now excludes empty heading sections, with a regression test.
- What remains imperfect? Exact-quote validation is not semantic support; the field checker misses implicit contradictions; larger vaults use a lexical candidate cap; uploads are ephemeral; the rate limiter is not distributed.
- What would you improve first? Evaluate on a held-out vault and inspect semantic failures before adding more UI. Then improve sentence-aware chunking and persistent indexing if the measured failures justify it.
