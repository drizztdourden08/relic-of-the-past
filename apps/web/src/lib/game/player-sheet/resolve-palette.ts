/* @layer renderer-lib @kind logic */
/**
 * Build the 16 colours the PPU would actually be holding for a given outfit and glove level.
 *
 * This mirrors PushBank in core/game-hooks/player_sprite.c: entry 0 stays transparent and
 * is never sampled, entries 1-15 come from the chosen outfit, and when gloves are equipped
 * the matching glove colour replaces one entry. Rendering a preview through the same rule
 * the core uses is what keeps the studio honest about what the game will show.
 */
import { COLORS_PER_OUTFIT, GLOVES_INDEX } from '@shared/game/data/player-sheet/types';
import type { PlayerSheet, Wearing } from '@shared/game/data/player-sheet/types';
import { bgr555ToRgba } from '../snes-color';
import { flattenPalette } from './flatten-palette';

/** Packed little-endian RGBA per palette index, ready to write into ImageData. */
type ResolvedRow = Uint32Array;

const resolvePalette = (sheet: PlayerSheet, wearing: Wearing): ResolvedRow => {
  const { outfit, gloves } = wearing;
  const palette = flattenPalette(sheet);
  const colors = palette.outfits[outfit];
  const row = new Uint32Array(16); // entry 0 left at 0 — fully transparent
  for (let i = 0; i < COLORS_PER_OUTFIT; i++) row[i + 1] = bgr555ToRgba(colors[i]);
  if (gloves) row[GLOVES_INDEX] = bgr555ToRgba(palette.gloves[gloves - 1]);
  return row;
};

export { resolvePalette };
export type { ResolvedRow };
