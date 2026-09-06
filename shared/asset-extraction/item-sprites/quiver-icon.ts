/* @layer shared-asset-extraction @kind logic */
/**
 * The quiver's in-game picture. Under the retro bow the quiver is handed over as the
 * single-arrow receipt (the arrow counter is the quiver), so the game's own art for it
 * is an arrow: on the shop shelf and in the hold-up ceremony. This is the same drawing
 * that already stands as the app-side `quiver.png` (art/quiver.svg, full colour), reduced
 * to one fixed sprite palette row and encoded as the decode slot's four 4bpp tiles,
 * 128 B, emitted beside the PNGs as `quiver-icon.4bpp`. The core copies it over the slot
 * wherever that receipt's art was decoded and draws with that row
 * (core/game-hooks/retro_quiver_icon.c), the capacity-icon and gear-picture route.
 *
 * The row is 4: of the four main sprite rows it fits the drawing's browns and gold best
 * by mean squared error per opaque pixel (1705, against 1801 / 1850 / 1896 for rows 3,
 * 1 and 2), and it is the only one whose colours are identical in both world halves, so
 * a shelf reads the same on either side of the mirror. Only this in-game copy is
 * reduced; the extracted PNG keeps every colour of the drawing.
 */
import type { ImageBuffer } from '../graphics/png-writer';
import type { RGBA } from '../graphics/palette';
import { encodeIcon, isSlotSized, quantizeIcon } from './fixed-row-tiles';

const QUIVER_ICON_FILE = 'quiver-icon.4bpp';

/**
 * The sprite palette row the picture is quantized to. Mirrored by QUIVER_PALETTE_ROW in
 * core/game-hooks/retro_quiver_icon.c: change both together.
 */
const QUIVER_ICON_PALETTE_ROW = 4;

/** The definition file name of the drawing the picture is built from. */
const QUIVER_ICON_SPRITE = 'quiver';

/**
 * The 128 B file from the quiver's picture (by file name) and the ROM's sprite palette
 * rows; null when the picture is missing or not 16×16.
 */
const buildQuiverIconFile = (
  pictures: ReadonlyMap<string, ImageBuffer>, paletteRows: readonly (readonly RGBA[])[],
): Uint8Array | null => {
  const picture = pictures.get(QUIVER_ICON_SPRITE);
  if (!picture || !isSlotSized(picture)) return null;
  return encodeIcon(quantizeIcon(picture, paletteRows[QUIVER_ICON_PALETTE_ROW]).indices);
};

export { buildQuiverIconFile, QUIVER_ICON_FILE, QUIVER_ICON_PALETTE_ROW, QUIVER_ICON_SPRITE };
