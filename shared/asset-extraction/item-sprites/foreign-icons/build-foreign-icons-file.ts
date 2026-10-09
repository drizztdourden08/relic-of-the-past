/* @layer shared-asset-extraction @kind logic */
import { encodeIcon, isSlotSized, SLOT_BYTES } from '../fixed-row-tiles';
import { buildForeignIconPalette } from '../foreign-icon-palette';
import { quantizeIconPerceptual } from '../perceptual-quantize';
import { FOREIGN_ICON_FILES, FOREIGN_ICON_PALETTE_BYTES } from './foreign-icons.constants';
import type { ImageBuffer } from '../../graphics/png-writer';

const buildForeignIconsFile = (pictures: ReadonlyMap<string, ImageBuffer>): Uint8Array | null => {
  const ordered = FOREIGN_ICON_FILES.map((file) => pictures.get(file));
  if (!ordered.every((picture): picture is ImageBuffer => picture !== undefined && isSlotSized(picture))) return null;
  const palette = buildForeignIconPalette(ordered);
  const out = new Uint8Array(SLOT_BYTES * ordered.length + FOREIGN_ICON_PALETTE_BYTES);
  ordered.forEach((picture, index) => {
    out.set(encodeIcon(quantizeIconPerceptual(picture, palette.row).indices), index * SLOT_BYTES);
  });
  const view = new DataView(out.buffer);
  palette.words.forEach((word, at) => view.setUint16(SLOT_BYTES * ordered.length + at * 2, word, true));
  return out;
};

export { buildForeignIconsFile };
