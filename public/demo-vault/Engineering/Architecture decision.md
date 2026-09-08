---
title: Architecture decision
entity: Project Atlas
updated: 2026-08-22
tags: [atlas, architecture, decision]
---
# Project Atlas architecture decision
## Storage
Database: PostgreSQL
Store organizations, memberships, and import jobs in PostgreSQL. Team membership must be checked server-side on every export request.
## Async work
Queue: Redis
Use a Redis queue for imports that exceed the synchronous request window. Workers retry transient failures with an idempotency key.
## Trade-offs
A relational database supports transactions and explicit access boundaries. Redis adds an operational dependency, so queue outages must be visible rather than silently losing jobs.
See [[Security review]] for a current gap in the implementation.