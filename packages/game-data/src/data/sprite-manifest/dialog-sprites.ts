/* @layer shared-game @kind data */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { SpriteDefinition } from './manifest';

const DIALOG_SPRITE_DEFINITIONS: readonly SpriteDefinition[] = [
  {
    file: 'dialog-border-corner',
    label: msg('game-labels:sprite.dialogCorner'),
    category: 'hud',
    extract: { method: 'hud-single', tiles: [0x28f3] },
  },
  {
    file: 'dialog-border-hedge',
    label: msg('game-labels:sprite.dialogHEdge'),
    category: 'hud',
    extract: { method: 'hud-single', tiles: [0x28f4] },
  },
  {
    file: 'dialog-border-vedge',
    label: msg('game-labels:sprite.dialogVEdge'),
    category: 'hud',
    extract: { method: 'hud-single', tiles: [0x28c8] },
  },
];

export { DIALOG_SPRITE_DEFINITIONS };
