/* @layer shared-game @kind data */
import type { SpriteDefinition } from './manifest';

const DIALOG_SPRITE_DEFINITIONS: readonly SpriteDefinition[] = [
  {
    file: 'dialog-border-corner',
    label: 'Message Box Corner',
    category: 'hud',
    extract: { method: 'hud-single', tiles: [0x28f3] },
  },
  {
    file: 'dialog-border-hedge',
    label: 'Message Box H-Edge',
    category: 'hud',
    extract: { method: 'hud-single', tiles: [0x28f4] },
  },
  {
    file: 'dialog-border-vedge',
    label: 'Message Box V-Edge',
    category: 'hud',
    extract: { method: 'hud-single', tiles: [0x28c8] },
  },
];

export { DIALOG_SPRITE_DEFINITIONS };
