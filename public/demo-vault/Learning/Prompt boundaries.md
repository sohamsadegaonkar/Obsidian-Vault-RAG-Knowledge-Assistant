---
title: Prompt boundaries
entity: Learning
updated: 2026-09-02
tags: [learning, security, ai]
---
# Prompt boundaries
## Untrusted documents
Uploaded notes are untrusted data. They must not change the assistant's rules, request external actions, or cause secrets to be included in a response.
## Grounded answers
Every generated claim must include a source identifier and an exact supporting quote. Unknown source identifiers or altered quotes should fail validation.
## Limitations
Exact quote validation cannot establish semantic entailment. Human review is still needed for subtle claims, and a language model may miss disagreements.
Related: [[RAG fundamentals]], [[Evaluation checklist]].