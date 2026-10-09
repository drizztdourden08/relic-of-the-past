/* @layer shared-asset-extraction @kind types */
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
