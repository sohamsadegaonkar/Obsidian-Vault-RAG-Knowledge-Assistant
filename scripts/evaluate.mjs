import fs from 'node:fs';
import {demoNotes} from '../lib/demo-vault.mjs';
import {parseVault,retrieve} from '../lib/vault-engine.mjs';
const notes=parseVault(demoNotes),cases=JSON.parse(fs.readFileSync(new URL('../eval/questions.json',import.meta.url),'utf8'));
const results=cases.map(c=>{const start=performance.now(),sources=retrieve(notes,c.question),titles=[...new Set(sources.map(s=>s.title))];return {id:c.id,question:c.question,expected:c.expected,retrieved:titles,pass:c.noMatch?sources.length===0:c.expected.every(t=>titles.includes(t)),ms:Number((performance.now()-start).toFixed(2)),note:c.note};});
const sourceCases=results.filter(r=>r.expected.length),negative=results.filter(r=>!r.expected.length);
const report={generatedAt:new Date().toISOString(),scope:'20 hand-authored questions over a synthetic 12-note vault. Lexical retrieval only; not an independent benchmark or an LLM-quality score.',metric:'All expected note titles found among the top 8 passages (max 2 per note).',retrievalPassed:sourceCases.filter(r=>r.pass).length,retrievalTotal:sourceCases.length,unrelatedQuestionsAbstained:negative.filter(r=>r.pass).length,unrelatedQuestionsTotal:negative.length,liveModelEvaluation:'NOT RUN — no API credentials configured',results};
fs.writeFileSync(new URL('../eval/results.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));

// A failed regression must fail CI as well as appear in the report.
if(results.some(result=>!result.pass))process.exitCode=1;
