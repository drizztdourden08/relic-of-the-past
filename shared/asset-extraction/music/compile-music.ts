/**
 * Music compiler — compiles extracted music text back to SPC sound bank binary.
 *
 * Ported from: core/zelda3/assets/compile_music.py
 */
import * as yaml from 'js-yaml';

// ─── Types ───

interface CompiledSong {
  name: string;
  ea: number | null;
  defined: boolean;
  writeAddr: number;
  phrases: (CompiledPhrase | CompiledPhraseLoop)[];
}

interface CompiledPhrase {
  type: 'Phrase';
  name: string;
  ea: number | null;
  defined: boolean;
  writeAddr: number;
  patterns: (CompiledPattern | null)[];
}

interface CompiledPhraseLoop {
  type: 'PhraseLoop';
  name: string;
  loops: number;
  jmp: number;
}

interface CompiledPattern {
  type: 'Pattern';
  name: string;
  ea: number | null;
  defined: boolean;
  writeAddr: number;
  lines: PatternLine[];
  fallthrough: boolean;
}

interface CompiledSfxPattern {
  type: 'SfxPattern';
  name: string;
  ea: number | null;
  defined: boolean;
  writeAddr: number;
  lines: string[];
}

interface CompiledSongList {
  type: 'SongList';
  name: string;
  ea: number | null;
  defined: boolean;
  writeAddr: number;
  songs: (CompiledSong | null)[];
}

interface CompiledSfxList {
  type: 'SfxList';
  name: string;
  ea: number | null;
  defined: boolean;
  writeAddr: number;
  patterns: (CompiledSfxPattern | null)[];
  next: number[];
  echo: number[];
}

type PatternLine = [string, (number | CompiledPattern | null)[], number | null, number | null];

type Entity = CompiledSong | CompiledPhrase | CompiledPattern |
  CompiledSfxPattern | CompiledSongList | CompiledSfxList;

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
const kEffectNamesDict = new Map(kEffectNames.map((n, i) => [n, i]));

const kKeys = ['C-', 'C#', 'D-', 'D#', 'E-', 'F-', 'F#', 'G-', 'G#', 'A-', 'A#', 'B-'];
const kKeysDict = new Map<string, number>();
for (let j = 0; j < 6; j++) {
  for (let i = 0; i < kKeys.length; i++) {
    kKeysDict.set(`${kKeys[i]}${j + 1}`, i + j * 12);
  }
}
kKeysDict.set('-+-', 72);
kKeysDict.set('---', 73);

const kGapStartAddrs = new Set([0x2b00, 0x2880, 0xd000]);

// ─── Name registry ───

class NameRegistry {
  private types = new Map<string, Entity>();

  getOrCreate<T extends Entity>(name: string, type: string, isCreate: boolean): T | null {
    if (name === 'None') return null;

    const existing = this.types.get(name);
    if (existing) {
      if (isCreate) {
        if (existing.defined) throw new Error(`${name} already defined`);
        existing.defined = true;
      }
      return existing as T;
    }

    const entity = {
      type,
      name,
      defined: isCreate,
      ea: null,
      writeAddr: 0,
    } as unknown as T;

    if (name.includes('_0x')) {
      (entity as Entity).ea = parseInt(name.slice(name.indexOf('_0x') + 3), 16);
    }

    this.types.set(name, entity as Entity);
    return entity;
  }

  checkAllDefined(): void {
    for (const [name, entity] of Array.from(this.types)) {
      if (!entity.defined) throw new Error(`Symbol ${name} not defined`);
    }
  }
}

// ─── Serializer ───

class MusicSerializer {
  memory: (number | null)[] = new Array(65536).fill(null);
  relocs: [number, Entity][] = [];
  addr: number | null = null;

  write(data: ArrayLike<number>): void {
    for (let i = 0; i < data.length; i++) {
      if (this.memory[this.addr!] !== null) {
        throw new Error(`Memory already written at 0x${this.addr!.toString(16)}`);
      }
      this.memory[this.addr!] = data[i];
      this.addr!++;
    }
  }

  writeAt(a: number, data: number[]): void {
    for (const d of data) {
      this.memory[a] = d;
      a++;
    }
  }

  writeWord(a: number, v: number): void {
    this.memory[a] = v & 0xff;
    this.memory[a + 1] = (v >> 8) & 0xff;
  }

  writeRelocEntry(r: Entity | null): void {
    this.write([0, 0]);
    if (r) this.relocs.push([this.addr! - 2, r]);
  }

  writeSong(song: CompiledSong): void {
    for (const phrase of song.phrases) {
      if ((phrase as CompiledPhraseLoop).type === 'PhraseLoop') {
        const pl = phrase as CompiledPhraseLoop;
        const target = this.addr! + pl.jmp * 2;
        this.write([pl.loops, 0]);
        this.write([target & 0xff, target >> 8]);
      } else {
        this.writeRelocEntry(phrase as unknown as Entity);
      }
    }
    this.write([0, 0]);
  }

  writePhrase(phrase: CompiledPhrase): void {
    for (let i = 0; i < 8; i++) {
      this.writeRelocEntry(phrase.patterns[i] as unknown as Entity | null);
    }
  }

  writeSongList(songList: CompiledSongList): void {
    for (const song of songList.songs) {
      this.writeRelocEntry(song as unknown as Entity | null);
    }
  }

  writePattern(patt: CompiledPattern): void {
    for (const [cmd, args, noteLength, volstuff] of patt.lines) {
      if (noteLength !== null) this.write([noteLength]);
      if (volstuff !== null) this.write([volstuff]);
      if (kKeysDict.has(cmd)) {
        this.write([0x80 | kKeysDict.get(cmd)!]);
      } else if (cmd === 'Call') {
        this.write([0xef, 0, 0, args[1] as number]);
        this.relocs.push([this.addr! - 3, args[0] as unknown as Entity]);
      } else if (kEffectNamesDict.has(cmd)) {
        const i = kEffectNamesDict.get(cmd)!;
        this.write([0xe0 + i]);
        this.write(args as number[]);
      }
    }
    if (!patt.fallthrough) this.write([0]);
  }

  writeSfxPattern(patt: CompiledSfxPattern): void {
    for (let i = 0; i < patt.lines.length; i++) {
      const line = patt.lines[i];
      const parts = line.split(/\s+/);
      const lineCmd = parts[0];
      const lineArgs = parts.slice(1);

      if (lineCmd === 'SetInstrument') {
        this.write([0xe0, parseInt(lineArgs[0])]);
      } else if (lineCmd === 'Restart') {
        this.write([0xff]);
        return;
      } else if (lineCmd === 'Fallthrough') {
        return;
      } else if (kKeysDict.has(lineCmd) || lineCmd === '.') {
        if (lineArgs[0] !== '--') {
          this.write([parseInt(lineArgs[0])]);
          if (lineArgs[1] !== '---') {
            this.write([parseInt(lineArgs[1])]);
            if (lineArgs[2] !== '---') {
              this.write([parseInt(lineArgs[2])]);
            }
          }
        }
        if (lineArgs.length >= 4 && lineArgs[3] === 'PitchSlide') {
          if (lineCmd === '.') {
            this.write([0xf1, parseInt(lineArgs[4]), parseInt(lineArgs[5]), parseInt(lineArgs[6])]);
          } else {
            this.write([0xf9, kKeysDict.get(lineCmd)! | 0x80,
              parseInt(lineArgs[4]), parseInt(lineArgs[5]), parseInt(lineArgs[6])]);
          }
        } else {
          if (lineCmd === '.') {
            // rest/tie — do nothing extra
          } else {
            this.write([kKeysDict.get(lineCmd)! | 0x80]);
          }
        }
      }
    }
    this.write([0]);
  }

  writeSfxList(sfxList: CompiledSfxList): void {
    for (const pat of sfxList.patterns) {
      this.writeRelocEntry(pat as unknown as Entity | null);
    }
    for (const n of sfxList.next) this.write([n]);
    for (const e of sfxList.echo) this.write([e]);
  }

  writeObj(what: Entity): void {
    if (what.ea !== null) {
      if (this.addr === null || kGapStartAddrs.has(what.ea)) {
        this.addr = what.ea;
      } else if (what.ea !== this.addr) {
        throw new Error(`${what.name}: 0x${what.ea.toString(16)} != 0x${this.addr.toString(16)}`);
      }
    }
    what.writeAddr = this.addr!;

    switch ((what as { type: string }).type) {
      case 'Phrase': this.writePhrase(what as CompiledPhrase); break;
      case 'Pattern': this.writePattern(what as CompiledPattern); break;
      case 'Song': this.writeSong(what as unknown as CompiledSong); break;
      case 'SongList': this.writeSongList(what as CompiledSongList); break;
      case 'SfxPattern': this.writeSfxPattern(what as CompiledSfxPattern); break;
      case 'SfxList': this.writeSfxList(what as CompiledSfxList); break;
    }
  }

  processRelocs(): void {
    for (const [p, r] of this.relocs) {
      this.memory[p] = r.writeAddr & 0xff;
      this.memory[p + 1] = (r.writeAddr >> 8) & 0xff;
    }
  }
}

// ─── File parsing ───

function parseFile(text: string, registry: NameRegistry): Entity[] {
  const sortedEnts: Entity[] = [];
  let heading: string | null = null;
  let collect: string[] = [];

  function addCollect(h: string, c: string[]): void {
    const caption = h.replace(/[\[\]]/g, '').split(' ')[0];

    let entity: Entity;
    if (caption.startsWith('Song_')) {
      entity = processSong(caption, c, registry);
    } else if (caption.startsWith('Phrase_')) {
      entity = processPhrase(caption, c, registry);
    } else if (caption.startsWith('Pattern_')) {
      entity = processPattern(caption, c, registry);
    } else if (caption.startsWith('SongList_')) {
      entity = processSongList(caption, c, registry);
    } else if (caption.startsWith('Sfx_')) {
      entity = processSfxPattern(caption, c, registry);
    } else if (caption.startsWith('SfxPort')) {
      entity = processSfxList(caption, c, registry);
    } else {
      throw new Error(`Unknown section: ${caption}`);
    }
    sortedEnts.push(entity);
  }

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (line === '' || line.startsWith('#')) continue;
    if (line.startsWith('[')) {
      if (heading !== null) addCollect(heading, collect);
      heading = line;
      collect = [];
    } else {
      collect.push(line);
    }
  }
  if (heading !== null) addCollect(heading, collect);

  return sortedEnts;
}

function processSong(caption: string, lines: string[], registry: NameRegistry): Entity {
  const song = registry.getOrCreate<CompiledSong>(caption, 'Song', true)!;
  song.phrases = [];
  for (const line of lines) {
    const [lineCmd, ...lineArgs] = line.split(' ');
    if (lineCmd === 'PhraseLoop') {
      song.phrases.push({ type: 'PhraseLoop', name: `PhraseLoop ${lineArgs[0]} ${lineArgs[1]}`, loops: parseInt(lineArgs[0]), jmp: parseInt(lineArgs[1]) });
    } else {
      song.phrases.push(registry.getOrCreate<CompiledPhrase>(lineCmd, 'Phrase', false)!);
    }
  }
  return song as unknown as Entity;
}

function processSongList(caption: string, lines: string[], registry: NameRegistry): Entity {
  const songList = registry.getOrCreate<CompiledSongList>(caption, 'SongList', true)!;
  songList.songs = lines.map(l => registry.getOrCreate<CompiledSong>(l, 'Song', false));
  return songList as unknown as Entity;
}

function processPhrase(caption: string, lines: string[], registry: NameRegistry): Entity {
  const phrase = registry.getOrCreate<CompiledPhrase>(caption, 'Phrase', true)!;
  phrase.patterns = lines.map(l => registry.getOrCreate<CompiledPattern>(l, 'Pattern', false));
  return phrase as unknown as Entity;
}

function processPattern(caption: string, lines: string[], registry: NameRegistry): Entity {
  const pattern = registry.getOrCreate<CompiledPattern>(caption, 'Pattern', true)!;
  pattern.lines = [];
  pattern.fallthrough = false;
  for (const line of lines) {
    const [lineCmd, ...lineArgs] = line.split(/\s+/);
    if (lineCmd === 'Call') {
      pattern.lines.push(['Call', [registry.getOrCreate<CompiledPattern>(lineArgs[0], 'Pattern', false), parseInt(lineArgs[1])], null, null]);
    } else if (lineCmd === 'Fallthrough') {
      pattern.fallthrough = true;
    } else if (kEffectNamesDict.has(lineCmd)) {
      pattern.lines.push([lineCmd, lineArgs.map(a => parseInt(a)), null, null]);
    } else if (kKeysDict.has(lineCmd)) {
      const noteLength = lineArgs[0] === '--' ? null : parseInt(lineArgs[0]);
      const volstuff = lineArgs[1] === '--' ? null : parseInt(lineArgs[1], 16);
      pattern.lines.push([lineCmd, lineArgs as unknown as number[], noteLength, volstuff]);
    } else {
      throw new Error(`Unknown pattern command: ${lineCmd}`);
    }
  }
  return pattern as unknown as Entity;
}

function processSfxPattern(caption: string, lines: string[], registry: NameRegistry): Entity {
  const pattern = registry.getOrCreate<CompiledSfxPattern>(caption, 'SfxPattern', true)!;
  pattern.lines = lines;
  return pattern as unknown as Entity;
}

function processSfxList(caption: string, lines: string[], registry: NameRegistry): Entity {
  const sfxList = registry.getOrCreate<CompiledSfxList>(caption, 'SfxList', true)!;
  sfxList.patterns = [];
  sfxList.next = [];
  sfxList.echo = [];
  for (const line of lines) {
    const parts = line.split(',');
    sfxList.patterns.push(registry.getOrCreate<CompiledSfxPattern>(parts[0], 'SfxPattern', false));
    sfxList.next.push(parseInt(parts[1]));
    if (parts.length >= 3) sfxList.echo.push(parseInt(parts[2]));
  }
  return sfxList as unknown as Entity;
}

// ─── Public API ───

interface MusicCompileInput {
  /** Contents of sound_intro.txt, sound_indoor.txt, sound_ending.txt */
  songTexts: Record<string, string>;
  /** Contents of sfx.txt */
  sfxText: string;
  /** BRR sample files indexed by sample number */
  brrSamples: Buffer[];
  /** Contents of music_info.yaml */
  musicInfoYaml: string;
}

interface CompiledSoundBank {
  /** Full 64KB memory (nulls → 0) */
  data: Buffer;
  /** Raw serializer memory with nulls preserved (needed for produceLoadableSeq) */
  memory: (number | null)[];
}

/**
 * Compile a sound bank from extracted text files.
 * Returns the loadable data sequence matching what the SNES SPC700 expects.
 */
function compileSoundBank(songName: string, input: MusicCompileInput): CompiledSoundBank {
  const registry = new NameRegistry();
  const serializer = new MusicSerializer();

  // Parse the song file
  const songFile = input.songTexts[`sound_${songName}.txt`];
  if (!songFile) throw new Error(`Missing sound_${songName}.txt`);
  const sortedEnts = parseFile(songFile, registry);

  // Parse SFX for intro bank
  if (songName === 'intro') {
    const sfxEnts = parseFile(input.sfxText, registry);
    sortedEnts.push(...sfxEnts);
  }

  // Handle intro bank specifics (sample loading, instruments)
  if (songName === 'intro') {
    serializer.addr = 0x4000;
    const musicInfo = yaml.load(input.musicInfoYaml) as Record<string, unknown>;
    const samples = musicInfo.samples as { file: string; repeat?: number }[];
    const sampleToAddr = new Map<string, number>();

    // Write BRR samples
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

    // Write instruments
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

    // SFX instruments
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
  }

  // Serialize entities (sorted by ea, matching Python's sorted(sorted_ents, key=lambda x: x.ea))
  sortedEnts.sort((a, b) => (a.ea ?? 0) - (b.ea ?? 0));
  serializer.addr = null;
  for (const e of sortedEnts) {
    serializer.writeObj(e);
  }

  // Special case: indoor bank defines Song_0x2880
  if (songName === 'indoor') {
    const s = registry.getOrCreate<CompiledSong>('Song_0x2880', 'Song', false);
    if (s) {
      s.defined = true;
      s.writeAddr = 0x2880;
    }
  }

  registry.checkAllDefined();
  serializer.processRelocs();

  // Produce output buffer
  const mem = serializer.memory.slice();
  const data = Buffer.alloc(65536);
  for (let i = 0; i < 65536; i++) {
    data[i] = mem[i] ?? 0;
  }
  return { data, memory: mem };
}

/**
 * Produce a loadable sequence (the format used in zelda3_assets.dat).
 * Groups consecutive non-null bytes into chunks with (length, target) headers.
 */
function produceLoadableSeq(serializer_memory: (number | null)[]): Buffer {
  const chunks: Buffer[] = [];
  let start = 0;

  while (start < 0x10000) {
    // Skip null bytes
    while (start < 0x10000 && serializer_memory[start] === null) start++;
    if (start >= 0x10000) break;

    // Find end of non-null run
    let end = start;
    while (end < 0x10000 && serializer_memory[end] !== null) end++;

    // Write header: [length_lo, length_hi, target_lo, target_hi]
    const len = end - start;
    const header = Buffer.alloc(4);
    header.writeUInt16LE(len, 0);
    header.writeUInt16LE(start, 2);
    chunks.push(header);

    // Write data
    const data = Buffer.alloc(len);
    for (let i = 0; i < len; i++) {
      data[i] = serializer_memory[start + i]!;
    }
    chunks.push(data);
    start = end;
  }

  // Terminator: length=0 (2 bytes, matching Python's r.extend([0, 0]))
  chunks.push(Buffer.alloc(2));

  return Buffer.concat(chunks);
}

export { compileSoundBank, produceLoadableSeq };
export type { CompiledSoundBank, MusicCompileInput };
