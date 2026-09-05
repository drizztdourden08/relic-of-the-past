/* @layer shared-game @kind data */
/**
 * The sprite extraction definitions, or an empty list without them.
 *
 * `definitions.json` pairs each sprite's label with the ROM tile offsets it is
 * cut from, so it is game-derived twice over and lives in the private companion
 * repo. Without it there is nothing to extract and nothing to name: sprite
 * extraction finds no definitions and the sprite views list nothing, which is the
 * same state as a user who has not supplied a ROM.
 *
 * The schema beside this file stays here, because it describes the shape, which is ours.
 */

type SpriteCategory = 'hud' | 'hud-pause' | 'hud-item' | 'fonts' | 'receipt' | 'drop';

interface SpriteManifestEntry {
  /** Filename without extension (e.g. "hud-bow"). */
  file: string;
  /** Human-readable label (e.g. "Bow"). */
  label: string;
  /** Category for grouping. */
  category: SpriteCategory;
}

/** One definition as authored, including the extraction recipe consumers read. */
interface SpriteDefinition extends SpriteManifestEntry {
  extract: unknown;
}

// A glob instead of an import: the file is not in this repository, and a static
// import of an absent path fails the build instead of yielding nothing.
const modules = import.meta.glob<{ default: { sprites?: SpriteDefinition[] } }>(
  '../records/sprite-manifest/definitions.json',
  { eager: true },
);

const SPRITE_DEFINITIONS: readonly SpriteDefinition[] =
  Object.values(modules)[0]?.default?.sprites ?? [];

const SPRITE_MANIFEST: SpriteManifestEntry[] = SPRITE_DEFINITIONS.map(sprite => ({
  file: sprite.file,
  label: sprite.label,
  category: sprite.category as SpriteCategory,
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

export { CATEGORY_LABELS, CATEGORY_ORDER, SPRITE_DEFINITIONS, SPRITE_MANIFEST };
export type { SpriteCategory, SpriteDefinition, SpriteManifestEntry };
