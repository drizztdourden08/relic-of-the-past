/* @layer shared-asset-extraction @kind logic */
/**
 * Decoder for the captions on the sixteen closing scenes.
 *
 * Format. `kEnding0_Offs` (SNES 0x8EC2E1, 17 words) brackets each scene's slice
 * of `kEnding0_Data` (0x8EBF4C, 917 bytes). A slice is a run of records shaped
 * `[vram address word][control word][character indexes...]`, where the number of
 * characters is `((control >> 9) & 0x7f) + 1`. Records use the same 160-entry
 * character set as the credits roll.
 *
 * Roles. Each scene carries a caption in the small 8x8 font and a place name in the large 8x16
 * font. The large one costs two records (upper halves, then lower halves, at two tilemap
 * addresses), so the upper record is dropped and the lower one is emitted as `location`.
 * Small-font records are emitted as `title`. Extra records of a role are suffixed `-2`, `-3`;
 * only scene 2 does this, opening with a stray one-character record before its caption.
 *
 * Limits. Every record writes horizontally into a 32x32 tilemap, so every caption gets a
 * 32-tile row positioned by its start column. The record's own length is not a ceiling, since
 * the offset table lets a record be repacked to any size.
 */
import type { RomData } from '../../rom/rom-types';
import type { DecodedLine } from './types';
import { endingCharAt, isBlank, isLargeBottom, isLargeTop } from './charset';

const OFFSETS_ADDR = 0x8ec2e1;
const DATA_ADDR = 0x8ebf4c;
const DATA_SIZE = 917;
const SCENE_COUNT = 16;

/** Header size in bytes: one address word plus one control word. */
const RECORD_HEADER = 4;

/** Width of one tilemap row. */
const ROW_TILES = 32;

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
