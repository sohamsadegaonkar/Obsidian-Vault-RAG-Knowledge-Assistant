---
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
No written security approval has been issued. [[Release decision]] is conditional, and [[Go-live sign-off]] has not yet been recorded.