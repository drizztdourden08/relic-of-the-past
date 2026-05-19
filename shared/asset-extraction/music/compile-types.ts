/**
 * Types, constants, and helpers for SPC music compilation.
 */

// ─── Types ───

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

// ─── Public API types ───

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

export {
  kEffectByteLength,
  kEffectNamesDict,
  kGapStartAddrs,
  kKeysDict,
};
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
  MusicCompileInput,
  PatternLine,
};
