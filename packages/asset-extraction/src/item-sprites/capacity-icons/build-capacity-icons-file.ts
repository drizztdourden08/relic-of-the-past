/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../../checked-read';
import { encodeIcon, isSlotSized, quantizeIcon, SLOT_BYTES } from '../fixed-row-tiles';
import { CAPACITY_ICON_FAMILIES, CAPACITY_ICON_PALETTE_ROW } from './capacity-icons.constants';
import type { ImageBuffer } from '../../graphics/png-writer';
import type { RGBA } from '../../graphics/palette';

const buildCapacityIconsFile = (
  pictures: ReadonlyMap<string, ImageBuffer>, paletteRows: readonly (readonly RGBA[])[],
): Uint8Array | null => {
  const out = new Uint8Array(SLOT_BYTES * CAPACITY_ICON_FAMILIES.length);
  for (const [family, file] of CAPACITY_ICON_FAMILIES.entries()) {
    const picture = pictures.get(file);
    if (!picture || !isSlotSized(picture)) return null;
    out.set(encodeIcon(quantizeIcon(picture, itemAt(paletteRows, CAPACITY_ICON_PALETTE_ROW, 'Icon palette row')).indices), family * SLOT_BYTES);
  }
  return out;
};

export { buildCapacityIconsFile };
