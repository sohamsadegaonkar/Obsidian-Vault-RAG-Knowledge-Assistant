# Engineering decisions

## 1. Make the failure mode demonstrable

The product problem is evidence drift: an old plan, a later decision, and an unresolved blocker can coexist in one vault. A fluent answer may hide that conflict. Source ablation gives the user a direct experiment: change one source and rerun the same question. The interface reports passage changes rather than a fabricated confidence percentage.

This is an original product implementation of established retrieval, provenance, and ablation ideas. It is not claimed to be a new scientific algorithm or the first such system ever created.

## 2. Separate evidence search from generation

The app has a deterministic mode that works without a provider and a real model-backed mode. A missing key is an explicit setup state. Provider failures do not become fake AI answers. If only embeddings fail, generation may use lexical retrieval, with a visible explanation.

## 3. Keep the first index bounded and inspectable

Markdown headings define passage boundaries; long passages are bounded at 1,100 characters. Every chunk retains the original note, line span, and author-supplied date. No opaque vector service is needed for the initial small vault. The code and evaluation expose why passages were selected.

There is no overlap between successive bounded chunks. This simplifies attribution but can separate evidence across a boundary. Better sentence-aware chunking and overlap are a concrete future improvement, to be evaluated rather than assumed superior.

## 4. Combine retrieval signals without fake confidence

BM25 rewards informative word matches. Heading matches add a small boost. Explicit Obsidian links add a small boost only to already matching passages adjacent to top results. A two-passages-per-note cap encourages source diversity.

With a key, Gemini embeddings are combined with lexical ranks using reciprocal rank fusion with k=60. At most 80 passages receive whole-view semantic search. Larger views rerank lexical candidates, which may miss relevant passages without lexical matches. Scores are ranking signals, never percentages of truth.

## 5. Fail closed on citation integrity

The model must return structured claims, citation IDs, and exact quotes. Any unknown ID, edited quote, empty citation list, or malformed response is rejected. A claim with one bad citation is removed in full. The UI explains how many claims were removed.

This does not solve semantic entailment. The genuine limitation is documented beside the product and in the README. A stronger implementation would add an entailment review stage and evaluate it separately, without presenting it as a guarantee.

## 6. Recognize revision without declaring truth

A new note with a `supersedes` link is a linked revision, not automatically the truth. Contradiction candidates compare matching `Field: value` lines for a common `entity`; unrelated entities and fenced code examples are not compared. A general semantic contradiction detector is outside the tested scope.

## 7. Favor isolated sessions for the sprint

No upload database, account system, or cross-user cache is used. The user controls exports. This lowers deployment complexity and prevents accidental sharing of private vaults between evaluator sessions. The trade-off is deliberate: refresh loses imported state, and embeddings are recomputed.

## 8. Keep the deployment cohesive

A React/TypeScript interface and Worker API deploy together through Vinext. A Python/Streamlit prototype would have been faster for a basic chat surface, but the source inspector, graph, and experiment controls benefit from a richer browser interface. The pure retrieval engine remains framework-independent and testable with Node.
