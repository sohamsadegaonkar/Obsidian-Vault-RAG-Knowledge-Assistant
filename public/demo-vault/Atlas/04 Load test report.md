---
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
Run 100 and 250 concurrent-user scenarios after the patch, with the production database size.