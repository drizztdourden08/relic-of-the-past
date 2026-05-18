import definitions from './definitions.json';

export type SpriteCategory = 'hud' | 'receipt' | 'drop';

export interface SpriteManifestEntry {
  /** Filename without extension (e.g. "hud-bow") */
  file: string;
  /** Human-readable label (e.g. "Bow") */
  label: string;
  /** Category for grouping */
  category: SpriteCategory;
}

let _spritesBase = '/sprites/items/';

export function setSpritesBase(base: string): void {
  _spritesBase = base;
}

function getSpritesBase(): string {
  return _spritesBase;
}

export function getSpritePath(file: string): string {
  return `${getSpritesBase()}${file}.png`;
}

export const SPRITE_MANIFEST: SpriteManifestEntry[] = definitions.sprites.map(s => ({
  file: s.file,
  label: s.label,
  category: s.category as SpriteCategory,
}));

export const CATEGORY_LABELS: Record<SpriteCategory, string> = {
  hud: 'HUD / UI',
  receipt: 'Receipt / Chest',
  drop: 'Droppable',
};

export const CATEGORY_ORDER: SpriteCategory[] = ['hud', 'receipt', 'drop'];
