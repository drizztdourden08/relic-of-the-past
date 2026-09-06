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
import { RANDOMIZER_SPRITE_DEFINITIONS } from './randomizer-sprites';
import { RUPEE_SPRITE_DEFINITIONS } from './rupee-sprites';
import { UPGRADE_SPRITE_DEFINITIONS } from './upgrade-sprites';

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

const VAULT_DEFINITIONS: readonly SpriteDefinition[] =
  Object.values(modules)[0]?.default?.sprites ?? [];

// Our own definitions ride on the vault set: the capacity-upgrade composites are
// stamped onto its sprites and the recoloured gems are derived from one, so
// without it they have nothing to stand on and the list stays empty, which keeps
// "no definitions" meaning exactly that. The drawn sprites need nothing from the
// ROM at all, but they ride along too: extraction only ever runs with one loaded,
// and a set that appears with the others missing would read as a broken set.
const SPRITE_DEFINITIONS: readonly SpriteDefinition[] =
  VAULT_DEFINITIONS.length === 0 ? [] : [
    ...VAULT_DEFINITIONS, ...UPGRADE_SPRITE_DEFINITIONS, ...RUPEE_SPRITE_DEFINITIONS,
    ...RANDOMIZER_SPRITE_DEFINITIONS,
  ];

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
