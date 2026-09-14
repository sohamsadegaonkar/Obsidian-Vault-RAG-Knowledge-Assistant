/* Pure, deterministic evidence engine. No model calls, implicit telemetry, or state. */
const STOP = new Set('a an the and or but if to of in on at for from by with is are was were be been being this that these those it its we our you your i my me they their can could would should do does did have has had what which who when where how why about as into than then also not no all any only will there here'.split(' '));
export const LIMITS = Object.freeze({notes:100,totalChars:1500000,noteChars:100000,questionChars:1200,chunkChars:1100,topK:8});
export function tokenize(text) { return (text.toLowerCase().match(/[\p{L}\p{N}]+/gu)||[]).filter(t=>t.length>1&&!STOP.has(t)); }
function hash(text) { let h=2166136261; for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);} return (h>>>0).toString(36); }
export function safePath(path) {
  const p=String(path).replace(/\\/g,'/');
  if(!p || p.length>250 || p.startsWith('/') || /^[a-z]:/i.test(p) || p.split('/').some(s=>s==='..'||s.startsWith('.')) || /[\x00-\x1f]/.test(p)) throw new Error('Use Markdown files with safe relative paths.');
  if(!/\.md$/i.test(p)) throw new Error('Only Markdown (.md) notes are supported.');
  return p;
}
const strip = s=>s.trim().replace(/^['"]|['"]$/g,'');
const basename = p=>p.split('/').pop().replace(/\.md$/i,'');
const normalized = s=>s.toLowerCase().trim().replace(/\.md$/i,'');
function parseList(s='') { return s.replace(/^\[|\]$/g,'').split(',').map(strip).filter(Boolean); }
export function parseNote(raw) {
  const path=safePath(raw.path), content=raw.content.replace(/\r\n?/g,'\n');
  if(content.length>LIMITS.noteChars) throw new Error('A note exceeds the 100,000-character limit.');
  if(content.includes('\0')) throw new Error('A note contains binary content.');
  const lines=content.split('\n'), meta={};let start=0;
  if(lines[0]==='---'){ const end=lines.indexOf('---',1); if(end>0&&end<100){for(const l of lines.slice(1,end)){const m=l.match(/^([\w-]+):\s*(.*)$/);if(m)meta[m[1]]=strip(m[2]);}start=end+1;} }
  const body=lines.slice(start).join('\n'), title=meta.title||body.match(/^#\s+(.+)$/m)?.[1]||basename(path);
  const dateValue=meta.updated||meta.date||meta.created||'';
  const date=/^\d{4}-\d{2}-\d{2}$/.test(dateValue)&&!Number.isNaN(Date.parse(dateValue))&&new Date(dateValue).toISOString().slice(0,10)===dateValue?dateValue:null;
  const links=[...new Set([...body.matchAll(/!?\[\[([^\]]+)\]\]/g)].map(m=>m[1].split('|')[0].split('#')[0].trim()).filter(Boolean))];
  return {id:'n_'+hash(path),path,content,body,bodyStart:start+1,title,entity:meta.entity||'',date,tags:parseList(meta.tags),links,supersedes:[...(meta.supersedes||'').matchAll(/\[\[([^\]]+)\]\]/g)].map(m=>m[1]),wordCount:body.split(/\s+/).filter(Boolean).length};
}
export function parseVault(rawNotes) {
  if(!Array.isArray(rawNotes)||!rawNotes.length)throw new Error('Add at least one Markdown note.');
  if(rawNotes.length>LIMITS.notes)throw new Error('Import up to 100 Markdown notes at a time.');
  if(rawNotes.reduce((n,r)=>n+String(r.content||'').length,0)>LIMITS.totalChars)throw new Error('This vault exceeds the 1.5-million-character limit.');
  const seen=new Set(),ids=new Set();return rawNotes.map(raw=>{if(typeof raw.path!=='string'||typeof raw.content!=='string')throw new Error('A note needs a path and text content.');const n=parseNote(raw);if(seen.has(n.path.toLowerCase()))throw new Error('Two notes share the same path: '+n.path);if(ids.has(n.id))throw new Error("Source identity collision. Rename one note and retry.");seen.add(n.path.toLowerCase());ids.add(n.id);return n;});
}
export function chunkNotes(notes) {
  const chunks=[];
  for(const n of notes){const lines=n.content.split('\n');let start=n.bodyStart-1,buf=[],heading=n.title;
    const emit=()=>{const text=buf.join('\n').trim();if(text&&tokenize(text.split('\n').filter(l=>!/^#/.test(l)).join(' ')).length>2)chunks.push({id:`${n.id}_L${start+1}`,noteId:n.id,path:n.path,title:n.title,heading,text,startLine:start+1,endLine:start+buf.length,date:n.date,score:0});buf=[];};
    for(let i=n.bodyStart-1;i<lines.length;i++){const l=lines[i],m=l.match(/^#{1,6}\s+(.+)/);if(m){emit();heading=m[1];start=i;}else if(buf.join('\n').length+l.length>LIMITS.chunkChars){emit();start=i;}
      // A very long line is bounded without inventing a different source line.
      if(l.length>LIMITS.chunkChars){emit();for(let j=0;j<l.length;j+=LIMITS.chunkChars)chunks.push({id:`${n.id}_L${i+1}_${j}`,noteId:n.id,path:n.path,title:n.title,heading,text:l.slice(j,j+LIMITS.chunkChars),startLine:i+1,endLine:i+1,date:n.date,score:0});start=i+1;}else buf.push(l);
    }emit();
  }return chunks;
}
function resolves(target,n) {const t=normalized(target);return [n.title,basename(n.path),n.path].some(x=>normalized(x)===t);}
export function noteLinks(notes) {const edges=[];for(const n of notes)for(const target of n.links){const matches=notes.filter(x=>resolves(target,x));if(matches.length===1&&matches[0].id!==n.id)edges.push({source:n.id,target:matches[0].id});}return edges;}
export function extractFacts(notes) {
  const facts=[];for(const n of notes){let fenced=false;for(const [i,line] of n.content.split('\n').entries()){if(i<n.bodyStart-1)continue;if(/^\s*(```|~~~)/.test(line)){fenced=!fenced;continue;}if(fenced)continue;
    const m=line.match(/^\s*(?:[-*]\s+)?(?:\*\*)?([A-Za-z][A-Za-z\s-]{2,48}?)(?:\*\*)?:\s*(.{2,180})$/);
    if(m&&n.entity&&!['see','related','note','source','http','https'].includes(m[1].toLowerCase()))facts.push({key:m[1].trim(),value:m[2].trim(),noteId:n.id,path:n.path,line:i+1,date:n.date,entity:n.entity});}}
  return facts;
}
export function analyzeHealth(notes) {
  const groups=new Map();for(const f of extractFacts(notes)){const key=normalized(f.entity)+'|'+normalized(f.key);groups.set(key,[...(groups.get(key)||[]),f]);}
  const conflicts=[...groups.values()].filter(fs=>new Set(fs.map(f=>normalized(f.value))).size>1).map(facts=>({key:facts[0].key,entity:facts[0].entity,facts:facts.sort((a,b)=>(b.date||'').localeCompare(a.date||'')),kind:notes.some(n=>facts.some(f=>f.noteId===n.id)&&n.supersedes.some(t=>facts.some(f=>{const source=notes.find(x=>x.id===f.noteId);return source&&resolves(t,source);})))?'change':'disagreement'}));
  const brokenLinks=[];for(const n of notes)for(const t of n.links)if(!notes.some(x=>resolves(t,x)))brokenLinks.push({noteId:n.id,from:n.title,target:t});
  return {conflicts,brokenLinks,undated:notes.filter(n=>!n.date).length,linked:noteLinks(notes).length};
}
export function eligibleNotes(notes,{excluded=[],asOf=''}={}) {return notes.filter(n=>!excluded.includes(n.id)&&(!asOf||(n.date&&n.date<=asOf)));}
export function retrieve(notes,question,options={}) {
  const active=eligibleNotes(notes,options),chunks=chunkNotes(active),q=[...new Set(tokenize(question))];
  if(!q.length||!chunks.length)return [];
  const tokens=chunks.map(c=>tokenize(c.text)),avg=tokens.reduce((n,t)=>n+t.length,0)/tokens.length;
  const df=new Map(q.map(t=>[t,tokens.filter(ts=>ts.includes(t)).length]));
  const scored=chunks.map((c,i)=>{let score=0;for(const t of q){const tf=tokens[i].filter(x=>x===t).length;if(tf)score+=Math.log(1+(chunks.length-(df.get(t)||0)+.5)/((df.get(t)||0)+.5))*(tf*2.2)/(tf+1.2*(.25+.75*tokens[i].length/avg));}
    const headingTokens=tokenize(c.heading+' '+c.title);score+=q.filter(t=>headingTokens.includes(t)).length*.35;
    return {...c,score,lexicalScore:score,linkBoost:0};}).filter(c=>c.score>0).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
  if(!scored.length)return [];
  const seeds=new Set(scored.slice(0,4).map(c=>c.noteId));const neighbors=new Set(noteLinks(active).filter(e=>seeds.has(e.source)||seeds.has(e.target)).flatMap(e=>[e.source,e.target]));
  for(const c of scored){if(neighbors.has(c.noteId)){c.linkBoost=.12;c.score+=.12;}}
  const counts=new Map();return scored.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).filter(c=>{const n=counts.get(c.noteId)||0;if(n>=2)return false;counts.set(c.noteId,n+1);return true;}).slice(0,options.topK||LIMITS.topK);
}
export function evidenceAnswer(notes,question,options={}) {
  const start=performance.now(),sources=retrieve(notes,question,options),active=eligibleNotes(notes,options),health=analyzeHealth(active),ids=new Set(sources.map(c=>c.noteId));
  const conflicts=health.conflicts.filter(c=>c.facts.some(f=>ids.has(f.noteId)));
  const claims=sources.slice(0,4).map(c=>{const lines=c.text.split('\n').filter(l=>l.trim()&&!/^#/.test(l));const scored=lines.map(line=>({line,score:tokenize(line).filter(t=>tokenize(question).includes(t)).length})).sort((a,b)=>b.score-a.score);const quote=(scored[0]?.line||c.text).trim();return {text:quote,citations:[{chunkId:c.id,quote}]};});
  const gaps=[];
  if(!sources.length)gaps.push('No relevant passage was found. Rephrase the question or add a note that contains the answer.');
  const missing=[...new Set(health.brokenLinks.filter(b=>ids.has(b.noteId)).map(b=>b.target))];if(missing.length)gaps.push('Referenced notes are missing from this view: '+missing.join(', ')+'.');
  if(conflicts.length)gaps.push('Some recorded values differ. Inspect the dated sources before treating a plan as a confirmed fact.');
  if(options.asOf)gaps.push('Historical view excludes undated notes and notes dated after '+options.asOf+'. Dates are author-supplied metadata, not verified version history.');
  return {question,mode:'evidence',status:!claims.length?'insufficient':conflicts.length?'review':'supported',claims,gaps,sources,conflicts,excluded:options.excluded||[],asOf:options.asOf||'',elapsedMs:Math.round(performance.now()-start),retrieval:'BM25 + heading match + explicit note links'};
}
export function validateGenerated(raw,sources) {
  if(!raw||!Array.isArray(raw.claims)||!Array.isArray(raw.gaps)||!['supported','review','insufficient'].includes(raw.status))throw new Error('The model returned an invalid answer format.');
  const byId=new Map(sources.map(s=>[s.id,s]));let rejected=0;
  const claims=raw.claims.slice(0,8).flatMap(c=>{if(!c||typeof c.text!=='string'||!c.text.trim()||c.text.length>1600||!Array.isArray(c.citations)||!c.citations.length){rejected++;return [];}
    const valid=c.citations.length<=5&&c.citations.every(ref=>ref&&typeof ref.chunkId==='string'&&typeof ref.quote==='string'&&ref.quote.trim().length>=8&&byId.get(ref.chunkId)?.text.includes(ref.quote));
    if(!valid){rejected++;return [];}return [{text:c.text,citations:c.citations.map(({chunkId,quote})=>({chunkId,quote}))}];});
  const gaps=raw.gaps.filter(s=>typeof s==='string').slice(0,6).map(s=>s.slice(0,800));
  if(rejected)gaps.push(`${rejected} model claim(s) were removed because their evidence references failed validation.`);
  return {claims,gaps,rejectedClaims:rejected,status:!claims.length?'insufficient':rejected?'review':raw.status};
}
export function compareAnswers(before,after) {const prev=new Set(before.sources.map(s=>s.id)),next=new Set(after.sources.map(s=>s.id));return {removed:before.sources.filter(s=>!next.has(s.id)),added:after.sources.filter(s=>!prev.has(s.id)),retained:after.sources.filter(s=>prev.has(s.id)).length,statusChanged:before.status!==after.status};}
export function exportAnswer(answer) {
  const cite=(ref)=>{const s=answer.sources.find(c=>c.id===ref.chunkId);return s?`[[${s.path.replace(/\.md$/i,'')}#${s.heading}]] (lines ${s.startLine}–${s.endLine})\n> ${ref.quote.replace(/\n/g,'\n> ')}`:'';};
  return `---\ntitle: VaultMind evidence brief\nmode: ${answer.mode}\nstatus: ${answer.status}\n---\n\n# ${answer.question}\n\n${answer.claims.map((c,i)=>`## ${i+1}. ${answer.mode==='evidence'?'Retrieved excerpt':'Claim'}\n${c.text}\n\n${c.citations.map(cite).join('\n\n')}`).join('\n\n')}\n\n## Gaps and caveats\n${answer.gaps.map(g=>'- '+g).join('\n')||'- No additional gaps flagged. This does not prove completeness.'}\n\n## Method\n${answer.retrieval}\nAs of: ${answer.asOf||'all dates'}\nExcluded note IDs: ${answer.excluded.join(', ')||'none'}\nExact quotes verify provenance, not truth or semantic entailment.\n`;
}
