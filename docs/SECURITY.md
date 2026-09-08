# Security and data boundaries

## Data flow

- Evidence search, source experiments, note graph, review checks, and Markdown export operate on browser-memory data.
- For AI generation, the browser sends the current vault and an optional session API key to `/api/ask` over the deployed HTTPS origin. The server does not persist the payload.
- For semantic retrieval, candidate passages and the query go to Google's embedding API. Selected passages go to Google's generation API.
- Keys are never placed in URLs, localStorage, files, prompts, analytics, or logs by this application. The provider receives the key in its designated request header.
- No claim is made about retention by infrastructure providers; review their policies before using sensitive notes.

## Input boundaries

The request body is read incrementally and capped at 2 MB. Notes, paths, counts, dates, model IDs, and questions are validated. Import caps apply before expanding each ZIP entry and while streaming deflate output. UTF-8 decoding, declared lengths, and CRC32 integrity are checked. Archives are never extracted onto a server filesystem. Absolute paths, traversal, hidden paths, encrypted entries, symlinks, and unsupported compression methods are rejected.

Text is rendered by React as text; Markdown HTML and scripts are not executed. A note is not allowed to trigger external tool calls. Model URLs are fixed to Google's API, and model IDs are allowlisted by a strict character pattern. Cross-origin browser requests are rejected.

## Prompt injection

The system instruction labels the question and all notes as untrusted data. They are serialized as a separate JSON payload. The model cannot call tools or execute actions in this design. Citation validation is a second boundary. These measures do not guarantee resistance to every prompt injection: a model can still produce a false interpretation with a real quote.

The tests verify request construction and validation behavior with controlled provider responses. They do not prove live-model prompt-injection resistance; live adversarial checks remain necessary after credentials are configured.

## Limits

The throttle allows at most ten requests per minute per observed client IP per Worker isolate. It is not durable, resets with the isolate, and does not provide a global cost ceiling. For a broader production launch, add authenticated quotas, a durable rate limiter, billing limits, and operational monitoring before sharing a server-managed key widely.

There is no server-side document store. API keys in browser memory remain accessible to browser extensions or a compromised device. A tab-only key is a convenience for this MVP, not a replacement for a mature credential-management design.
