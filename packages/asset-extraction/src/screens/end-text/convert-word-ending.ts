/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../../rom/rom-types';
import { readWordRegion } from '../read-word-region';
import type { TableRegion } from '../screen-payload.type';
import { CAPTION_HEADER_BYTES, WORD_BYTES } from './end-text.constants';
import type { ConvertedEnding, WordIndexer } from './end-text.type';

const convertWordEnding = (
  rom: RomData,
  source: { readonly offsets: TableRegion; readonly data: TableRegion; readonly vramRebase: number },
  indexer: WordIndexer,
): ConvertedEnding => {
  const old = readWordRegion(rom, source.offsets);
  const data: number[] = [];
  const offsets = new Uint16Array(old.length);
  for (let caption = 0; caption + 1 < old.length; caption++) {
    offsets[caption] = data.length;
    let at = source.data.address + (old[caption] ?? 0);
    const end = source.data.address + (old[caption + 1] ?? 0);
    while (at < end) {
      const lastWord = rom.getByte(at + CAPTION_HEADER_BYTES - 1) >> 1;
      const address = ((rom.getByte(at) << 8) | rom.getByte(at + 1)) - source.vramRebase;
      data.push((address >> 8) & 0xff, address & 0xff, rom.getByte(at + 2), rom.getByte(at + 3));
      at += CAPTION_HEADER_BYTES;
      for (let i = 0; i <= lastWord; i++, at += WORD_BYTES) data.push(indexer.indexOf(rom.getWord(at)));
    }
  }
  offsets[old.length - 1] = data.length;
  return { offsets, data: Uint8Array.from(data) };
};

export { convertWordEnding };
