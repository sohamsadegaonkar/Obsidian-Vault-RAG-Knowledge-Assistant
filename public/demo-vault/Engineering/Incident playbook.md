---
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
Related: [[Security review]], [[Architecture decision]].