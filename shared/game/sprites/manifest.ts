import definitions from './definitions.json';

type SpriteCategory = 'hud' | 'receipt' | 'drop';

interface SpriteManifestEntry {
  /** Filename without extension (e.g. "hud-bow") */
  file: string;
  /** Human-readable label (e.g. "Bow") */
  label: string;
  /** Category for grouping */
  category: SpriteCategory;
}

let _spritesBase = '/sprites/items/';

function setSpritesBase(base: string): void {
  _spritesBase = base;
}

function getSpritesBase(): string {
  return _spritesBase;
}

function getSpritePath(file: string): string {
  return `${getSpritesBase()}${file}.png`;
}

const SPRITE_MANIFEST: SpriteManifestEntry[] = definitions.sprites.map(s => ({
  file: s.file,
  label: s.label,
  category: s.category as SpriteCategory,
}));

const CATEGORY_LABELS: Record<SpriteCategory, string> = {
  hud: 'HUD / UI',
  receipt: 'Receipt / Chest',
  drop: 'Droppable',
};

const CATEGORY_ORDER: SpriteCategory[] = ['hud', 'receipt', 'drop'];

export {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  SPRITE_MANIFEST,
  getSpritePath,
  setSpritesBase
};
export type { SpriteCategory, SpriteManifestEntry };
