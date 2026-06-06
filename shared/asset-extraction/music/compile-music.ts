/**
 * Music compiler — orchestrator that compiles extracted music text back to SPC sound bank binary.
 *
 * Ported from: core/zelda3/assets/compile_music.py
 */
import * as yaml from 'js-yaml';
import type { CompiledSong, CompiledSoundBank, MusicCompileInput } from './compile-types';
import { NameRegistry } from './name-registry';
import { MusicSerializer } from './music-serializer';
import { parseFile } from './parse-music-file';

const compileSoundBank = (songName: string, input: MusicCompileInput): CompiledSoundBank => {
  const registry = new NameRegistry();
  const serializer = new MusicSerializer();

  const songFile = input.songTexts[`sound_${songName}.txt`];
  if (!songFile) throw new Error(`Missing sound_${songName}.txt`);
  const sortedEnts = parseFile(songFile, registry);

  if (songName === 'intro') {
    const sfxEnts = parseFile(input.sfxText, registry);
    sortedEnts.push(...sfxEnts);
  }

  if (songName === 'intro') {
    writeIntroBank(serializer, input);
  }

  sortedEnts.sort((a, b) => (a.ea ?? 0) - (b.ea ?? 0));
  serializer.addr = null;
  for (const e of sortedEnts) {
    serializer.writeObj(e);
  }

  if (songName === 'indoor') {
    const s = registry.getOrCreate<CompiledSong>('Song_0x2880', 'Song', false);
    if (s) {
      s.defined = true;
      s.writeAddr = 0x2880;
    }
  }

  registry.checkAllDefined();
  serializer.processRelocs();

  const mem = serializer.memory.slice();
  const data = Buffer.alloc(65536);
  for (let i = 0; i < 65536; i++) {
    data[i] = mem[i] ?? 0;
  }
  return { data, memory: mem };
};

const writeIntroBank = (serializer: MusicSerializer, input: MusicCompileInput): void => {
  serializer.addr = 0x4000;
  const musicInfo = yaml.load(input.musicInfoYaml) as Record<string, unknown>;
  const samples = musicInfo.samples as { file: string; repeat?: number }[];
  const sampleToAddr = new Map<string, number>();

  const kDupSamples: Record<number, number> = { 10: 9, 20: 19 };
  for (let i = 0; i < samples.length; i++) {
    const file = samples[i].file;
    if (!sampleToAddr.has(file)) {
      sampleToAddr.set(file, serializer.addr!);
      const sampleIdx = kDupSamples[i] ?? i;
      serializer.write(input.brrSamples[sampleIdx]);
    }
    const addr = sampleToAddr.get(file)!;
    serializer.writeWord(0x3c00 + i * 4, addr);
    const rep = samples[i].repeat;
    serializer.writeWord(0x3c00 + i * 4 + 2, rep !== undefined ? addr + Math.floor(rep / 16) * 9 : serializer.addr!);
  }
  for (let i = 0; i < 6; i++) {
    serializer.writeWord(0x3c64 + i * 2, 0xffff);
  }

  const instruments = musicInfo.instruments as Record<string, number>[];
  for (let i = 0; i < instruments.length; i++) {
    const ea = 0x3d00 + i * 6;
    const info = instruments[i];
    serializer.memory[ea + 0] = info.sample;
    serializer.memory[ea + 1] = 0x80 | (info.decay << 4) | info.attack;
    serializer.memory[ea + 2] = (info.sustain_level << 5) | info.sustain_rate;
    serializer.memory[ea + 3] = info.vxgain;
    serializer.memory[ea + 4] = info.pitch_base >> 8;
    serializer.memory[ea + 5] = info.pitch_base & 0xff;
  }

  serializer.writeAt(0x3d96, (musicInfo.note_gate_off as number[]));
  serializer.writeAt(0x3d9e, (musicInfo.note_volume as number[]));

  const sfxInstruments = musicInfo.sfx_instruments as Record<string, number>[];
  for (let i = 0; i < sfxInstruments.length; i++) {
    const ea = 0x3e00 + i * 9;
    const info = sfxInstruments[i];
    serializer.memory[ea + 0] = info.voll;
    serializer.memory[ea + 1] = info.volr;
    serializer.writeWord(ea + 2, info.pitch);
    serializer.memory[ea + 4] = info.sample;
    serializer.memory[ea + 5] = 0x80 | (info.decay << 4) | info.attack;
    serializer.memory[ea + 6] = (info.sustain_level << 5) | info.sustain_rate;
    serializer.memory[ea + 7] = info.vxgain;
    serializer.memory[ea + 8] = info.pitch_base;
  }
};

const produceLoadableSeq = (serializer_memory: (number | null)[]): Buffer => {
  const chunks: Buffer[] = [];
  let start = 0;

  while (start < 0x10000) {
    while (start < 0x10000 && serializer_memory[start] === null) start++;
    if (start >= 0x10000) break;

    let end = start;
    while (end < 0x10000 && serializer_memory[end] !== null) end++;

    const len = end - start;
    const header = Buffer.alloc(4);
    header.writeUInt16LE(len, 0);
    header.writeUInt16LE(start, 2);
    chunks.push(header);

    const data = Buffer.alloc(len);
    for (let i = 0; i < len; i++) {
      data[i] = serializer_memory[start + i]!;
    }
    chunks.push(data);
    start = end;
  }

  chunks.push(Buffer.alloc(2));
  return Buffer.concat(chunks);
};

export { compileSoundBank, produceLoadableSeq };
export type { CompiledSoundBank, MusicCompileInput };
