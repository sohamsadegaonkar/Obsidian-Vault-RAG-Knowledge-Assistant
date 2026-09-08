import type {Note,Answer,Chunk} from './types';
export const DEFAULT_MODEL:string;
export const SYSTEM_PROMPT:string;
export function generateAnswer(args:{notes:Note[];question:string;options?:{excluded?:string[];asOf?:string};apiKey:string;model?:string;semantic?:boolean}):Promise<Pick<Answer,'claims'|'gaps'|'status'|'sources'|'retrieval'|'warning'|'model'|'rejectedClaims'>>;
