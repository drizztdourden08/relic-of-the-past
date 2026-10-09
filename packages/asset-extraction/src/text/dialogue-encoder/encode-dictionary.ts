/* @layer shared-asset-extraction @kind logic */
import { kLanguages } from '../data/language-data';

const encodeDictionary = (lang = 'us'): Uint8Array[] => {
  const info = kLanguages[lang];
  if (!info) throw new Error(`Unknown language: ${lang}`);

  const charToIdx = new Map<string, number>();
  for (let i = 0; i < info.alphabet.length; i++) {
    charToIdx.set(info.alphabet[i], i);
  }

  return info.dictionary.map(line => {
    const bytes: number[] = [];
    for (const ch of line) {
      const idx = charToIdx.get(ch);
      if (idx === undefined) throw new Error(`Dict char '${ch}' not in alphabet for ${lang}`);
      bytes.push(idx);
    }
    return new Uint8Array(bytes);
  });
};

export { encodeDictionary };
