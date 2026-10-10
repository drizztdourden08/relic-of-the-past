/* @layer shared-asset-extraction @kind types */
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

interface CommandPrefix {
  cmd: number;
  noteLength: number | null;
  volstuff: number | null;
  next: number;
}

interface DecodedPatternLine {
  line: PatternLine;
  size: number;
}

interface MusicExtractionResult {
  songTexts: Record<string, string>;
  sfxText: string;
  brrSamples: Buffer[];
  pcmSamples: Buffer[];
  musicInfoYaml: string;
}

export type {
  CommandPrefix,
  DecodedPatternLine,
  MusicEntity,
  MusicExtractionResult,
  Pattern,
  PatternLine,
  Phrase,
  PhraseLoop,
  Song,
  SongList,
};
