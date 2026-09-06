/* @layer shared-asset-extraction @kind logic */
/**
 * The eight receipt pictures whose colours the game takes from the player's own equipment
 * instead of from the item being shown: the four blades and the three shields, plus the
 * duplicate blade id the opening scene uses.
 *
 * Why they need their own binary. Those eight are the only receipt ids drawn with sprite
 * palette row 5 (kWishPond2_OamFlags), and row 5's indices 9-15 are loaded from the
 * PLAYER's blade and shield level, and AncillaAdd_ItemReceipt reloads them for the item it is
 * granting, which is right for the hold-up ceremony and wrong for everything else. A shelf,
 * a drop or a standing pickup showing one of these draws it in whatever gear the player is
 * carrying, and three shelves offering three different blades all come out the same colour
 * because the three share one picture (gfx 0x18) and differ only by that row.
 *
 * The fix mirrors the capacity icons: each picture is extracted with its OWN correct row-5
 * variant (receipt-decoder's PAL5_CONFIG), re-quantized to one fixed row that is always
 * resident, and emitted as `gear-icons.4bpp`: 128 B per id in the decode slot's tile order,
 * 1024 B in all. The core copies those tiles over the slot after a world draw seam decoded
 * the art there and forces that draw's palette row (core/game-hooks/gear_icon.c). The
 * hold-up is left alone: it already loads the row for the item it is granting.
 *
 * The row is 4, the same row the capacity icons use, and the best fit of the four
 * candidates by mean squared error per opaque pixel (worst id 4119, mean 2066, against
 * 5778 / 5434 / 16859 worst for rows 1, 2 and 3). It is also the only main sprite row
 * whose colours are identical in both world halves, so a shelf reads the same on either
 * side of the mirror; rows 1-3 change with Palette_Load_SpriteMain's world offset, and
 * rows 0 and 5-7 are area or equipment palettes that are not resident at all.
 */
import type { ImageBuffer } from '../graphics/png-writer';
import type { RGBA } from '../graphics/palette';
import { encodeIcon, isSlotSized, quantizeIcon, shiftIndicesLeft, SLOT_BYTES } from './fixed-row-tiles';
import { kTab1 } from './receipt-tables';

const GEAR_ICONS_FILE = 'gear-icons.4bpp';

/**
 * The sprite palette row every gear picture is quantized to. Mirrored by
 * GEAR_PALETTE_ROW in core/game-hooks/gear_icon.c: change both together.
 */
const GEAR_ICON_PALETTE_ROW = 4;

/**
 * The affected receipt ids, in the order the binary holds them. Mirrored by kGearReceiptIds
 * in core/game-hooks/gear_icon.c. Derived, not guessed: every id whose kWishPond2_OamFlags
 * entry is row 5, which is exactly receipt-tables' PAL5_CONFIG, the set the extraction
 * already had to special-case for the same reason.
 */
const GEAR_RECEIPT_IDS: readonly number[] = [0, 1, 2, 3, 4, 5, 6, 73];

/** Each id's definition file name, in GEAR_RECEIPT_IDS order. */
const GEAR_ICON_FILES: readonly string[] = [
  'receipt-fighter-sword', 'receipt-master-sword', 'receipt-tempered-sword', 'receipt-golden-sword',
  'receipt-fighters-shield', 'receipt-fire-shield', 'receipt-mirror-shield', 'receipt-fighter-sword-uncle',
];

/**
 * A narrow receipt (kReceiveItem_Tab1 == 0) is two stacked 8×8 tiles, drawn from the slot's
 * LEFT column; the extracted picture centres it in a 16×16 frame, so its pixels sit four
 * columns right of where the slot wants them.
 */
const NARROW_INSET = 4;
const isNarrow = (receiptId: number): boolean => kTab1[receiptId] === 0;

/** One id's 128 B: the picture quantized to `row`, moved into the slot's own frame. */
const gearIconBytes = (picture: ImageBuffer, receiptId: number, row: readonly RGBA[]): Uint8Array => {
  const { indices } = quantizeIcon(picture, row);
  return encodeIcon(isNarrow(receiptId) ? shiftIndicesLeft(indices, NARROW_INSET) : indices);
};

/**
 * The 1024 B file from the eight pictures (by file name) and the ROM's sprite palette
 * rows; null when one is missing or not 16×16.
 */
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

export {
  buildGearIconsFile, gearIconBytes, GEAR_ICON_FILES, GEAR_ICON_PALETTE_ROW, GEAR_ICONS_FILE, GEAR_RECEIPT_IDS,
};
