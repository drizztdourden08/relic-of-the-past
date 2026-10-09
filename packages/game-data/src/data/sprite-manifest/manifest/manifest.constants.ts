/* @layer shared-game @kind constants */
import { DIALOG_SPRITE_DEFINITIONS } from '../dialog-sprites';
import { POOL_SPRITE_DEFINITIONS } from '../pool-sprites';
import { RANDOMIZER_SPRITE_DEFINITIONS } from '../randomizer-sprites';
import { RUPEE_SPRITE_DEFINITIONS } from '../rupee-sprites';
import { TITLE_SPRITE_DEFINITIONS } from '../title-sprites';
import { UPGRADE_SPRITE_DEFINITIONS } from '../upgrade-sprites';
import { GROUND_TILE_SPRITE_DEFINITIONS } from '../ground-tiles';
import { HUD_WALLET_SPRITE_DEFINITIONS } from '../hud-wallet';
import { boxForExtract } from '../sprite-box';
import type { SpriteBox } from '../sprite-box';
import type { SpriteCategory, SpriteDefinition, SpriteManifestEntry } from './manifest.type';

const modules = import.meta.glob<{ default: { sprites?: SpriteDefinition[] } }>(
  '../../records/sprite-manifest/definitions.json',
  { eager: true },
);

const EXTRACTED_DEFINITIONS: readonly SpriteDefinition[] =
  Object.values(modules)[0]?.default?.sprites ?? [];

const SPRITE_DEFINITIONS: readonly SpriteDefinition[] =
  EXTRACTED_DEFINITIONS.length === 0 ? [] : [
    ...EXTRACTED_DEFINITIONS, ...UPGRADE_SPRITE_DEFINITIONS, ...RUPEE_SPRITE_DEFINITIONS,
    ...RANDOMIZER_SPRITE_DEFINITIONS, ...POOL_SPRITE_DEFINITIONS, ...DIALOG_SPRITE_DEFINITIONS,
    ...TITLE_SPRITE_DEFINITIONS, ...HUD_WALLET_SPRITE_DEFINITIONS, ...GROUND_TILE_SPRITE_DEFINITIONS,
  ];

const SPRITE_MANIFEST: SpriteManifestEntry[] = SPRITE_DEFINITIONS.map(sprite => ({
  file: sprite.file,
  label: sprite.label,
  category: sprite.category as SpriteCategory,
  box: boxForExtract(sprite.extract),
}));

const SPRITE_BOX_BY_FILE: Record<string, SpriteBox> = Object.fromEntries(
  SPRITE_MANIFEST.filter((sprite) => sprite.box).map((sprite) => [sprite.file, sprite.box as SpriteBox]),
);

const CATEGORY_LABELS: Record<SpriteCategory, string> = {
  hud: 'HUD',
  'hud-pause': 'HUD Pause',
  'hud-item': 'HUD Item',
  fonts: 'Fonts',
  receipt: 'Receipt / Chest',
  drop: 'Droppable',
  randomizer: 'Randomizer',
  title: 'Title & Story',
  ground: 'Ground',
};

const CATEGORY_ORDER: SpriteCategory[] =
  ['hud', 'hud-pause', 'hud-item', 'fonts', 'receipt', 'drop', 'randomizer', 'title', 'ground'];

export { CATEGORY_LABELS, CATEGORY_ORDER, SPRITE_BOX_BY_FILE, SPRITE_DEFINITIONS, SPRITE_MANIFEST };
