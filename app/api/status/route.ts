import { env } from 'cloudflare:workers';
export const dynamic='force-dynamic';
export function GET(){const configured=Boolean((env as unknown as Record<string,string>).GEMINI_API_KEY||process.env.GEMINI_API_KEY);return Response.json({ok:true,modelConfigured:configured,version:'0.1.0'}, {headers:{'Cache-Control':'no-store'}});}
