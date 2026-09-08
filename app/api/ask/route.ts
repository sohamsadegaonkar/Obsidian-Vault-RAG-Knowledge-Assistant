import { env } from 'cloudflare:workers';
import { z } from 'zod';
import { parseVault, evidenceAnswer, eligibleNotes, analyzeHealth } from '@/lib/vault-engine.mjs';
import { generateAnswer, DEFAULT_MODEL } from '@/lib/gemini.mjs';
export const dynamic = 'force-dynamic';
const schema = z.object({notes:z.array(z.object({path:z.string().max(250),content:z.string().max(100000)})).min(1).max(100),question:z.string().trim().min(3).max(1200),excluded:z.array(z.string().max(40)).max(100).default([]),asOf:z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/).default(''),apiKey:z.string().max(300).optional(),model:z.string().regex(/^gemini-[a-z0-9.-]{1,70}$/).default(DEFAULT_MODEL),semantic:z.boolean().default(true),mode:z.enum(['generated','evidence']).default('generated')});
const recent=new Map<string,{count:number;until:number}>();
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function POST(request:Request){
  const start=performance.now();
  if(request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Cross-origin requests are not allowed.'},403);
  if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'Send a JSON request.'},415);
  const identity=request.headers.get('cf-connecting-ip')||'shared';const now=Date.now();
  for(const [k,v] of recent)if(v.until<now)recent.delete(k);
  if(recent.size>2000)recent.clear();
  const rate=recent.get(identity)||{count:0,until:now+60000};if(rate.count>=10)return json({error:'Too many requests. Wait a minute and try again.'},429);rate.count++;recent.set(identity,rate);
  try {
    const reader=request.body?.getReader();if(!reader)return json({error:'Request body is missing.'},400);
    const parts:Uint8Array[]=[];let size=0;
    while(true){const r=await reader.read();if(r.done)break;size+=r.value.byteLength;if(size>2000000){await reader.cancel();return json({error:'Request exceeds the 2 MB limit.'},413);}parts.push(r.value);}
    const bytes=new Uint8Array(size);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length;}
    let input;try{input=schema.parse(JSON.parse(new TextDecoder().decode(bytes)));}catch{return json({error:'Check the notes, question, date, and model settings.'},400);}
    const notes=parseVault(input.notes);if(input.asOf&&(Number.isNaN(Date.parse(input.asOf))||new Date(input.asOf).toISOString().slice(0,10)!==input.asOf))return json({error:'Choose a valid date.'},400);
    const options={excluded:input.excluded,asOf:input.asOf};
    const base=evidenceAnswer(notes,input.question,options);
    if(input.mode==='evidence')return json(base);
    const serverKey=(env as unknown as Record<string,string>).GEMINI_API_KEY||process.env.GEMINI_API_KEY;
    const apiKey=input.apiKey?.trim()||serverKey;
    if(!apiKey)return json({error:'Connect a Gemini API key to generate an answer. Evidence mode works without one.',code:'MODEL_NOT_CONFIGURED'},503);
    const generated=await generateAnswer({notes,question:input.question,options,apiKey,model:input.model,semantic:input.semantic});
    const ids=new Set(generated.sources.map(s=>s.noteId)),conflicts=analyzeHealth(eligibleNotes(notes,options)).conflicts.filter(c=>c.facts.some(f=>ids.has(f.noteId)));
    return json({...base,...generated,conflicts,status:conflicts.length&&generated.status==='supported'?'review':generated.status,mode:'generated',elapsedMs:Math.round(performance.now()-start)});
  }catch(error){const message=error instanceof Error?error.message:'The request could not be completed.';return json({error:message},400);}
}
