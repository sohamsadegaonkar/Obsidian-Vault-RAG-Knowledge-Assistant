export const demoNotes = [
{path:'Atlas/01 Launch brief.md',content:`---
title: Launch brief
entity: Project Atlas
updated: 2026-08-20
tags: [atlas, launch, planning]
---
# Project Atlas launch brief
## Release plan
Launch date: 18 September 2026
Release scope: Self-serve onboarding and CSV import
Launch owner: Maya Rao
The proposed public launch for Project Atlas is 18 September 2026. This is a planning target, not a release approval.
## Dependencies
The launch depends on [[Security review]], [[Load test report]], and [[Onboarding research]]. Final release authority belongs to the launch owner.
## Budget
Monthly infrastructure budget: INR 18000
See [[Architecture decision]] for the service choices.`},
{path:'Atlas/02 Release decision.md',content:`---
title: Release decision
entity: Project Atlas
updated: 2026-09-05
tags: [atlas, launch, decision]
supersedes: [[Launch brief]]
---
# Project Atlas release decision
## Revised release plan
Launch date: 25 September 2026
Release scope: Invite-only onboarding and CSV import
Launch owner: Maya Rao
The public launch has moved from 18 September to 25 September 2026 because the export permission bug is unresolved. The revised date is a target; it does not override the security gate.
## Go-live conditions
Public launch requires a closed export permission bug, a repeat load test, and written approval in [[Go-live sign-off]].
A 20-team invite-only pilot can proceed after the export permission patch is independently verified.
## Decision trail
This decision replaces the timeline in [[Launch brief]]. Read [[Security review]] and [[Pilot feedback]] before communicating the release date.`},
{path:'Atlas/03 Security review.md',content:`---
title: Security review
entity: Project Atlas
updated: 2026-09-06
tags: [atlas, security, blocker]
---
# Project Atlas security review
## Export permission blocker
Security status: Blocked
The CSV export endpoint allows a signed-in team member to request another team's export by changing the team identifier. The public launch must remain blocked until server-side authorization is fixed and independently retested.
## Required verification
Test an authorized export, a cross-team export, an unauthenticated export, and an expired session. Negative cases must return a denied response without returning any data.
Security owner: Dev Mehta
## Release gate
No written security approval has been issued. [[Release decision]] is conditional, and [[Go-live sign-off]] has not yet been recorded.`},
{path:'Atlas/04 Load test report.md',content:`---
title: Load test report
entity: Project Atlas
updated: 2026-09-04
tags: [atlas, performance, testing]
---
# Project Atlas load test report
## Observed results
At 100 concurrent users, p95 request latency was 420 ms with a 0.8% error rate. The target is p95 below 500 ms and errors below 1%.
At 250 concurrent users, p95 request latency rose to 980 ms with a 3.2% error rate.
Test environment: Staging with a single application instance
## Limits
These results support the small pilot workload only. They do not establish production capacity. Repeat the test after the authorization patch in [[Security review]].
## Next test
Performance owner: Anika Shah
Run 100 and 250 concurrent-user scenarios after the patch, with the production database size.`},
{path:'Atlas/05 Onboarding research.md',content:`---
title: Onboarding research
entity: Project Atlas
updated: 2026-08-28
tags: [atlas, research, onboarding]
---
# Project Atlas onboarding research
## Interviews
We interviewed eight small teams. Six teams completed CSV import without assistance. Two teams struggled to map column names to the required fields.
## Recommendation
Add a column-mapping preview and actionable validation errors before opening self-serve onboarding. An invite-only pilot can use assisted setup.
Research sample: 8 teams
## Open questions
We have not measured week-four retention or willingness to pay. The small sample does not establish demand across the market.
See [[Pilot feedback]] and [[Release decision]].`},
{path:'Atlas/06 Pilot feedback.md',content:`---
title: Pilot feedback
entity: Project Atlas
updated: 2026-09-03
tags: [atlas, pilot, feedback]
---
# Project Atlas pilot feedback
## Assisted trial
Five teams used the assisted onboarding prototype. Four completed their first import within ten minutes. One team required help correcting a date format.
## Requests
Three teams asked for export access controls. Two teams asked for reusable column mapping.
## Limits
This trial did not collect revenue, long-term retention, or a net promoter score. Do not infer these metrics from trial completion.
Follow [[Onboarding research]] for the earlier interviews and [[Security review]] for the export blocker.`},
{path:'Engineering/Architecture decision.md',content:`---
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
See [[Security review]] for a current gap in the implementation.`},
{path:'Engineering/Incident playbook.md',content:`---
title: Incident playbook
entity: Project Atlas
updated: 2026-09-01
tags: [atlas, operations, incident]
---
# Project Atlas incident playbook
## Escalation
Incident owner: Dev Mehta
If cross-team data access is suspected, disable exports, preserve the audit log, and notify the incident owner. Do not delete evidence or announce an unverified root cause.
## Recovery
Restore the endpoint only after the authorization fix passes independent tests. Record the approval and the incident timeline.
Related: [[Security review]], [[Architecture decision]].`},
{path:'Learning/RAG fundamentals.md',content:`---
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
See [[Evaluation checklist]] and [[Prompt boundaries]].`},
{path:'Learning/Evaluation checklist.md',content:`---
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
Read [[RAG fundamentals]] and [[Prompt boundaries]].`},
{path:'Learning/Prompt boundaries.md',content:`---
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
Related: [[RAG fundamentals]], [[Evaluation checklist]].`},
{path:'Inbox/Open questions.md',content:`---
title: Open questions
entity: Project Atlas
tags: [atlas, inbox]
---
# Open questions
## Before launch
Where is the written go-live approval? Has the export fix been independently verified? Has the larger workload been retested?
## Business evidence
Revenue, pricing validation, and retention are still unknown. Check [[Pilot feedback]] before using product metrics in a pitch.
Related: [[Release decision]], [[Go-live sign-off]].`}
];
export const sampleQuestions = [
'Can we launch Project Atlas on 18 September?',
'What changed in the Atlas launch plan?',
'What blocks the public launch?',
'What do we know about revenue and retention?',
'Why did we choose PostgreSQL?',
'How should we evaluate a RAG assistant?'
];
