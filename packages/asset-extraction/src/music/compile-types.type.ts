/* @layer shared-asset-extraction @kind types */
import type { NameRegistry } from './name-registry';

interface CompiledSong {
  type: 'Song';
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

type PatternLine = [string, (number | string | CompiledPattern | null)[], number | null, number | null];

type Entity = CompiledSong | CompiledPhrase | CompiledPattern |
  CompiledSfxPattern | CompiledSongList | CompiledSfxList;

interface EntityByType {
  Song: CompiledSong;
  Phrase: CompiledPhrase;
  Pattern: CompiledPattern;
  SfxPattern: CompiledSfxPattern;
  SongList: CompiledSongList;
  SfxList: CompiledSfxList;
}

type EntityType = keyof EntityByType;

type EntityFactories = { [K in EntityType]: (name: string, ea: number | null, defined: boolean) => EntityByType[K] };

interface MusicCompileInput {
  songTexts: Record<string, string>;
  sfxText: string;
  brrSamples: Buffer[];
  musicInfoYaml: string;
}

interface CompiledSoundBank {
  data: Buffer;
  memory: (number | null)[];
}

type SectionParser = (caption: string, lines: string[], registry: NameRegistry) => Entity;

interface SfxLineBytes {
  bytes: number[];
  end: boolean;
}

interface InstrumentInfo {
  sample: number;
  decay: number;
  attack: number;
  sustain_level: number;
  sustain_rate: number;
  vxgain: number;
  pitch_base: number;
}

interface SfxInstrumentInfo extends InstrumentInfo {
  voll: number;
  volr: number;
  pitch: number;
}

interface MusicInfo {
  samples: { file: string; repeat?: number }[];
  instruments: InstrumentInfo[];
  note_gate_off: number[];
  note_volume: number[];
  sfx_instruments: SfxInstrumentInfo[];
}

export type {
  CompiledPattern,
  CompiledPhrase,
  CompiledPhraseLoop,
  CompiledSfxList,
  CompiledSfxPattern,
  CompiledSong,
  CompiledSongList,
  CompiledSoundBank,
  Entity,
  EntityByType,
  EntityFactories,
  EntityType,
  InstrumentInfo,
  MusicCompileInput,
  MusicInfo,
  PatternLine,
  SectionParser,
  SfxInstrumentInfo,
  SfxLineBytes,
};
