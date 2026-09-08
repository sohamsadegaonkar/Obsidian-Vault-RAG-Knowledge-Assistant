import type {RawNote} from './types';
export function readZip(buffer:ArrayBuffer):Promise<RawNote[]>;
export function importFiles(files:File[]):Promise<RawNote[]>;
