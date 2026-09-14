// Explicit allowlist: no API keys, raw vault, or unrelated notes in exports.
export function evidenceRecord(answer) {
  return {
    schemaVersion: 1,
    question: answer.question,
    mode: answer.mode,
    status: answer.status,
    view: {asOf: answer.asOf || null, excludedNoteIds: [...answer.excluded]},
    retrieval: answer.retrieval,
    model: answer.model || null,
    claims: answer.claims.map(c => ({text:c.text,citations:c.citations.map(r => ({chunkId:r.chunkId,quote:r.quote}))})),
    sources: answer.sources.map(s => ({id:s.id,noteId:s.noteId,path:s.path,title:s.title,heading:s.heading,date:s.date,startLine:s.startLine,endLine:s.endLine,text:s.text})),
    gaps: [...answer.gaps],
    warning: answer.warning || null,
    limits: 'A snapshot of selected evidence, not the entire vault. Exact quotations verify provenance, not truth or entailment. Contains note text: review before sharing.'
  };
}
