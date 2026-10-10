/* @layer shared-asset-extraction @kind logic */
import * as yaml from 'js-yaml';
import type { CompiledSong, CompiledSoundBank, MusicCompileInput, MusicInfo } from './compile-types.type';
import { DUPLICATE_SAMPLE_SOURCES } from './compile-lookups.constants';
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

const sampleBytes = (input: MusicCompileInput, index: number): Buffer => {
  const sampleIdx = DUPLICATE_SAMPLE_SOURCES.get(index) ?? index;
  const sample = input.brrSamples[sampleIdx];
  if (sample === undefined) throw new Error(`Missing BRR sample ${sampleIdx}`);
  return sample;
};

const writeSampleDirectory = (serializer: MusicSerializer, input: MusicCompileInput, musicInfo: MusicInfo): void => {
  const sampleToAddr = new Map<string, number>();
  for (const [i, { file, repeat }] of musicInfo.samples.entries()) {
    let addr = sampleToAddr.get(file);
    if (addr === undefined) {
      addr = serializer.cursor();
      sampleToAddr.set(file, addr);
      serializer.write(sampleBytes(input, i));
    }
    serializer.writeWord(0x3c00 + i * 4, addr);
    serializer.writeWord(0x3c00 + i * 4 + 2, repeat !== undefined ? addr + Math.floor(repeat / 16) * 9 : serializer.cursor());
  }
  for (let i = 0; i < 6; i++) {
    serializer.writeWord(0x3c64 + i * 2, 0xffff);
  }
};

const writeIntroBank = (serializer: MusicSerializer, input: MusicCompileInput): void => {
  serializer.addr = 0x4000;
  const musicInfo = yaml.load(input.musicInfoYaml) as MusicInfo;
  writeSampleDirectory(serializer, input, musicInfo);

  for (const [i, info] of musicInfo.instruments.entries()) {
    const ea = 0x3d00 + i * 6;
    serializer.memory[ea + 0] = info.sample;
    serializer.memory[ea + 1] = 0x80 | (info.decay << 4) | info.attack;
    serializer.memory[ea + 2] = (info.sustain_level << 5) | info.sustain_rate;
    serializer.memory[ea + 3] = info.vxgain;
    serializer.memory[ea + 4] = info.pitch_base >> 8;
    serializer.memory[ea + 5] = info.pitch_base & 0xff;
  }

  serializer.writeAt(0x3d96, musicInfo.note_gate_off);
  serializer.writeAt(0x3d9e, musicInfo.note_volume);

  for (const [i, info] of musicInfo.sfx_instruments.entries()) {
    const ea = 0x3e00 + i * 9;
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

export { compileSoundBank };
