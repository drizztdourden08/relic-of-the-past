/* @layer shared-asset-extraction @kind logic */
/**
 * The in-game capacity upgrade icons: the four composited upgrade sprites, quantized
 * to one sprite palette row and encoded as SNES 4bpp tiles — 128 B per icon (top-left,
 * top-right, bottom-left, bottom-right tile), 512 B in all, emitted next to the PNGs
 * as `capacity-icons.4bpp`. The core copies one over the receipt decode slot and draws
 * the receipt with that row (core/game-hooks/upgrade_icon.c), so no palette is written.
 * The row is the one that fits every icon best (row 4: it holds the badge's green, the
 * jar's blue and the bomb's greys; row 2, the refill receipts' row, has no green and
 * turned the badge orange). Index 0 is transparent; every opaque pixel snaps to the
 * nearest of the row's colours.
 *
 * The quantizer and the 4bpp encoder are shared with the gear pictures (gear-icons.ts)
 * and live in fixed-row-tiles.ts — both binaries are the same idea applied to a
 * different set of pictures.
 */
import type { ImageBuffer } from '../graphics/png-writer';
import type { RGBA } from '../graphics/palette';
import { encodeIcon, isSlotSized, quantizeIcon, SLOT_BYTES } from './fixed-row-tiles';

const CAPACITY_ICONS_FILE = 'capacity-icons.4bpp';

/**
 * The hand-bumped half of the extraction version (extraction-stamp.ts). Bump it
 * whenever a decoder, a composite, or this converter changes the bytes it writes
 * while the definitions and drawings stay the same, since nothing else can tell
 * an already-extracted set that it is out of date.
 *   1: presence-only sets, before any stamp was written.
 *   2: capacity icons quantized to palette row 4 (were row 2).
 *   3: the gear pictures emitted beside them (gear-icons.4bpp).
 *   4: the quiver's in-game picture emitted beside them (quiver-icon.4bpp).
 *   5: the shop price symbols emitted beside them (currency-symbols.4bpp).
 */
const EXTRACTION_FORMAT_VERSION = 5;

/**
 * The sprite palette row every icon is quantized to. Mirrored by ICON_PALETTE_ROW in
 * core/game-hooks/upgrade_icon.c, the row the core's receipt draws switch to for an
 * icon: change both together.
 */
const CAPACITY_ICON_PALETTE_ROW = 4;

/** The families' composited sprite files, in the core's order (explosives, projectiles, meter, wallet). */
const CAPACITY_ICON_FAMILIES: readonly string[] = [
  'upgrade-explosives', 'upgrade-projectiles', 'upgrade-meter', 'upgrade-wallet',
];

/**
 * The 512 B file from the four families' pictures (by file name) and the ROM's
 * sprite palette rows; null when a family's picture is missing or not 16×16.
 */
const buildCapacityIconsFile = (
  pictures: ReadonlyMap<string, ImageBuffer>, paletteRows: readonly (readonly RGBA[])[],
): Uint8Array | null => {
  const out = new Uint8Array(SLOT_BYTES * CAPACITY_ICON_FAMILIES.length);
  const row = paletteRows[CAPACITY_ICON_PALETTE_ROW];
  for (const [family, file] of CAPACITY_ICON_FAMILIES.entries()) {
    const picture = pictures.get(file);
    if (!picture || !isSlotSized(picture)) return null;
    out.set(encodeIcon(quantizeIcon(picture, row).indices), family * SLOT_BYTES);
  }
  return out;
};

export {
  buildCapacityIconsFile, CAPACITY_ICON_FAMILIES, CAPACITY_ICON_PALETTE_ROW, CAPACITY_ICONS_FILE,
  EXTRACTION_FORMAT_VERSION,
};
