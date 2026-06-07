/* @layer shared-asset-extraction @kind logic */
/**
 * Formatters — produce text output from decoded music entities.
 */
import type { MusicEntity, Pattern, Phrase, Song, SongList } from './extract-types';
import { toStr } from './extract-types';

const formatPattern = (p: Pattern): string => {
  let r = `[Pattern_0x${p.ea.toString(16)}]\n`;
  for (const line of p.lines) {
    if (line.kind === 'fallthrough') {
      r += 'Fallthrough\n';
    } else if (line.kind === 'call') {
      const targetName = line.target ? line.target.name : 'None';
      r += `${line.name} ${targetName} ${line.loops}\n`;
    } else if (line.kind === 'effect') {
      r += `${line.name} ${line.args.map(toStr).join(' ')}`;
      if (line.noteLength !== null) r += ` ${line.noteLength}`;
      if (line.volstuff !== null) r += ` ${line.volstuff.toString(16)}`;
      r += '\n';
    } else {
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
};

const formatPhrase = (p: Phrase): string => {
  let s = `[Phrase_0x${p.ea.toString(16)}]\n`;
  for (const pat of p.patterns) {
    s += (pat ? pat.name : 'None') + '\n';
  }
  return s;
};

const formatSong = (s: Song): string => {
  let r = `# Song index ${s.index}\n`;
  r += `[Song_0x${s.ea.toString(16)}]\n`;
  for (const phrase of s.phrases) {
    r += phrase.name + '\n';
  }
  return r;
};

const formatSongList = (sl: SongList): string => {
  let s = `[SongList_0x${sl.ea.toString(16)}]\n`;
  for (const song of sl.songs) {
    s += (song ? song.name : 'None') + '\n';
  }
  return s;
};

const formatEntity = (e: MusicEntity): string => {
  switch (e.type) {
    case 'Song': return formatSong(e as Song);
    case 'SongList': return formatSongList(e as SongList);
    case 'Phrase': return formatPhrase(e as Phrase);
    case 'Pattern': return formatPattern(e as Pattern);
  }
};

export { formatEntity };
