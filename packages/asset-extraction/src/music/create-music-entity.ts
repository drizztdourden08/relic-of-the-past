/* @layer shared-asset-extraction @kind logic */
import type { MusicEntityByType, MusicEntityType } from './extract-types.type';
import { MUSIC_ENTITY_FACTORIES } from './music-entity.constants';

const createMusicEntity = <K extends MusicEntityType>(ea: number, type: K): MusicEntityByType[K] =>
  MUSIC_ENTITY_FACTORIES[type](ea);

export { createMusicEntity };
