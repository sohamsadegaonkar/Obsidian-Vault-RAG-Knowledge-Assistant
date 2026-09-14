# Submission upgrade

## Evaluator flow
1. Open the sample workspace and select **Start guided demo**.
2. Open a citation: the result displays actual source text.
3. Select **Next step**: Security review is excluded and the evidence comparison appears.
4. Advance to the dated view: future and undated sources are excluded.
5. Advance to the review queue: filters are cleared; export the missing sign-off evidence request.
6. Open **Evidence used for this answer** to inspect applied filters and export a JSON record.

The tour deliberately uses deterministic evidence mode. It never pretends to call an LLM. On an imported vault the tour is hidden; use the existing explicit reset action to return to sample data.

## Evidence record
The export is derived exclusively from the completed Answer object, the same object used for displayed citations and Markdown export. It contains the question, mode, status, applied filters, retrieval method, selected source text and original line references, claims, and gaps. Nested arrays and objects are copied. An explicit allowlist excludes API keys, raw vaults, and accidental extra fields.

It is a portable evidence snapshot, not a full replay package, signed audit log, or cryptographic proof. It includes note text; review before sharing. A differing question draft is explicitly marked above the old result.

## Fixes
- Null claims and null citation entries are rejected by the model-output validator instead of throwing.
- Invalid calendar dates are rejected in the client question flow.
- Source sheets are cleared on import/reset to avoid showing a previous vault's note.
- Retrieval evaluation exits unsuccessfully if any case fails.

## Verification and deployment
Verified on 2026-09-14 using Node 22.23.2: TypeScript checks, production build, all 43 Node tests, and all 20 synthetic retrieval evaluation cases passed. Chromium interaction checks passed for all four tour steps, citation viewing, source exclusion, JSON download, dated view, review queue, and a 390px viewport overflow check. No page exceptions were observed. These browser checks used the local Vite server. Reproduce with:

```bash
npm ci
node --test tests/submission.test.mjs
npm run test:evidence
npm run eval
npm run typecheck
npm test
```

Configure GEMINI_API_KEY as a deployment secret, then verify a real generated answer and an unavailable-information question. Live Gemini generation remains unverified because no credential is configured. A GitHub commit does not prove the existing hosted demo has been updated.
