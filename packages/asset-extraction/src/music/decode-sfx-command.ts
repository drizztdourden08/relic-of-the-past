/* @layer shared-asset-extraction @kind logic */
import type { DecodedSfxCommand, SfxPrefix } from './decode-sfx.type';
import type { SoundBankContext } from './sound-bank-context';
import { noteToStr } from './note-to-str';

const pitchSlideName = (ctx: SoundBankContext, at: number): string =>
  `PitchSlide ${ctx.readByte(at)} ${ctx.readByte(at + 1)} ${ctx.readByte(at + 2)}`;

const decodeSfxCommand = (ctx: SoundBankContext, prefix: SfxPrefix): DecodedSfxCommand => {
  const { command, noteLength, volumeLeft, volumeRight, next } = prefix;
  const volumes = { noteLength, volumeLeft, volumeRight };
  if (command === 0xe0) {
    return { line: { kind: 'effect', effectName: `SetInstrument ${ctx.readByte(next)}` }, next: next + 1, end: false };
  }
  if (command === 0xf9) {
    const note = noteToStr(ctx.readByte(next) & 0x7f);
    return { line: { kind: 'note', effectName: pitchSlideName(ctx, next + 1), note, ...volumes }, next: next + 4, end: false };
  }
  if (command === 0xf1) {
    return { line: { kind: 'note', effectName: pitchSlideName(ctx, next), note: null, ...volumes }, next: next + 3, end: false };
  }
  if (command === 0xff) return { line: { kind: 'restart' }, next, end: true };
  return { line: { kind: 'note', note: noteToStr(command & 0x7f), ...volumes }, next, end: false };
};

export { decodeSfxCommand };
