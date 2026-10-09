/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../../rom/rom-types';
import type { DecodedLine } from './menu-text.type';
import { endingCharAt, isBlank, isLargeBottom, isLargeTop } from './charset';
import { DATA_ADDR, DATA_SIZE, OFFSETS_ADDR, RECORD_HEADER, ROW_TILES, SCENE_COUNT } from './decode-captions.constants';

const readScene = (data: Buffer, start: number, end: number): number[][] => {
  const records: number[][] = [];
  let p = start;
  while (p < end) {
    const control = data[p + 2] | (data[p + 3] << 8);
    const count = ((control >> 9) & 0x7f) + 1;
    records.push(Array.from(data.subarray(p + RECORD_HEADER, p + RECORD_HEADER + count)));
    p += RECORD_HEADER + count;
  }
  return records;
};

const isUpperHalfRecord = (chars: number[]): boolean =>
  chars.some(isLargeTop) && chars.every((c) => isLargeTop(c) || isBlank(c));

const isLowerHalfRecord = (chars: number[]): boolean =>
  chars.some(isLargeBottom) && chars.every((c) => isLargeBottom(c) || isBlank(c));

const nextRoleSuffix = (seen: Map<string, number>, role: string): string => {
  const used = (seen.get(role) ?? 0) + 1;
  seen.set(role, used);
  return used === 1 ? role : `${role}-${used}`;
};

const decodeEndingCaptions = (rom: RomData): DecodedLine[] => {
  const offsets = rom.getWords(OFFSETS_ADDR, SCENE_COUNT + 1);
  const data = rom.getBytes(DATA_ADDR, DATA_SIZE);
  const lines: DecodedLine[] = [];

  for (let scene = 0; scene < SCENE_COUNT; scene++) {
    const seen = new Map<string, number>();
    for (const chars of readScene(data, offsets[scene], offsets[scene + 1])) {
      if (isUpperHalfRecord(chars)) continue;
      const role = nextRoleSuffix(seen, isLowerHalfRecord(chars) ? 'location' : 'title');
      lines.push({
        key: `caption.scene-${String(scene).padStart(2, '0')}.${role}`,
        text: chars.map(endingCharAt).join(''),
        limit: { kind: 'tiles', max: ROW_TILES },
      });
    }
  }

  return lines;
};

export { decodeEndingCaptions };
