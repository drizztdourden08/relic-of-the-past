/* @layer shared-asset-extraction @kind logic */
import type { CommandPrefix, DecodedPatternLine } from './extract-types.type';
import type { SoundBankContext } from './sound-bank-context';
import { noteToStr } from './note-to-str';
import { kEffectByteLength, kEffectNames } from './spc-command-tables.constants';

const decodeEffect = (ctx: SoundBankContext, { cmd, noteLength, volstuff, next }: CommandPrefix): DecodedPatternLine => {
  const size = kEffectByteLength[cmd - 0xe0];
  const name = kEffectNames[cmd - 0xe0];
  if (size === undefined || name === undefined) throw new Error(`Unknown effect command 0x${cmd.toString(16)}`);
  const args: (number | null)[] = [];
  for (let i = 0; i < size; i++) args.push(ctx.getByte(next + i));
  return { line: { kind: 'effect', name, args, noteLength, volstuff }, size };
};

const decodePatternCommand = (ctx: SoundBankContext, prefix: CommandPrefix): DecodedPatternLine => {
  const { cmd, noteLength, volstuff, next } = prefix;
  if (cmd === 0xef) {
    const target = ctx.getPattern(ctx.getWord(next));
    const loops = ctx.readByte(next + 2);
    return { line: { kind: 'call', name: 'Call', target, loops, noteLength, volstuff }, size: 3 };
  }
  if (cmd >= 0xe0) return decodeEffect(ctx, prefix);
  return { line: { kind: 'note', note: noteToStr(cmd & 0x7f), noteLength, volstuff }, size: 0 };
};

export { decodePatternCommand };
