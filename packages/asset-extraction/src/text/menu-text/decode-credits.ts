/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../../rom/rom-types';
import type { DecodedLine } from './menu-text.type';
import { endingCharAt, isBlank, isLargeTop } from './charset';
import {
  COUNTER_COLUMN, COUNTER_SCROLL_Y, EMPTY_ROW, OFFSETS_ADDR, ROW_COUNT, ROW_TILES, TEXT_ADDR, TEXT_SIZE,
} from './decode-credits.constants';

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
