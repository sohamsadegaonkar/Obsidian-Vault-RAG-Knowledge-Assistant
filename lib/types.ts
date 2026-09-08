export type RawNote = { path: string; content: string };
export type Note = RawNote & { id: string; title: string; entity: string; date: string | null; tags: string[]; links: string[]; supersedes: string[]; wordCount: number; body: string; bodyStart: number };
export type Chunk = { id: string; noteId: string; path: string; title: string; heading: string; text: string; startLine: number; endLine: number; date: string | null; score: number; lexicalScore?: number; semanticScore?: number; linkBoost?: number };
export type Fact = { key: string; value: string; noteId: string; path: string; line: number; date: string | null; entity: string };
export type Conflict = { key: string; entity: string; facts: Fact[]; kind: 'change' | 'disagreement' };
export type Health = { conflicts: Conflict[]; brokenLinks: { noteId: string; from: string; target: string }[]; undated: number; linked: number };
export type Claim = { text: string; citations: { chunkId: string; quote: string }[] };
export type Answer = { question: string; mode: 'evidence' | 'generated'; status: 'supported' | 'review' | 'insufficient'; claims: Claim[]; gaps: string[]; sources: Chunk[]; conflicts: Conflict[]; excluded: string[]; asOf: string; elapsedMs: number; retrieval: string; warning?: string; rejectedClaims?: number; model?: string };
