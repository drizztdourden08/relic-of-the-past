/* @layer shared-asset-extraction @kind logic */
import * as yaml from 'js-yaml';
import { decodeBrr } from '../compression/brr-codec';
import type { SoundBankContext } from './sound-bank-context';
import { DUPLICATE_SAMPLE_SOURCES } from './compile-lookups.constants';

const byteOr0 = (ctx: SoundBankContext, ea: number): number => ctx.getByte(ea) ?? 0;

const addSustainDecay = (ctx: SoundBankContext, ea: number, info: Record<string, number>): void => {
  const adsr1 = byteOr0(ctx, ea);
  const adsr2 = byteOr0(ctx, ea + 1);
  const gain = byteOr0(ctx, ea + 2);
  info.decay = (adsr1 >> 4) & 7;
  info.attack = adsr1 & 0xf;
  info.sustain_level = adsr2 >> 5;
  info.sustain_rate = adsr2 & 0x1f;
  info.vxgain = gain;
};

const dumpSample = (ctx: SoundBankContext, audioIdx: number): { brr: Buffer; pcm: Buffer; info: Record<string, unknown> } => {
  const start = ctx.getWord(0x3c00 + audioIdx * 4);
  const rep = ctx.getWord(0x3c00 + audioIdx * 4 + 2);
  const decoded = decodeBrr((x: number) => byteOr0(ctx, start + x));

  const brrLen = (decoded.length / 16) * 9;
  const brr = Buffer.alloc(brrLen);
  for (let i = 0; i < brrLen; i++) brr[i] = byteOr0(ctx, start + i);

  const pcm = Buffer.alloc(decoded.length * 2);
  for (const [i, sample] of decoded.entries()) pcm.writeInt16LE(sample, i * 2);

  const info: Record<string, unknown> = {
    file: `sound/sound${DUPLICATE_SAMPLE_SOURCES.get(audioIdx) ?? audioIdx}.pcm`,
  };
  if (byteOr0(ctx, start) & 2) info.repeat = Math.floor((rep - start) / 9) * 16;
  return { brr, pcm, info };
};

const readInstruments = (ctx: SoundBankContext): Record<string, number>[] =>
  Array.from({ length: 25 }, (_, i) => {
    const ea = 0x3d00 + i * 6;
    const info: Record<string, number> = { sample: byteOr0(ctx, ea) };
    addSustainDecay(ctx, ea + 1, info);
    info.pitch_base = (byteOr0(ctx, ea + 4) << 8) | byteOr0(ctx, ea + 5);
    return info;
  });

const readSfxInstruments = (ctx: SoundBankContext): Record<string, number>[] =>
  Array.from({ length: 25 }, (_, i) => {
    const ea = 0x3e00 + i * 9;
    const info: Record<string, number> = {
      voll: byteOr0(ctx, ea),
      volr: byteOr0(ctx, ea + 1),
      pitch: ctx.getWord(ea + 2),
      sample: byteOr0(ctx, ea + 4),
    };
    addSustainDecay(ctx, ea + 5, info);
    info.pitch_base = byteOr0(ctx, ea + 8);
    return info;
  });

const dumpBrrAndInfo = (ctx: SoundBankContext): { brr: Buffer[]; pcm: Buffer[]; infoYaml: string } => {
  const dumped = Array.from({ length: 25 }, (_, audioIdx) => dumpSample(ctx, audioIdx));
  const musicInfo: Record<string, unknown> = {};
  musicInfo.samples = dumped.map((sample) => sample.info);
  musicInfo.instruments = readInstruments(ctx);
  musicInfo.note_gate_off = Array.from({ length: 8 }, (_, i) => byteOr0(ctx, 0x3d96 + i));
  musicInfo.note_volume = Array.from({ length: 16 }, (_, i) => byteOr0(ctx, 0x3d9e + i));
  musicInfo.sfx_instruments = readSfxInstruments(ctx);

  const infoYaml = yaml.dump(musicInfo, { flowLevel: -1, sortKeys: false });
  return { brr: dumped.map((sample) => sample.brr), pcm: dumped.map((sample) => sample.pcm), infoYaml };
};

export { dumpBrrAndInfo };
