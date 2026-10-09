/* @layer shared-asset-extraction @kind logic */
import { isSlotSized, SLOT_BYTES } from '../fixed-row-tiles';
import { gearIconBytes } from './gear-icon-bytes';
import { GEAR_ICON_FILES, GEAR_ICON_PALETTE_ROW, GEAR_RECEIPT_IDS } from './gear-icons.constants';
import type { ImageBuffer } from '../../graphics/png-writer';
import type { RGBA } from '../../graphics/palette';

const buildGearIconsFile = (
  pictures: ReadonlyMap<string, ImageBuffer>, paletteRows: readonly (readonly RGBA[])[],
): Uint8Array | null => {
  const out = new Uint8Array(SLOT_BYTES * GEAR_ICON_FILES.length);
  const row = paletteRows[GEAR_ICON_PALETTE_ROW];
  for (const [slot, file] of GEAR_ICON_FILES.entries()) {
    const picture = pictures.get(file);
    if (!picture || !isSlotSized(picture)) return null;
    out.set(gearIconBytes(picture, GEAR_RECEIPT_IDS[slot], row), slot * SLOT_BYTES);
  }
  return out;
};

export { buildGearIconsFile };
