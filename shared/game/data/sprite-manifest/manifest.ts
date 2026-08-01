/* @layer shared-game @kind data */
import definitions from './definitions.json';

type SpriteCategory = 'hud' | 'hud-pause' | 'hud-item' | 'fonts' | 'receipt' | 'drop';

interface SpriteManifestEntry {
  /** Filename without extension (e.g. "hud-bow"). */
  file: string;
  /** Human-readable label (e.g. "Bow"). */
  label: string;
  /** Category for grouping. */
  category: SpriteCategory;
}

const SPRITE_MANIFEST: SpriteManifestEntry[] = definitions.sprites.map(s => ({
  file: s.file,
  label: s.label,
  category: s.category as SpriteCategory,
}));

const CATEGORY_LABELS: Record<SpriteCategory, string> = {
  hud: 'HUD',
  'hud-pause': 'HUD Pause',
  'hud-item': 'HUD Item',
  fonts: 'Fonts',
  receipt: 'Receipt / Chest',
  drop: 'Droppable',
};

const CATEGORY_ORDER: SpriteCategory[] = ['hud', 'hud-pause', 'hud-item', 'fonts', 'receipt', 'drop'];

export { CATEGORY_LABELS, CATEGORY_ORDER, SPRITE_MANIFEST };
export type { SpriteCategory, SpriteManifestEntry };
