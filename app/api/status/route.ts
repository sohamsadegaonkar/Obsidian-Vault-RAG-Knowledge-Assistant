export const dynamic='force-dynamic';
export function GET(){const configured=Boolean(process.env.GEMINI_API_KEY);return Response.json({ok:true,modelConfigured:configured,version:'0.1.0'}, {headers:{'Cache-Control':'no-store'}});}
