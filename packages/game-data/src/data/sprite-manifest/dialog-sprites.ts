/* @layer shared-game @kind data */
import type { SpriteDefinition } from './manifest';

const DIALOG_SPRITE_DEFINITIONS: readonly SpriteDefinition[] = [
  {
    file: 'dialog-border-corner',
    label: { key: 'game-labels:sprite.dialogCorner' },
    category: 'hud',
    extract: { method: 'hud-single', tiles: [0x28f3] },
  },
  {
    file: 'dialog-border-hedge',
    label: { key: 'game-labels:sprite.dialogHEdge' },
    category: 'hud',
    extract: { method: 'hud-single', tiles: [0x28f4] },
  },
  {
    file: 'dialog-border-vedge',
    label: { key: 'game-labels:sprite.dialogVEdge' },
    category: 'hud',
    extract: { method: 'hud-single', tiles: [0x28c8] },
  },
];

export { DIALOG_SPRITE_DEFINITIONS };
