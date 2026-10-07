/* @layer shared-game @kind data */
/**
 * The message box frame, three tiles the engine draws the border from (kText_BorderTiles in
 * core/zelda3/src/messaging.c): a corner, a horizontal edge and a vertical edge, all on BG3
 * palette 2. The tile ids carry the palette in bits 10-12 the way every HUD tile does, so the
 * standard single-tile recipe cuts them. The other three corners and edges are flips.
 */
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
