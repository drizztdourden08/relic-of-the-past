/* @layer shared-asset-extraction @kind logic */
import type { LanguageConfig } from '../data/language-data';
import type { AlphabetLookup, DictionaryLookup, EncodedToken } from './dialogue-encoder.type';
import { newEncoder } from './new-encoder';
import { orgEncoder } from './org-encoder';

const encodeCommand = (a: string, a2i: AlphabetLookup, info: LanguageConfig): EncodedToken => {
  const endBracket = a.indexOf(']');
  let cmd = a.slice(1, endBracket);
  let param: number | null = null;
  const cmdLen = cmd.length;

  const fullToken = a.slice(0, cmdLen + 2);
  const alphaIdx = a2i.get(fullToken);
  if (alphaIdx !== undefined) {
    return { bytes: [alphaIdx], consumed: cmdLen + 2 };
  }

  if (cmd.includes(' ')) {
    const spaceIdx = cmd.indexOf(' ');
    param = parseInt(cmd.slice(spaceIdx + 1), 10);
    cmd = cmd.slice(0, spaceIdx);
  }

  const encoder = info.encoder === 'org'
    ? (c: string, p: number | null) => orgEncoder(c, p, info)
    : newEncoder;
  return { bytes: encoder(cmd, param), consumed: cmdLen + 2 };
};

const encodeGreedyFromDict = (
  s: string,
  i: number,
  rev: DictionaryLookup,
  a2i: AlphabetLookup,
  info: LanguageConfig,
): EncodedToken => {
  const a = s.slice(i);

  const charMap = rev.get(a[0]);
  if (charMap) {
    for (const [key, val] of Array.from(charMap)) {
      if (a.startsWith(key)) {
        return { bytes: [val + info.dictBaseEnc], consumed: key.length };
      }
    }
  }

  if (a[0] === '[') return encodeCommand(a, a2i, info);

  const idx = a2i.get(a[0]);
  if (idx === undefined) {
    throw new Error(`Character '${a[0]}' not found in alphabet for language ${info.id}`);
  }
  return { bytes: [idx], consumed: 1 };
};

export { encodeGreedyFromDict };
