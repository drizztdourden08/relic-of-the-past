/* @layer shared-asset-extraction @kind logic */
import { kLanguages } from '../data/language-data';
import type { AlphabetLookup, DictionaryLookup } from './dialogue-encoder.type';
import { encodeGreedyFromDict } from './encode-greedy-from-dict';

const compressStrings = (strings: string[], lang = 'us'): Uint8Array[] => {
  const info = kLanguages[lang];
  if (!info) throw new Error(`Unknown language: ${lang}`);

  const rev: DictionaryLookup = new Map();
  for (const [idx, word] of info.dictionary.entries()) {
    const first = word.charAt(0);
    const words = rev.get(first) ?? new Map<string, number>();
    rev.set(first, words);
    words.set(word, idx);
  }

  const a2i: AlphabetLookup = new Map();
  for (const [idx, char] of info.alphabet.entries()) {
    a2i.set(char, idx);
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
