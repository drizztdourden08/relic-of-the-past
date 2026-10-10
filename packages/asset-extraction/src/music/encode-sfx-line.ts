/* @layer shared-asset-extraction @kind logic */
import type { SfxLineBytes } from './compile-types.type';
import { kKeysDict } from './compile-lookups.constants';

const argInt = (args: readonly string[], index: number): number => parseInt(args[index] ?? '');

const keyByte = (cmd: string): number => (kKeysDict.get(cmd) ?? 0) | 0x80;

const noteBytes = (args: readonly string[]): number[] => {
  if (args[0] === '--') return [];
  const bytes = [argInt(args, 0)];
  if (args[1] === '---') return bytes;
  bytes.push(argInt(args, 1));
  if (args[2] !== '---') bytes.push(argInt(args, 2));
  return bytes;
};

const pitchBytes = (cmd: string, args: readonly string[]): number[] => {
  if (args.length >= 4 && args[3] === 'PitchSlide') {
    const slide = [argInt(args, 4), argInt(args, 5), argInt(args, 6)];
    return cmd === '.' ? [0xf1, ...slide] : [0xf9, keyByte(cmd), ...slide];
  }
  return cmd === '.' ? [] : [keyByte(cmd)];
};

const encodeSfxLine = (line: string): SfxLineBytes => {
  const [cmd = '', ...args] = line.split(/\s+/);
  if (cmd === 'SetInstrument') return { bytes: [0xe0, argInt(args, 0)], end: false };
  if (cmd === 'Restart') return { bytes: [0xff], end: true };
  if (cmd === 'Fallthrough') return { bytes: [], end: true };
  if (kKeysDict.has(cmd) || cmd === '.') return { bytes: [...noteBytes(args), ...pitchBytes(cmd, args)], end: false };
  return { bytes: [], end: false };
};

export { encodeSfxLine };
