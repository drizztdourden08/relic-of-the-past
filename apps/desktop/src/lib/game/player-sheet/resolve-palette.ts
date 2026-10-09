/* @layer renderer-lib @kind logic */
import { COLORS_PER_OUTFIT, GLOVES_INDEX } from '@shared/game/data/player-sheet/types';
import type { PlayerSheet, Wearing } from '@shared/game/data/player-sheet/types';
import { bgr555ToRgba } from '../snes-color';
import { flattenPalette } from './flatten-palette';
import type { ResolvedRow } from './resolve-palette.type';

const resolvePalette = (sheet: PlayerSheet, wearing: Wearing): ResolvedRow => {
  const { outfit, gloves } = wearing;
  const palette = flattenPalette(sheet);
  const colors = palette.outfits[outfit];
  const row = new Uint32Array(16);
  for (let i = 0; i < COLORS_PER_OUTFIT; i++) row[i + 1] = bgr555ToRgba(colors[i]);
  if (gloves) row[GLOVES_INDEX] = bgr555ToRgba(palette.gloves[gloves - 1]);
  return row;
};

export { resolvePalette };
export type { ResolvedRow } from './resolve-palette.type';
