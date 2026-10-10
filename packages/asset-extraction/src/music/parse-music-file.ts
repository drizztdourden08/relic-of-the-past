/* @layer shared-asset-extraction @kind logic */
import type {
  CompiledPattern,
  CompiledPhrase,
  CompiledSfxList,
  CompiledSfxPattern,
  CompiledSong,
  CompiledSongList,
  Entity,
  SectionParser,
} from './compile-types.type';
import { kEffectNamesDict, kKeysDict } from './compile-lookups.constants';
import type { NameRegistry } from './name-registry';

const argAt = (args: readonly string[], index: number): string => args[index] ?? '';

const defineEntity = <T extends Entity>(registry: NameRegistry, caption: string, type: T['type']): T => {
  const entity = registry.getOrCreate<T>(caption, type, true);
  if (entity === null) throw new Error(`Section ${caption} cannot be defined`);
  return entity;
};

const processSong: SectionParser = (caption, lines, registry) => {
  const song = defineEntity<CompiledSong>(registry, caption, 'Song');
  song.phrases = [];
  for (const line of lines) {
    const [lineCmd = '', ...lineArgs] = line.split(' ');
    if (lineCmd === 'PhraseLoop') {
      const [loops, jmp] = lineArgs;
      song.phrases.push({ type: 'PhraseLoop', name: `PhraseLoop ${String(loops)} ${String(jmp)}`, loops: parseInt(loops ?? ''), jmp: parseInt(jmp ?? '') });
    } else {
      const phrase = registry.getOrCreate<CompiledPhrase>(lineCmd, 'Phrase', false);
      if (phrase === null) throw new Error(`${caption}: phrase None`);
      song.phrases.push(phrase);
    }
  }
  return song;
};

const processSongList: SectionParser = (caption, lines, registry) => {
  const songList = defineEntity<CompiledSongList>(registry, caption, 'SongList');
  songList.songs = lines.map(l => registry.getOrCreate<CompiledSong>(l, 'Song', false));
  return songList;
};

const processPhrase: SectionParser = (caption, lines, registry) => {
  const phrase = defineEntity<CompiledPhrase>(registry, caption, 'Phrase');
  phrase.patterns = lines.map(l => registry.getOrCreate<CompiledPattern>(l, 'Pattern', false));
  return phrase;
};

const pushPatternLine = (pattern: CompiledPattern, line: string, registry: NameRegistry): void => {
  const [lineCmd = '', ...lineArgs] = line.split(/\s+/);
  if (lineCmd === 'Call') {
    pattern.lines.push(['Call', [registry.getOrCreate<CompiledPattern>(argAt(lineArgs, 0), 'Pattern', false), parseInt(argAt(lineArgs, 1))], null, null]);
  } else if (lineCmd === 'Fallthrough') {
    pattern.fallthrough = true;
  } else if (kEffectNamesDict.has(lineCmd)) {
    pattern.lines.push([lineCmd, lineArgs.map(a => parseInt(a)), null, null]);
  } else if (kKeysDict.has(lineCmd)) {
    const noteLength = lineArgs[0] === '--' ? null : parseInt(argAt(lineArgs, 0));
    const volstuff = lineArgs[1] === '--' ? null : parseInt(argAt(lineArgs, 1), 16);
    pattern.lines.push([lineCmd, lineArgs, noteLength, volstuff]);
  } else {
    throw new Error(`Unknown pattern command: ${lineCmd}`);
  }
};

const processPattern: SectionParser = (caption, lines, registry) => {
  const pattern = defineEntity<CompiledPattern>(registry, caption, 'Pattern');
  pattern.lines = [];
  pattern.fallthrough = false;
  for (const line of lines) pushPatternLine(pattern, line, registry);
  return pattern;
};

const processSfxPattern: SectionParser = (caption, lines, registry) => {
  const pattern = defineEntity<CompiledSfxPattern>(registry, caption, 'SfxPattern');
  pattern.lines = lines;
  return pattern;
};

const processSfxList: SectionParser = (caption, lines, registry) => {
  const sfxList = defineEntity<CompiledSfxList>(registry, caption, 'SfxList');
  sfxList.patterns = [];
  sfxList.next = [];
  sfxList.echo = [];
  for (const line of lines) {
    const parts = line.split(',');
    sfxList.patterns.push(registry.getOrCreate<CompiledSfxPattern>(argAt(parts, 0), 'SfxPattern', false));
    sfxList.next.push(parseInt(argAt(parts, 1)));
    if (parts.length >= 3) sfxList.echo.push(parseInt(argAt(parts, 2)));
  }
  return sfxList;
};

const sectionParsers: readonly (readonly [string, SectionParser])[] = [
  ['Song_', processSong],
  ['Phrase_', processPhrase],
  ['Pattern_', processPattern],
  ['SongList_', processSongList],
  ['Sfx_', processSfxPattern],
  ['SfxPort', processSfxList],
];

const parseSection = (heading: string, lines: string[], registry: NameRegistry): Entity => {
  const caption = argAt(heading.replace(/[[\]]/g, '').split(' '), 0);
  const parser = sectionParsers.find(([prefix]) => caption.startsWith(prefix));
  if (!parser) throw new Error(`Unknown section: ${caption}`);
  return parser[1](caption, lines, registry);
};

const parseFile = (text: string, registry: NameRegistry): Entity[] => {
  const sortedEnts: Entity[] = [];
  let heading: string | null = null;
  let collect: string[] = [];

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (line === '' || line.startsWith('#')) continue;
    if (line.startsWith('[')) {
      if (heading !== null) sortedEnts.push(parseSection(heading, collect, registry));
      heading = line;
      collect = [];
    } else {
      collect.push(line);
    }
  }
  if (heading !== null) sortedEnts.push(parseSection(heading, collect, registry));

  return sortedEnts;
};

export { parseFile };
