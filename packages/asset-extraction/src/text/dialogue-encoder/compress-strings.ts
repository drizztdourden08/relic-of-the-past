/* @layer shared-asset-extraction @kind logic */
import { kLanguages } from '../data/language-data';
import type { AlphabetLookup, DictionaryLookup } from './dialogue-encoder.type';
import { encodeGreedyFromDict } from './encode-greedy-from-dict';

const compressStrings = (strings: string[], lang = 'us'): Uint8Array[] => {
  const info = kLanguages[lang];
  if (!info) throw new Error(`Unknown language: ${lang}`);

  const rev: DictionaryLookup = new Map();
  for (let idx = 0; idx < info.dictionary.length; idx++) {
    const word = info.dictionary[idx];
    if (!rev.has(word[0])) rev.set(word[0], new Map());
    rev.get(word[0])!.set(word, idx);
  }

  const a2i: AlphabetLookup = new Map();
  for (let idx = 0; idx < info.alphabet.length; idx++) {
    a2i.set(info.alphabet[idx], idx);
  }

  return strings.map(s => {
    const r: number[] = [];
    let i = 0;
    while (i < s.length) {
      const { bytes, consumed } = encodeGreedyFromDict(s, i, rev, a2i, info);
      r.push(...bytes);
      i += consumed;
    }
    return new Uint8Array(r);
  });
};

export { compressStrings };
