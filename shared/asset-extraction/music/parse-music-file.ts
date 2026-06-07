/* @layer shared-asset-extraction @kind logic */
/**
 * Music file parser — parses extracted text back into compilable entity structures.
 */
import type {
  CompiledPattern,
  CompiledPhrase,
  CompiledSfxList,
  CompiledSfxPattern,
  CompiledSong,
  CompiledSongList,
  Entity,
} from './compile-types';
import { kEffectNamesDict, kKeysDict } from './compile-types';
import type { NameRegistry } from './name-registry';

const parseFile = (text: string, registry: NameRegistry): Entity[] => {
  const sortedEnts: Entity[] = [];
  let heading: string | null = null;
  let collect: string[] = [];

  const addCollect = (h: string, c: string[]): void => {
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
      };

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
};

const processSong = (caption: string, lines: string[], registry: NameRegistry): Entity => {
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
};

const processSongList = (caption: string, lines: string[], registry: NameRegistry): Entity => {
  const songList = registry.getOrCreate<CompiledSongList>(caption, 'SongList', true)!;
  songList.songs = lines.map(l => registry.getOrCreate<CompiledSong>(l, 'Song', false));
  return songList as unknown as Entity;
};

const processPhrase = (caption: string, lines: string[], registry: NameRegistry): Entity => {
  const phrase = registry.getOrCreate<CompiledPhrase>(caption, 'Phrase', true)!;
  phrase.patterns = lines.map(l => registry.getOrCreate<CompiledPattern>(l, 'Pattern', false));
  return phrase as unknown as Entity;
};

const processPattern = (caption: string, lines: string[], registry: NameRegistry): Entity => {
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
};

const processSfxPattern = (caption: string, lines: string[], registry: NameRegistry): Entity => {
  const pattern = registry.getOrCreate<CompiledSfxPattern>(caption, 'SfxPattern', true)!;
  pattern.lines = lines;
  return pattern as unknown as Entity;
};

const processSfxList = (caption: string, lines: string[], registry: NameRegistry): Entity => {
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
};

export { parseFile };
