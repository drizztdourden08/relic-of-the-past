/* @layer shared-asset-extraction @kind logic */
import type { MusicEntity, Pattern, Phrase, Song, SongList } from './extract-types.type';

const createMusicEntity = <T extends MusicEntity>(ea: number, type: T['type']): T => {
  const entity = { type, ea, name: `${type}_0x${ea.toString(16)}`, isImported: false } as unknown as T;
  if (type === 'Song') (entity as unknown as Song).index = 0;
  if (type === 'Song') (entity as unknown as Song).phrases = [];
  if (type === 'Phrase') (entity as unknown as Phrase).patterns = [];
  if (type === 'Pattern') (entity as unknown as Pattern).lines = [];
  if (type === 'SongList') (entity as unknown as SongList).songs = [];
  return entity;
};

export { createMusicEntity };
