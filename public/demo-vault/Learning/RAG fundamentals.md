---
title: RAG fundamentals
entity: Learning
updated: 2026-08-25
tags: [learning, rag, ai]
---
# RAG fundamentals
## Retrieval-augmented generation
RAG retrieves relevant document passages and includes them as context for a language model. It does not train the model on the uploaded documents.
## Evidence quality
A source citation only identifies where text came from. It does not prove that the text is true or that a generated claim is entailed by the cited passage.
## Chunking
Split Markdown by headings and bounded passage size. Keep filenames, heading paths, dates, and original line numbers so evidence can be inspected.
See [[Evaluation checklist]] and [[Prompt boundaries]].