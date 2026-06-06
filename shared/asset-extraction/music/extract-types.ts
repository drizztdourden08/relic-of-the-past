/* @layer shared-asset-extraction @kind logic */
/**
 * Types, constants, and helpers for SPC music extraction.
 */

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

// ─── Helpers ───

const noteToStr = (note: number): string => {
  if (note >= 72) {
    if (note === 72) return '-+-';
    if (note === 73) return '---';
    throw new Error(`Invalid note: ${note}`);
  }
  const octave = Math.floor(note / 12);
  const key = note % 12;
  return `${kKeys[key]}${octave + 1}`;
};

const toStr = (s: unknown): string => {
  if (typeof s === 'string') return s;
  if (typeof s === 'number') return String(s);
  if (s && typeof s === 'object' && 'name' in s) return (s as { name: string }).name;
  return String(s);
};

// ─── Result type ───

interface MusicExtractionResult {
  songTexts: Record<string, string>;
  sfxText: string;
  brrSamples: Buffer[];
  pcmSamples: Buffer[];
  musicInfoYaml: string;
}

export {
  kEffectByteLength,
  kEffectNames,
  kKeys,
  noteToStr,
  toStr,
};
export type {
  MusicEntity,
  MusicExtractionResult,
  Pattern,
  PatternLine,
  Phrase,
  PhraseLoop,
  Song,
  SongList,
};
