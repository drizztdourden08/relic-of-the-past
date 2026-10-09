/* @layer shared-asset-extraction @kind logic */
import { encodeIcon, isSlotSized, quantizeIcon } from '../fixed-row-tiles';
import { QUIVER_ICON_PALETTE_ROW, QUIVER_ICON_SPRITE } from './quiver-icon.constants';
import type { ImageBuffer } from '../../graphics/png-writer';
import type { RGBA } from '../../graphics/palette';

const buildQuiverIconFile = (
  pictures: ReadonlyMap<string, ImageBuffer>, paletteRows: readonly (readonly RGBA[])[],
): Uint8Array | null => {
  const picture = pictures.get(QUIVER_ICON_SPRITE);
  if (!picture || !isSlotSized(picture)) return null;
  return encodeIcon(quantizeIcon(picture, paletteRows[QUIVER_ICON_PALETTE_ROW]).indices);
};

export { buildQuiverIconFile };
