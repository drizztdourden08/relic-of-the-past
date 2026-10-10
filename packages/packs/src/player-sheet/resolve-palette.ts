/* @layer renderer-lib @kind logic */
import { COLORS_PER_OUTFIT, GLOVES_INDEX } from '@rotp/game-data';
import type { PlayerSheet, Wearing } from '@rotp/game-data';
import { bgr555ToRgba } from '@rotp/game-core';
import { flattenPalette } from './flatten-palette';
import type { ResolvedRow } from './resolve-palette.type';

const resolvePalette = (sheet: PlayerSheet, wearing: Wearing): ResolvedRow => {
  const { outfit, gloves } = wearing;
  const palette = flattenPalette(sheet);
  const colors = palette.outfits[outfit];
  const row = new Uint32Array(16);
  for (let i = 0; i < COLORS_PER_OUTFIT; i++) row[i + 1] = bgr555ToRgba(colors[i] ?? 0);
  const [firstGlove, secondGlove] = palette.gloves;
  if (gloves) row[GLOVES_INDEX] = bgr555ToRgba(gloves === 1 ? firstGlove : secondGlove);
  return row;
};

export { resolvePalette };
export type { ResolvedRow } from './resolve-palette.type';
