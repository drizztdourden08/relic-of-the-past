// shared/game — All game domain data, logic, and types

export * from './types';
export * from './items';
export * from './checks';
export * from './data/regions';
export * from './data/connections';
export * from './logic';
export {
  SPRITE_MANIFEST,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  getSpritePath,
  type SpriteCategory,
  type SpriteManifestEntry,
} from './sprites';
export * from './events';
export * from './seed';
