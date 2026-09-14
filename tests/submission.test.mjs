import test from 'node:test';
import assert from 'node:assert/strict';
import {demoNotes} from '../lib/demo-vault.mjs';
import {parseVault,evidenceAnswer,compareAnswers,validateGenerated} from '../lib/vault-engine.mjs';
import {evidenceRecord} from '../lib/evidence-record.mjs';
const notes=parseVault(demoNotes);
test('guided source experiment removes the chosen source',()=>{
  const before=evidenceAnswer(notes,'What blocks the public launch?');
  const security=notes.find(n=>n.title==='Security review');
  assert(before.sources.some(s=>s.noteId===security.id));
  const after=evidenceAnswer(notes,before.question,{excluded:[security.id]});
  assert(!after.sources.some(s=>s.noteId===security.id));
  assert(compareAnswers(before,after).removed.length>0);
});
test('guided historical view excludes future and undated evidence',()=>{
  const answer=evidenceAnswer(notes,'What blocks the public launch?',{asOf:'2026-08-31'});
  assert(answer.sources.length>0);
  assert(answer.sources.every(s=>s.date&&s.date<='2026-08-31'));
});
test('evidence record is detached and excludes accidental secret fields',()=>{
  const answer=evidenceAnswer(notes,'What blocks the public launch?');
  const record=evidenceRecord({...answer,apiKey:'PRIVATE_TEST_SENTINEL',rawVault:notes});
  assert(!JSON.stringify(record).includes('PRIVATE_TEST_SENTINEL'));
  assert(!('rawVault' in record));
  const quote=answer.claims[0].citations[0].quote;
  record.claims[0].citations[0].quote='changed';
  record.view.excludedNoteIds.push('changed');
  record.sources[0].text='changed';
  assert.equal(answer.claims[0].citations[0].quote,quote);
  assert.equal(answer.excluded.length,0);
  assert.notEqual(answer.sources[0].text,'changed');
});
test('every exported citation resolves to the exported source text',()=>{
  const record=evidenceRecord(evidenceAnswer(notes,'What blocks the public launch?'));
  for(const claim of record.claims)for(const citation of claim.citations){
    assert(record.sources.find(s=>s.id===citation.chunkId)?.text.includes(citation.quote));
  }
});
test('null claims and null references are rejected without a crash',()=>{
  const sources=evidenceAnswer(notes,'What blocks the public launch?').sources;
  const result=validateGenerated({status:'supported',claims:[null,{text:'Untrusted claim',citations:[null]}],gaps:[]},sources);
  assert.equal(result.status,'insufficient');
  assert.equal(result.rejectedClaims,2);
  assert.equal(result.claims.length,0);
});
