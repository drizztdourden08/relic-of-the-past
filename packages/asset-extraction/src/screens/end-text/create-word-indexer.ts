/* @layer shared-asset-extraction @kind logic */
import { BLANK_INDEX, BLANK_WORD, MAP_ENTRIES } from './end-text.constants';
import type { WordIndexer } from './end-text.type';

const createWordIndexer = (): WordIndexer => {
  const indices = new Map<number, number>([[BLANK_WORD, BLANK_INDEX]]);
  const indexOf = (word: number): number => {
    const known = indices.get(word);
    if (known !== undefined) return known;
    if (indices.size >= MAP_ENTRIES) throw new Error(`ending and credits use more than ${MAP_ENTRIES - 1} distinct tiles`);
    const index = indices.size - 1;
    indices.set(word, index);
    return index;
  };
  const toMap = (): Uint16Array => {
    const map = new Uint16Array(MAP_ENTRIES).fill(BLANK_WORD);
    indices.forEach((index, word) => { map[index] = word; });
    return map;
  };
  return { indexOf, toMap };
};

export { createWordIndexer };
