/* @layer shared-game @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import { DIALOG_SPRITE_DEFINITIONS } from '../dialog-sprites';
import { POOL_SPRITE_DEFINITIONS } from '../pool-sprites';
import { RANDOMIZER_SPRITE_DEFINITIONS } from '../randomizer-sprites';
import { RUPEE_SPRITE_DEFINITIONS } from '../rupee-sprites';
import { TITLE_SPRITE_DEFINITIONS } from '../title-sprites';
import { UPGRADE_SPRITE_DEFINITIONS } from '../upgrade-sprites';
import { GROUND_TILE_SPRITE_DEFINITIONS } from '../ground-tiles';
import { HUD_WALLET_SPRITE_DEFINITIONS } from '../hud-wallet';
import { boxForExtract } from '../sprite-box';
import { spriteNameOf } from './sprite-name-of';
import type { SpriteBox } from '../sprite-box';
import type { SpriteCategory, SpriteDefinition, SpriteManifestEntry } from './manifest.type';

const modules = import.meta.glob<{ default: { sprites?: SpriteDefinition[] } }>(
  '../../../../data/sprite-manifest/definitions.json',
  { eager: true },
);

const EXTRACTED_DEFINITIONS: readonly SpriteDefinition[] =
  Object.values(modules)[0]?.default.sprites ?? [];

const SPRITE_DEFINITIONS: readonly SpriteDefinition[] =
  EXTRACTED_DEFINITIONS.length === 0 ? [] : [
    ...EXTRACTED_DEFINITIONS, ...UPGRADE_SPRITE_DEFINITIONS, ...RUPEE_SPRITE_DEFINITIONS,
    ...RANDOMIZER_SPRITE_DEFINITIONS, ...POOL_SPRITE_DEFINITIONS, ...DIALOG_SPRITE_DEFINITIONS,
    ...TITLE_SPRITE_DEFINITIONS, ...HUD_WALLET_SPRITE_DEFINITIONS, ...GROUND_TILE_SPRITE_DEFINITIONS,
  ];

const SPRITE_MANIFEST: SpriteManifestEntry[] = SPRITE_DEFINITIONS.map(sprite => ({
  file: sprite.file,
  label: spriteNameOf(sprite.file, sprite.label),
  category: sprite.category,
  box: boxForExtract(sprite.extract),
}));

const SPRITE_BOX_BY_FILE: Record<string, SpriteBox> = Object.fromEntries(
  SPRITE_MANIFEST.filter((sprite) => sprite.box).map((sprite) => [sprite.file, sprite.box as SpriteBox]),
);

const CATEGORY_LABELS: Record<SpriteCategory, Message> = {
  hud: msg('game-labels:sprite.category.hud'),
  'hud-pause': msg('game-labels:sprite.category.hudPause'),
  'hud-item': msg('game-labels:sprite.category.hudItem'),
  fonts: msg('game-labels:sprite.category.fonts'),
  receipt: msg('game-labels:sprite.category.receipt'),
  drop: msg('game-labels:sprite.category.drop'),
  randomizer: msg('game-labels:sprite.category.randomizer'),
  title: msg('game-labels:sprite.category.title'),
  ground: msg('game-labels:sprite.category.ground'),
};

const CATEGORY_ORDER: SpriteCategory[] =
  ['hud', 'hud-pause', 'hud-item', 'fonts', 'receipt', 'drop', 'randomizer', 'title', 'ground'];

export { CATEGORY_LABELS, CATEGORY_ORDER, SPRITE_BOX_BY_FILE, SPRITE_DEFINITIONS, SPRITE_MANIFEST };
