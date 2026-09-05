/* @layer shared-asset-extraction @kind logic */
/**
 * Decoder for the scrolling end-credits roll.
 *
 * Format. `kEnding_Credits_Offs` (SNES 0x8EB93D, 394 words) gives, for every one
 * of the 394 scroll rows, a byte offset into `kEnding_Credits_Text` (0x8EB178,
 * 1989 bytes). A row is either the single byte 0xFF (nothing on this row) or the
 * record `[start column][byte count][character indexes...]`. The count is a DMA
 * byte count, not a character count: the renderer uploads one 16-bit tile per
 * character, so a row holds `(count + 1) >> 1` characters. Records are packed
 * back to back and several rows share the same offset, so the offset table is
 * the only reliable way in.
 *
 * Large characters. A large 8x16 character occupies two scroll rows, with the upper
 * halves on one row and the lower halves on the next. A row made up purely of upper
 * halves is dropped and the following row is emitted instead, because the lower
 * row is the one that carries the whole line: on the play-count rows it also
 * carries a small-font prefix that never appears on the upper row.
 *
 * Limits. The renderer walks a 32x32 tilemap: it advances by 0x20 words per row
 * and wraps every 0x400, so one row is 32 tiles wide, and a line is centred by
 * its own start column, so the whole row is available. The exception is the
 * play-count table at the end, where the renderer writes three digits at column
 * 0x19 of the same row; those lines get 25 tiles. Both numbers come from the
 * renderer, nothing here is estimated.
 */
import type { RomData } from '../../rom/rom-types';
import type { DecodedLine } from './types';
import { endingCharAt, isBlank, isLargeTop } from './charset';

const TEXT_ADDR = 0x8eb178;
const TEXT_SIZE = 1989;
const OFFSETS_ADDR = 0x8eb93d;
const ROW_COUNT = 394;

/** A row that draws nothing at all. */
const EMPTY_ROW = 0xff;

/** Width of one tilemap row, and the column the play counter starts at. */
const ROW_TILES = 32;
const COUNTER_COLUMN = 0x19;

/**
 * Scroll positions at which the renderer also draws a play counter, straight
 * from its own table. Halving gives the row index; the row after each one is
 * part of the same two-row band and gets a counter too.
 */
const COUNTER_SCROLL_Y = [
  0x290, 0x298, 0x2a0, 0x2a8, 0x2b0, 0x2ba, 0x2c2,
  0x2ca, 0x2d2, 0x2da, 0x2e2, 0x2ea, 0x2f2, 0x310,
];

const buildCounterRows = (): Set<number> => {
  const rows = new Set<number>();
  for (const scrollY of COUNTER_SCROLL_Y) {
    rows.add(scrollY >> 1);
    rows.add((scrollY >> 1) + 1);
  }
  return rows;
};

const readRow = (text: Buffer, offset: number): number[] | null => {
  if (text[offset] === EMPTY_ROW) return null;
  const count = (text[offset + 1] + 1) >> 1;
  return Array.from(text.subarray(offset + 2, offset + 2 + count));
};

/** A row holding only upper halves is the top of a two-row large-font line. */
const isUpperHalfRow = (chars: number[]): boolean =>
  chars.some(isLargeTop) && chars.every((c) => isLargeTop(c) || isBlank(c));

const decodeCredits = (rom: RomData): DecodedLine[] => {
  const text = rom.getBytes(TEXT_ADDR, TEXT_SIZE);
  const offsets = rom.getWords(OFFSETS_ADDR, ROW_COUNT);
  const counterRows = buildCounterRows();
  const lines: DecodedLine[] = [];
  let upperHalfRow: number | null = null;

  for (let row = 0; row < ROW_COUNT; row++) {
    const chars = readRow(text, offsets[row]);
    if (!chars) {
      upperHalfRow = null;
      continue;
    }
    if (isUpperHalfRow(chars)) {
      upperHalfRow = row;
      continue;
    }

    const first = upperHalfRow === row - 1 ? upperHalfRow : row;
    upperHalfRow = null;
    const hasCounter = counterRows.has(first) || counterRows.has(row);
    lines.push({
      key: `credits.row-${String(first).padStart(3, '0')}`,
      text: chars.map(endingCharAt).join(''),
      limit: { kind: 'tiles', max: hasCounter ? COUNTER_COLUMN : ROW_TILES },
    });
  }

  return lines;
};

export { decodeCredits };
