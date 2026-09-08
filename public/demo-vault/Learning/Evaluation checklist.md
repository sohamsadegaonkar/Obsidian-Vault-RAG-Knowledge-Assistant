---
title: Evaluation checklist
entity: Learning
updated: 2026-09-02
tags: [learning, evaluation, ai]
---
# Evaluation checklist
## Retrieval
Measure whether expected source notes appear in the top retrieved results. Include exact-term questions, paraphrases, and questions with no answer in the vault.
## Generation
Manually inspect claim support and quote accuracy. Check whether the model admits missing evidence instead of inventing values.
## Source ablation
Remove an important source and ask the same question again. Check what support is lost and whether the answer becomes less decisive.
## Adversarial notes
Place instructions inside a note and verify they are treated as document content, not system instructions.
Read [[RAG fundamentals]] and [[Prompt boundaries]].