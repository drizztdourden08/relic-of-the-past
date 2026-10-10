/* @layer shared-asset-extraction @kind logic */
import type { CommandPrefix } from './extract-types.type';
import type { SoundBankContext } from './sound-bank-context';

const readCommandPrefix = (ctx: SoundBankContext, start: number): CommandPrefix | null => {
  const first = ctx.readByte(start);
  if (first === 0) return null;
  if (first & 0x80) return { cmd: first, noteLength: null, volstuff: null, next: start + 1 };
  const second = ctx.readByte(start + 1);
  if (second & 0x80) return { cmd: second, noteLength: first, volstuff: null, next: start + 2 };
  return { cmd: ctx.readByte(start + 2), noteLength: first, volstuff: second, next: start + 3 };
};

export { readCommandPrefix };
