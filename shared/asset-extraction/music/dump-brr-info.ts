/* @layer shared-asset-extraction @kind logic */
/**
 * BRR sample dumping and music_info.yaml generation.
 */
import * as yaml from 'js-yaml';
import { decodeBrr } from '../compression/brr-codec';
import type { SoundBankContext } from './sound-bank-context';

const kDupSamples: Record<number, number> = { 10: 9, 20: 19 };

const addSustainDecay = (ctx: SoundBankContext, ea: number, info: Record<string, number>): void => {
  const adsr1 = ctx.getByte(ea) ?? 0;
  const adsr2 = ctx.getByte(ea + 1) ?? 0;
  const gain = ctx.getByte(ea + 2) ?? 0;
  info.decay = (adsr1 >> 4) & 7;
  info.attack = adsr1 & 0xf;
  info.sustain_level = adsr2 >> 5;
  info.sustain_rate = adsr2 & 0x1f;
  info.vxgain = gain;
};

const dumpBrrAndInfo = (ctx: SoundBankContext): { brr: Buffer[]; pcm: Buffer[]; infoYaml: string } => {
  const brr: Buffer[] = [];
  const pcm: Buffer[] = [];

  const musicInfo: Record<string, unknown> = {};
  const samples: Record<string, unknown>[] = [];

  for (let audioIdx = 0; audioIdx < 25; audioIdx++) {
    const start = ctx.getWord(0x3c00 + audioIdx * 4);
    const rep = ctx.getWord(0x3c00 + audioIdx * 4 + 2);

    const olds = new Int16Array(2);
    const decoded = decodeBrr((x: number) => ctx.getByte(start + x) ?? 0, olds as unknown as [number, number]);

    const brrLen = (decoded.length / 16) * 9;
    const brrData = Buffer.alloc(brrLen);
    for (let i = 0; i < brrLen; i++) {
      brrData[i] = ctx.getByte(start + i) ?? 0;
    }
    brr.push(brrData);

    const pcmBuf = Buffer.alloc(decoded.length * 2);
    for (let i = 0; i < decoded.length; i++) {
      pcmBuf.writeInt16LE(decoded[i], i * 2);
    }
    pcm.push(pcmBuf);

    const sampleInfo: Record<string, unknown> = {
      file: `sound/sound${kDupSamples[audioIdx] ?? audioIdx}.pcm`,
    };
    if ((ctx.getByte(start) ?? 0) & 2) {
      sampleInfo.repeat = Math.floor((rep - start) / 9) * 16;
    }
    samples.push(sampleInfo);
  }
  musicInfo.samples = samples;

  // Instruments
  const instruments: Record<string, unknown>[] = [];
  for (let i = 0; i < 25; i++) {
    const ea = 0x3d00 + i * 6;
    const info: Record<string, number> = {
      sample: ctx.getByte(ea) ?? 0,
    };
    addSustainDecay(ctx, ea + 1, info);
    info.pitch_base = ((ctx.getByte(ea + 4) ?? 0) << 8) | (ctx.getByte(ea + 5) ?? 0);
    instruments.push(info);
  }
  musicInfo.instruments = instruments;

  musicInfo.note_gate_off = Array.from({ length: 8 }, (_, i) => ctx.getByte(0x3d96 + i) ?? 0);
  musicInfo.note_volume = Array.from({ length: 16 }, (_, i) => ctx.getByte(0x3d9e + i) ?? 0);

  // SFX instruments
  const sfxInstruments: Record<string, unknown>[] = [];
  for (let i = 0; i < 25; i++) {
    const ea = 0x3e00 + i * 9;
    const info: Record<string, number> = {
      voll: ctx.getByte(ea) ?? 0,
      volr: ctx.getByte(ea + 1) ?? 0,
      pitch: ctx.getWord(ea + 2),
      sample: ctx.getByte(ea + 4) ?? 0,
    };
    addSustainDecay(ctx, ea + 5, info);
    info.pitch_base = ctx.getByte(ea + 8) ?? 0;
    sfxInstruments.push(info);
  }
  musicInfo.sfx_instruments = sfxInstruments;

  const infoYaml = yaml.dump(musicInfo, { flowLevel: -1, sortKeys: false });
  return { brr, pcm, infoYaml };
};

export { dumpBrrAndInfo };
