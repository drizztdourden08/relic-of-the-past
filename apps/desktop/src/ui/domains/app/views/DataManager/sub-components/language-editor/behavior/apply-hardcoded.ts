/* @layer renderer-components @kind logic */
import type { DialogueEntry, Occurrence, Token } from '@rotp/languages';
import type { EntryRewrite } from './apply-hardcoded.type';

const isApplicable = (occurrence: Occurrence): boolean => occurrence.match === 'exact';

const byTokenIndex = (picks: Occurrence[]): Map<number, Occurrence[]> => {
  const buckets = new Map<number, Occurrence[]>();
  for (const pick of picks) {
    const list = buckets.get(pick.tokenIndex);
    if (list) list.push(pick);
    else buckets.set(pick.tokenIndex, [pick]);
  }
  return buckets;
};

const cutToken = (text: string, hits: Occurrence[]): Token[] => {
  const out: Token[] = [];
  let cursor = 0;

  for (const hit of [...hits].sort((a, b) => a.at - b.at)) {
    if (hit.at < cursor) continue;
    if (hit.at > cursor) out.push({ t: 'text', v: text.slice(cursor, hit.at) });
    out.push({ t: 'ref', key: hit.variableKey });
    cursor = hit.at + hit.text.length;
  }

  if (cursor < text.length) out.push({ t: 'text', v: text.slice(cursor) });
  return out;
};

const rewriteTokens = (tokens: Token[], picks: Occurrence[]): Token[] => {
  const buckets = byTokenIndex(picks);

  return tokens.flatMap((token, index) => {
    const hits = buckets.get(index);
    if (hits === undefined || token.t !== 'text') return [token];
    return cutToken(token.v, hits);
  });
};

const applyHardcoded = (entries: DialogueEntry[], accepted: Occurrence[]): EntryRewrite[] => {
  const applicable = accepted.filter(isApplicable);
  const byEntry = new Map<number, Occurrence[]>();
  for (const pick of applicable) {
    const list = byEntry.get(pick.entryId);
    if (list) list.push(pick);
    else byEntry.set(pick.entryId, [pick]);
  }

  const rewrites: EntryRewrite[] = [];
  for (const entry of entries) {
    const picks = byEntry.get(entry.id);
    if (picks === undefined || picks.length === 0) continue;
    rewrites.push({ entryId: entry.id, tokens: rewriteTokens(entry.tokens, picks) });
  }
  return rewrites;
};

export { applyHardcoded };
