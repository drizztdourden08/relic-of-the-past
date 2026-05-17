/**
 * Music extraction — loads SPC sound banks from ROM, decodes songs/phrases/patterns/SFX.
 *
 * Ported from: core/zelda3/assets/extract_music.py
 */
import * as yaml from 'js-yaml';
import type { RomData } from '../rom/rom-types';
import { decodeBrr } from '../compression/brr-codec';

// ─── Types ───

interface Song {
  type: 'Song';
  ea: number;
  name: string;
  index: number;
  phrases: (Phrase | PhraseLoop)[];
  isImported: boolean;
}

interface SongList {
  type: 'SongList';
  ea: number;
  name: string;
  songs: (Song | null)[];
  isImported: boolean;
}

interface Phrase {
  type: 'Phrase';
  ea: number;
  name: string;
  patterns: (Pattern | null)[];
  isImported: boolean;
}

interface Pattern {
  type: 'Pattern';
  ea: number;
  name: string;
  lines: PatternLine[];
  isImported: boolean;
}

interface PhraseLoop {
  type: 'PhraseLoop';
  name: string;
  loops: number;
  jmp: number;
}

type PatternLine =
  | { kind: 'note'; note: string; noteLength: number | null; volstuff: number | null }
  | { kind: 'effect'; name: string; args: (number | Pattern | null)[]; noteLength: number | null; volstuff: number | null }
  | { kind: 'call'; name: string; target: Pattern | null; loops: number; noteLength: number | null; volstuff: number | null }
  | { kind: 'fallthrough' };

type MusicEntity = Song | SongList | Phrase | Pattern;

// ─── Constants ───

const kEffectByteLength = [1, 1, 2, 3, 0, 1, 2, 1, 2, 1, 1, 3, 0, 1, 2, 3, 1, 3, 3, 0, 1, 3, 0, 3, 3, 3, 1];
const kEffectNames = [
  'Instrument', 'Pan', 'PanFade', 'Vibrato', 'VibratoOff',
  'SongVolume', 'SongVolumeFade', 'Tempo', 'TempoFade',
  'Transpose', 'ChannelTranpose', 'Tremolo', 'TremoloOff',
  'Volume', 'VolumeFade', 'Call', 'VibratoFade',
  'PitchEnvelopeTo', 'PitchEnvelopeFrom', 'PitchEnvelopeOff',
  'FineTune', 'EchoEnable', 'EchoOff', 'EchoSetup', 'EchoVolumeFade',
  'PitchSlide', 'PercussionDefine',
];

const kKeys = ['C-', 'C#', 'D-', 'D#', 'E-', 'F-', 'F#', 'G-', 'G#', 'A-', 'A#', 'B-'];

function noteToStr(note: number): string {
  if (note >= 72) {
    if (note === 72) return '-+-';
    if (note === 73) return '---';
    throw new Error(`Invalid note: ${note}`);
  }
  const octave = Math.floor(note / 12);
  const key = note % 12;
  return `${kKeys[key]}${octave + 1}`;
}

function toStr(s: unknown): string {
  if (typeof s === 'string') return s;
  if (typeof s === 'number') return String(s);
  if (s && typeof s === 'object' && 'name' in s) return (s as { name: string }).name;
  return String(s);
}

// ─── Sound bank context (replaces Python globals) ───

class SoundBankContext {
  memory: (number | null)[] = new Array(65536).fill(null);
  typesForEa = new Map<number, MusicEntity>();
  pqueue: [number, MusicEntity][] = [];
  songsInBank = 0;

  getByte(ea: number): number | null {
    return this.memory[ea];
  }

  getWord(ea: number): number {
    return (this.memory[ea] ?? 0) | ((this.memory[ea + 1] ?? 0) << 8);
  }

  reset(): void {
    this.typesForEa.clear();
    this.pqueue = [];
  }

  loadSoundBank(rom: RomData, ea: number, memIn?: (number | null)[]): number {
    if (memIn) this.memory = [...memIn];
    else this.memory = new Array(65536).fill(null);

    let j = 0;
    while (true) {
      const numBytes = rom.getWord(ea);
      const target = rom.getWord(ea + 2);
      if (numBytes === 0) return target; // entry point
      ea += 4;
      for (let i = 0; i < numBytes; i++) {
        this.memory[target + i] = rom.getByte(ea);
        ea += 1;
        if ((ea & 0xffff) < 0x8000) ea += 0x8000;
      }
      j++;
      if (j > 256) break;
    }
    return 0;
  }

  getTypeForEa<T extends MusicEntity>(ea: number, type: T['type']): T | null {
    if (ea === 0) return null;
    if (ea < 256) throw new Error(`Invalid ea: 0x${ea.toString(16)}`);

    const existing = this.typesForEa.get(ea);
    if (existing) {
      if (existing.type !== type) {
        throw new Error(`Type mismatch at 0x${ea.toString(16)}: expected ${type}, got ${existing.type}`);
      }
      return existing as T;
    }

    const entity = { type, ea, name: `${type}_0x${ea.toString(16)}`, isImported: false } as unknown as T;
    if (type === 'Song') (entity as unknown as Song).index = 0;
    if (type === 'Song') (entity as unknown as Song).phrases = [];
    if (type === 'Phrase') (entity as unknown as Phrase).patterns = [];
    if (type === 'Pattern') (entity as unknown as Pattern).lines = [];
    if (type === 'SongList') (entity as unknown as SongList).songs = [];

    this.typesForEa.set(ea, entity);
    if (this.getByte(ea) !== null) {
      this.pqueue.push([ea, entity]);
      this.pqueue.sort((a, b) => a[0] - b[0]);
      entity.isImported = false;
    } else {
      entity.isImported = true;
    }
    return entity;
  }

  getPattern(ea: number): Pattern | null {
    if (ea === 0) return null;
    return this.getTypeForEa<Pattern>(ea, 'Pattern');
  }

  getSong(ea: number, index: number): Song | null {
    const song = this.getTypeForEa<Song>(ea, 'Song');
    if (song) song.index = index;
    return song;
  }

  getPhrase(ea: number): Phrase | null {
    return this.getTypeForEa<Phrase>(ea, 'Phrase');
  }

  getSongList(ea: number, num: number): void {
    const songList = this.getTypeForEa<SongList>(ea, 'SongList');
    if (songList) {
      songList.songs = [];
      for (let i = 0; i < num; i++) {
        songList.songs.push(this.getSong(this.getWord(ea + i * 2), i));
      }
    }
  }

  decodePattern(pattern: Pattern, nextEa: number | null): void {
    let ea = pattern.ea;
    const startEa = ea;
    pattern.lines = [];

    while (true) {
      if (ea !== startEa && ea === nextEa) {
        pattern.lines.push({ kind: 'fallthrough' });
        return;
      }
      let noteLength: number | null = null;
      let volstuff: number | null = null;
      let cmd = this.getByte(ea)!;
      ea += 1;
      if (cmd === 0) break;
      if (!(cmd & 0x80)) {
        noteLength = cmd;
        cmd = this.getByte(ea)!;
        ea += 1;
        if (!(cmd & 0x80)) {
          volstuff = cmd;
          cmd = this.getByte(ea)!;
          ea += 1;
        }
      }
      if (cmd === 0xef) {
        // Call
        const addr = this.getWord(ea);
        const loops = this.getByte(ea + 2)!;
        ea += 3;
        pattern.lines.push({ kind: 'call', name: 'Call', target: this.getPattern(addr), loops, noteLength, volstuff });
      } else if (cmd >= 0xe0) {
        const x = kEffectByteLength[cmd - 0xe0];
        const args: number[] = [];
        for (let i = 0; i < x; i++) args.push(this.getByte(ea + i)!);
        ea += x;
        pattern.lines.push({ kind: 'effect', name: kEffectNames[cmd - 0xe0], args, noteLength, volstuff });
      } else {
        pattern.lines.push({ kind: 'note', note: noteToStr(cmd & 0x7f), noteLength, volstuff });
      }
    }
  }

  decodePhrase(phrase: Phrase): void {
    phrase.patterns = [];
    for (let i = 0; i < 8; i++) {
      phrase.patterns.push(this.getPattern(this.getWord(phrase.ea + i * 2)));
    }
  }

  decodeSong(song: Song): void {
    let ea = song.ea;
    song.phrases = [];
    const easInPhrase: number[] = [];

    while (true) {
      easInPhrase.push(ea);
      const phrase = this.getWord(ea);
      if (phrase === 0) break;
      if (phrase < 0x100) {
        const tgt = this.getWord(ea + 2);
        song.phrases.push({ type: 'PhraseLoop', name: `PhraseLoop ${phrase} ${(tgt - ea) / 2}`, loops: phrase, jmp: (tgt - ea) / 2 });
        ea += 4;
      } else {
        const p = this.getPhrase(phrase);
        if (p) song.phrases.push(p);
        ea += 2;
      }
    }
  }

  decodeAny(what: MusicEntity, nextEa: number | null): void {
    switch (what.type) {
      case 'Song': this.decodeSong(what as Song); break;
      case 'Phrase': this.decodePhrase(what as Phrase); break;
      case 'Pattern': this.decodePattern(what as Pattern, nextEa); break;
      case 'SongList': break; // no-op
    }
  }

  processQueue(): void {
    while (this.pqueue.length > 0) {
      const [, item] = this.pqueue.shift()!;
      const nextEa = this.pqueue.length > 0 ? this.pqueue[0][0] : null;
      this.decodeAny(item, nextEa);
    }
  }

  loadSong(rom: RomData, song: string): void {
    this.reset();
    if (song === 'intro') {
      this.loadSoundBank(rom, 0x998000);
      this.songsInBank = (this.getWord(0xd000) - 0xd000) / 2;
    } else if (song === 'lightworld') {
      this.loadSoundBank(rom, 0x9a9ef5);
      this.songsInBank = (this.getWord(0xd000) - 0xd000) / 2;
    } else if (song === 'indoor') {
      this.loadSoundBank(rom, 0x9b8000);
      this.songsInBank = (0xd046 - 0xd000) / 2;
    } else if (song === 'ending') {
      this.loadSoundBank(rom, 0x9ad380);
      this.songsInBank = (0xd046 - 0xd000) / 2;
    }
  }
}

// ─── Formatters (produce text output matching Python) ───

function formatPattern(p: Pattern): string {
  let r = `[Pattern_0x${p.ea.toString(16)}]\n`;
  for (const line of p.lines) {
    if (line.kind === 'fallthrough') {
      r += 'Fallthrough\n';
    } else if (line.kind === 'call') {
      const targetName = line.target ? line.target.name : 'None';
      r += `${line.name} ${targetName} ${line.loops}`;
      if (line.noteLength !== null) r = r; // Call lines use 4-element format
      r += '\n';
    } else if (line.kind === 'effect') {
      r += `${line.name} ${line.args.map(toStr).join(' ')}`;
      if (line.noteLength !== null) r += ` ${line.noteLength}`;
      if (line.volstuff !== null) r += ` ${line.volstuff.toString(16)}`;
      r += '\n';
    } else {
      // note
      let s = line.note;
      if (line.noteLength !== null) {
        s += ` ${String(line.noteLength).padStart(2)}`;
      } else {
        s += ' --';
      }
      if (line.volstuff !== null) {
        s += ` ${line.volstuff.toString(16).padStart(2)}`;
      } else {
        s += ' --';
      }
      r += s + '\n';
    }
  }
  return r;
}

function formatPhrase(p: Phrase): string {
  let s = `[Phrase_0x${p.ea.toString(16)}]\n`;
  for (const pat of p.patterns) {
    s += (pat ? pat.name : 'None') + '\n';
  }
  return s;
}

function formatSong(s: Song): string {
  let r = `# Song index ${s.index}\n`;
  r += `[Song_0x${s.ea.toString(16)}]\n`;
  for (const phrase of s.phrases) {
    r += phrase.name + '\n';
  }
  return r;
}

function formatSongList(sl: SongList): string {
  let s = `[SongList_0x${sl.ea.toString(16)}]\n`;
  for (const song of sl.songs) {
    s += (song ? song.name : 'None') + '\n';
  }
  return s;
}

function formatEntity(e: MusicEntity): string {
  switch (e.type) {
    case 'Song': return formatSong(e as Song);
    case 'SongList': return formatSongList(e as SongList);
    case 'Phrase': return formatPhrase(e as Phrase);
    case 'Pattern': return formatPattern(e as Pattern);
  }
}

// ─── SFX decoding ───

interface SfxLine {
  kind: 'note' | 'effect' | 'restart' | 'fallthrough';
  effectName?: string;
  note?: string | null;
  noteLength?: number | null;
  volumeLeft?: number | null;
  volumeRight?: number | null;
}

function decodeSfx(ctx: SoundBankContext, ea: number, nextAddr: number): SfxLine[] {
  const r: SfxLine[] = [];
  while (true) {
    if (ea === nextAddr) {
      r.push({ kind: 'fallthrough' });
      return r;
    }
    let b = ctx.getByte(ea)!;
    ea += 1;
    if (b === 0) return r;

    let noteLength: number | null = null;
    let volumeLeft: number | null = null;
    let volumeRight: number | null = null;

    if (!(b & 0x80)) {
      noteLength = b;
      b = ctx.getByte(ea)!;
      ea += 1;
      if (!(b & 0x80)) {
        volumeLeft = b;
        b = ctx.getByte(ea)!;
        ea += 1;
        if (!(b & 0x80)) {
          volumeRight = b;
          b = ctx.getByte(ea)!;
          ea += 1;
        }
      }
    }

    if (b === 0xe0) {
      const instr = ctx.getByte(ea)!;
      ea += 1;
      r.push({ kind: 'effect', effectName: `SetInstrument ${instr}` });
    } else if (b === 0xf9) {
      const noteVal = ctx.getByte(ea)!;
      ea += 1;
      const b0 = ctx.getByte(ea)!;
      const b1 = ctx.getByte(ea + 1)!;
      const b2 = ctx.getByte(ea + 2)!;
      ea += 3;
      r.push({ kind: 'note', effectName: `PitchSlide ${b0} ${b1} ${b2}`, note: noteToStr(noteVal & 0x7f), noteLength, volumeLeft, volumeRight });
    } else if (b === 0xf1) {
      const b0 = ctx.getByte(ea)!;
      const b1 = ctx.getByte(ea + 1)!;
      const b2 = ctx.getByte(ea + 2)!;
      ea += 3;
      r.push({ kind: 'note', effectName: `PitchSlide ${b0} ${b1} ${b2}`, note: null, noteLength, volumeLeft, volumeRight });
    } else if (b === 0xff) {
      r.push({ kind: 'restart' });
      return r;
    } else {
      r.push({ kind: 'note', note: noteToStr(b & 0x7f), noteLength, volumeLeft, volumeRight });
    }
  }
}

function formatSfxLine(line: SfxLine): string {
  if (line.kind === 'fallthrough') return 'Fallthrough';
  if (line.kind === 'restart') return 'Restart';
  if (line.kind === 'effect') return line.effectName!;

  const aa = line.note === null ? '.  ' : line.note!;
  const bb = line.noteLength === null ? '--' : String(line.noteLength).padStart(2);
  const cc = line.volumeLeft === null ? '---' : String(line.volumeLeft).padStart(3);
  const dd = line.volumeRight === null ? '---' : String(line.volumeRight).padStart(3);
  const r0 = line.effectName ? ' ' + line.effectName : '';
  return `${aa} ${bb} ${cc} ${dd}${r0}`;
}

// ─── Public API ───

export interface MusicExtractionResult {
  /** Song text files: { 'sound_intro.txt': content, ... } */
  songTexts: Record<string, string>;
  /** SFX text: 'sfx.txt' content */
  sfxText: string;
  /** BRR audio samples (raw bytes) */
  brrSamples: Buffer[];
  /** PCM decoded audio samples */
  pcmSamples: Buffer[];
  /** music_info.yaml content */
  musicInfoYaml: string;
}

export function extractSoundData(rom: RomData): MusicExtractionResult {
  const ctx = new SoundBankContext();
  const songTexts: Record<string, string> = {};
  let sfxText = '';
  const brrSamples: Buffer[] = [];
  const pcmSamples: Buffer[] = [];
  let musicInfoYaml = '';

  for (const songName of ['intro', 'indoor', 'ending']) {
    ctx.loadSong(rom, songName);

    // Collect BRR/PCM and music_info only from intro bank
    if (songName === 'intro') {
      const { brr, pcm, infoYaml } = dumpBrrAndInfo(ctx);
      brrSamples.push(...brr);
      pcmSamples.push(...pcm);
      musicInfoYaml = infoYaml;
      sfxText = printAllSfx(ctx);
    }

    // Decode song structures
    ctx.getSongList(0xd000, ctx.songsInBank);

    // Add known phrases for specific banks
    if (songName === 'intro') {
      ctx.getPhrase(0xd878);
      ctx.getPhrase(0xd8a8);
      ctx.getPhrase(0xd8b8);
      ctx.getPhrase(0xdf11);
      ctx.getPhrase(0xe37c);
    } else if (songName === 'indoor') {
      ctx.getPhrase(0xdc5e);
      ctx.getPhrase(0xdc6e);
      ctx.getPattern(0xe905);
      ctx.getPhrase(0xe94a);
    } else if (songName === 'ending') {
      ctx.getPhrase(0x2a10);
    }

    ctx.processQueue();

    // Format output
    const sorted = Array.from(ctx.typesForEa.entries()).sort((a, b) => a[0] - b[0]);
    let text = '';
    for (const [, entity] of sorted) {
      if (!entity.isImported) {
        text += formatEntity(entity) + '\n';
      }
    }
    songTexts[`sound_${songName}.txt`] = text;
  }

  return { songTexts, sfxText, brrSamples, pcmSamples, musicInfoYaml };
}

function dumpBrrAndInfo(ctx: SoundBankContext): { brr: Buffer[]; pcm: Buffer[]; infoYaml: string } {
  const kDupSamples: Record<number, number> = { 10: 9, 20: 19 };
  const brr: Buffer[] = [];
  const pcm: Buffer[] = [];

  const musicInfo: Record<string, unknown> = {};
  const samples: Record<string, unknown>[] = [];

  for (let audioIdx = 0; audioIdx < 25; audioIdx++) {
    const start = ctx.getWord(0x3c00 + audioIdx * 4);
    const rep = ctx.getWord(0x3c00 + audioIdx * 4 + 2);

    // Decode BRR
    const olds = new Int16Array(2);
    const decoded = decodeBrr((x: number) => ctx.getByte(start + x) ?? 0, olds as unknown as [number, number]);

    // Get raw BRR bytes
    const brrLen = (decoded.length / 16) * 9;
    const brrData = Buffer.alloc(brrLen);
    for (let i = 0; i < brrLen; i++) {
      brrData[i] = ctx.getByte(start + i) ?? 0;
    }
    brr.push(brrData);

    // PCM as int16 LE
    const pcmBuf = Buffer.alloc(decoded.length * 2);
    for (let i = 0; i < decoded.length; i++) {
      pcmBuf.writeInt16LE(decoded[i], i * 2);
    }
    pcm.push(pcmBuf);

    // Sample info
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
}

function addSustainDecay(ctx: SoundBankContext, ea: number, info: Record<string, number>): void {
  const adsr1 = ctx.getByte(ea) ?? 0;
  const adsr2 = ctx.getByte(ea + 1) ?? 0;
  const gain = ctx.getByte(ea + 2) ?? 0;
  info.decay = (adsr1 >> 4) & 7;
  info.attack = adsr1 & 0xf;
  info.sustain_level = adsr2 >> 5;
  info.sustain_rate = adsr2 & 0x1f;
  info.vxgain = gain;
}

function printAllSfx(ctx: SoundBankContext): string {
  const items = new Set<number>();
  let output = '';

  function addSfxTop(base: number, num: number, name: string): void {
    output += `[${name}_0x${base.toString(16)}]\n`;
    const nextEa = base + num * 2;
    const echoEa = nextEa + num;
    for (let i = 0; i < num; i++) {
      const ea = ctx.getWord(base + i * 2);
      let t: string;
      if (ea === 0) {
        t = 'None';
      } else {
        items.add(ea);
        t = `Sfx_0x${ea.toString(16)}`;
      }
      if (name === 'SfxPort1') {
        output += `${t},${ctx.getByte(nextEa + i) ?? 0}\n`;
      } else {
        output += `${t},${ctx.getByte(nextEa + i) ?? 0},${ctx.getByte(echoEa + i) ?? 0}\n`;
      }
    }
    output += '\n';
  }

  addSfxTop(0x17c0, 32, 'SfxPort1');
  addSfxTop(0x1820, 63, 'SfxPort2');
  addSfxTop(0x191c, 63, 'SfxPort3');

  // Known SFX addresses
  for (const addr of [0x1a5b, 0x1d1c, 0x1ee2, 0x1f13, 0x1f1c, 0x252d, 0x2533,
    0x26a2, 0x277e, 0x279d, 0x27c9, 0x27f6, 0x2807, 0x2818, 0x2829, 0x2831, 0x284a]) {
    items.add(addr);
  }

  const sortedItems = Array.from(items).sort((a, b) => a - b);
  for (let i = 0; i < sortedItems.length; i++) {
    output += `[Sfx_0x${sortedItems[i].toString(16)}]\n`;
    const nextAddr = i + 1 < sortedItems.length ? sortedItems[i + 1] : 0;
    const rs = decodeSfx(ctx, sortedItems[i], nextAddr);
    for (const line of rs) {
      output += formatSfxLine(line) + '\n';
    }
    output += '\n';
  }

  return output;
}
