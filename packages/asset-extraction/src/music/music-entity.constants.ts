/* @layer shared-asset-extraction @kind constants */
import type { MusicEntityFactories } from './extract-types.type';

const nameOf = (type: string, ea: number): string => `${type}_0x${ea.toString(16)}`;

const MUSIC_ENTITY_FACTORIES: MusicEntityFactories = {
  Song: (ea) => ({ type: 'Song', ea, name: nameOf('Song', ea), isImported: false, index: 0, phrases: [] }),
  SongList: (ea) => ({ type: 'SongList', ea, name: nameOf('SongList', ea), isImported: false, songs: [] }),
  Phrase: (ea) => ({ type: 'Phrase', ea, name: nameOf('Phrase', ea), isImported: false, patterns: [] }),
  Pattern: (ea) => ({ type: 'Pattern', ea, name: nameOf('Pattern', ea), isImported: false, lines: [] }),
};

export { MUSIC_ENTITY_FACTORIES };
