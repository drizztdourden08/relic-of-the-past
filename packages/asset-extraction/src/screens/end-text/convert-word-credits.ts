/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../../rom/rom-types';
import { readWordRegion } from '../read-word-region';
import type { TableRegion } from '../screen-payload.type';
import { CREDITS_LINE_HEADER_BYTES, LINE_END, WORD_BYTES } from './end-text.constants';
import type { ConvertedCredits, WordIndexer } from './end-text.type';

const convertWordCredits = (
  rom: RomData,
  source: { readonly text: TableRegion; readonly offsets: TableRegion },
  indexer: WordIndexer,
): ConvertedCredits => {
  const text: number[] = [];
  const placed = new Map<number, number>();
  const placeLine = (oldOffset: number): number => {
    const at = source.text.address + oldOffset;
    const start = text.length;
    text.push(rom.getByte(at));
    if (text[start] === LINE_END) return start;
    const size = rom.getByte(at + 1);
    text.push(size);
    const words = (size + 1) >> 1;
    for (let i = 0; i < words; i++) {
      text.push(indexer.indexOf(rom.getWord(at + CREDITS_LINE_HEADER_BYTES + i * WORD_BYTES)));
    }
    return start;
  };
  const offsets = readWordRegion(rom, source.offsets).map((old) => {
    if (!placed.has(old)) placed.set(old, placeLine(old));
    return placed.get(old) ?? 0;
  });
  return { text: Uint8Array.from(text), offsets };
};

export { convertWordCredits };
