/* @layer renderer-lib @kind logic */
import type { PaletteOverride } from '@shared/game/data/player-sheet/types';

const isEmptyOverride = (override: PaletteOverride): boolean =>
  !override.gloves && Object.keys(override.outfits ?? {}).length === 0;

export { isEmptyOverride };
