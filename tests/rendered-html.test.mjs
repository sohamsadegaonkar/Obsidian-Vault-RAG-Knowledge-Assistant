import assert from 'node:assert/strict';
import test, {after} from 'node:test';
import {fileURLToPath} from 'node:url';
import {Miniflare} from 'miniflare';
import {demoNotes} from '../lib/demo-vault.mjs';
// The production bundle imports cloudflare:workers. Exercise it in the real
// local workerd runtime instead of Node's unsupported cloudflare: URL loader.
const runtime=new Miniflare({
  compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],
  modules:true,modulesRoot:fileURLToPath(new URL('../dist/server/',import.meta.url)),
  scriptPath:fileURLToPath(new URL('../dist/server/index.js',import.meta.url)),
  modulesRules:[{type:'ESModule',include:['**/*.js','**/*.mjs'],fallthrough:true}],
  serviceBindings:{ASSETS:async()=>new Response('Not found',{status:404})}
});
after(async()=>{await runtime.dispose();});
const post=(body,headers={})=>runtime.dispatchFetch('http://vaultmind.test/api/ask',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
test('renders the working workspace with no starter metadata',async()=>{
  const response=await runtime.dispatchFetch('http://vaultmind.test/',{headers:{accept:'text/html'}});
  assert.equal(response.status,200);assert.match(response.headers.get('content-type')||'',/^text\/html/);
  const html=await response.text();assert.match(html,/VaultMind/);assert.match(html,/Find evidence/);assert.match(html,/What your notes actually say/);assert.doesNotMatch(html,/<meta[^>]*name="codex-preview"/);
});
test('status endpoint discloses configuration state, never a key',async()=>{const r=await runtime.dispatchFetch('http://vaultmind.test/api/status');assert.equal(r.status,200);assert.deepEqual(await r.json(),{ok:true,modelConfigured:false,version:'0.1.0'});assert.equal(r.headers.get('cache-control'),'no-store');});
test('deployed evidence route returns genuine retrieved source text',async()=>{const r=await post({notes:demoNotes,question:'What blocks the public launch?',mode:'evidence'});assert.equal(r.status,200);const a=await r.json();assert.equal(a.mode,'evidence');assert(a.sources.some(s=>s.title==='Security review'));assert(a.claims.length>0);});
test('generation without configuration fails explicitly at the API boundary',async()=>{const r=await post({notes:demoNotes,question:'What blocks the public launch?'});assert.equal(r.status,503);const b=await r.json();assert.equal(b.code,'MODEL_NOT_CONFIGURED');});
test('rejects cross-origin browser requests before processing documents',async()=>{const r=await post({notes:demoNotes,question:'What blocks the public launch?',mode:'evidence'},{Origin:'https://other.example'});assert.equal(r.status,403);});
test('rejects invalid dates and malformed request schemas',async()=>{let r=await post({notes:demoNotes,question:'launch date',asOf:'2026-02-30',mode:'evidence'});assert.equal(r.status,400);r=await post({notes:[],question:'launch date'});assert.equal(r.status,400);});
