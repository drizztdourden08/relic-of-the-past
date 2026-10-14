/* @layer renderer-widgets @kind logic */
import type { ScreenCrossing } from '@rotp/game-core';

const crossingTilesLabel = (span: ScreenCrossing['span']): string =>
  (span === undefined ? '' : `${span.freeTiles}${span.itemTiles > 0 ? `+${span.itemTiles}` : ''}`);

export { crossingTilesLabel };
