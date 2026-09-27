/* @layer shared-asset-extraction @kind logic */
/**
 * The multiworld pool icons as the core draws them over the hold-up of another player's
 * item: every pool picture (the ones the sprite gallery shows, badge and all) quantized to
 * the icons' own 15-colour palette and encoded as the decode slot's four 4bpp tiles, 128 B
 * each, in FOREIGN_ICON_FILES order, then the palette itself: 16 little-endian SNES words,
 * the first one 0 (transparent). Emitted beside the PNGs as `foreign-icons.4bpp`. The core
 * shows picture n for the foreign icon id 0xB0 + n (core/game-hooks/foreign_icon.c), so the
 * order here IS the id table: append, never reorder.
 *
 * The palette is picked from the icons' pixels (foreign-icon-palette.ts) and the core
 * resolves the icon's pixels against it in a private bank of its own, so no sprite row of
 * the game has to fit art drawn for other games. Every opaque pixel snaps by how it looks:
 * a grey to one of the greys, a hue to the nearest hue (perceptual-quantize.ts).
 */
import type { ImageBuffer } from '../graphics/png-writer';
import { encodeIcon, isSlotSized, SLOT_BYTES } from './fixed-row-tiles';
import { buildForeignIconPalette } from './foreign-icon-palette';
import { quantizeIconPerceptual } from './perceptual-quantize';

const FOREIGN_ICONS_FILE = 'foreign-icons.4bpp';

/** The palette block after the pictures: 16 SNES words. */
const FOREIGN_ICON_PALETTE_BYTES = 32;

/**
 * The sprite palette row the icon's OAM entry names. The colours come from the private bank,
 * so the row only decides colour math (rows 4-7 take it, as every receipt does). Mirrored by
 * FOREIGN_ICON_PALETTE_ROW in core/game-hooks/foreign_icon.c: change both together.
 */
const FOREIGN_ICON_PALETTE_ROW = 4;

/** The pool pictures by definition file name, in picture order (picture n = id 0xB0 + n). */
const FOREIGN_ICON_FILES: readonly string[] = [
  'pool-archipelago', 'pool-zelda-1', 'pool-zelda-2', 'pool-links-awakening', 'pool-ocarina-of-time',
  'pool-majoras-mask', 'pool-oracle-of-ages', 'pool-oracle-of-seasons', 'pool-minish-cap',
  'pool-wind-waker', 'pool-twilight-princess', 'pool-skyward-sword', 'pool-a-link-between-worlds',
];

/** The file from the pool pictures (by file name); null when a picture is missing or not 16x16. */
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

export {
  buildForeignIconsFile, FOREIGN_ICON_FILES, FOREIGN_ICON_PALETTE_BYTES, FOREIGN_ICON_PALETTE_ROW, FOREIGN_ICONS_FILE,
};
