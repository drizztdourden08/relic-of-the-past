/* @layer shared-asset-extraction @kind logic */
import type { SfxPrefix } from './decode-sfx.type';
import type { SoundBankContext } from './sound-bank-context';

const readSfxPrefix = (ctx: SoundBankContext, start: number): SfxPrefix | null => {
  const first = ctx.readByte(start);
  if (first === 0) return null;
  if (first & 0x80) return { command: first, noteLength: null, volumeLeft: null, volumeRight: null, next: start + 1 };
  const second = ctx.readByte(start + 1);
  if (second & 0x80) return { command: second, noteLength: first, volumeLeft: null, volumeRight: null, next: start + 2 };
  const third = ctx.readByte(start + 2);
  if (third & 0x80) return { command: third, noteLength: first, volumeLeft: second, volumeRight: null, next: start + 3 };
  return { command: ctx.readByte(start + 3), noteLength: first, volumeLeft: second, volumeRight: third, next: start + 4 };
};

export { readSfxPrefix };
