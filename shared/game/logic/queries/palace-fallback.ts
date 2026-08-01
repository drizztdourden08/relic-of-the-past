/* @layer shared-game @kind logic */
/**
 * The palace-scan safety net for indoor screen detection. Moved from
 * data/screens/palace-fallback.ts — logic unchanged, ScreenDefinition →
 * ScreenRecord.
 *
 * A dungeon screen is keyed by `palaceIndex:roomIndex`, so a screen whose dataset
 * `palaceIndex` disagrees with the live `cur_palace_index_x2` misses the exact key.
 * Rather than report "unknown screen", detection falls back to matching on the room
 * number alone — which finds the right screen, because room numbers are unique
 * across dungeons.
 *
 * That is a genuine safety net and it stays. What it must NOT do is hide the
 * mislabel: every fallback hit is recorded here, so a wrong `palaceIndex` can be
 * reported instead of silently costing the exact key. `describePalaceMismatch`
 * turns one into a developer-facing line; the renderer logs it.
 */
import type { ScreenRecord } from '../../data';

interface PalaceMismatch {
  /** The palace the dataset stores for the screen that matched */
  expected: number;
  /** The palace the game actually reported */
  actual: number;
  /** The room both agree on */
  room: number;
  /** Id of the screen the scan resolved to */
  screenId: string;
}

const seen = new Map<string, PalaceMismatch>();

const keyOf = (mismatch: { actual: number; room: number }): string => `${mismatch.actual}:${mismatch.room}`;

const recordMismatch = (mismatch: PalaceMismatch): void => {
  const key = keyOf(mismatch);
  if (!seen.has(key)) seen.set(key, mismatch);
};

const hex = (n: number): string => `0x${n.toString(16).padStart(2, '0')}`;

/** A developer-facing one-liner naming the room, both palaces and the screen to fix. */
const describePalaceMismatch = ({ expected, actual, room, screenId }: PalaceMismatch): string =>
  `[screens] palace mismatch: room ${hex(room)} reports palace ${hex(actual)} but "${screenId}" is ` +
  `tagged palace ${hex(expected)} — resolved by room scan; fix that screen's dungeon.palaceIndex.`;

/**
 * Finds a dungeon screen by room number alone, ignoring the palace.
 * Returns null when no dungeon screen uses that room.
 */
const scanForRoom = (byDungeonRoom: Map<string, ScreenRecord>, room: number, actualPalace: number): { screen: ScreenRecord; expected: number } | null => {
  for (const [key, screen] of byDungeonRoom) {
    if (!key.endsWith(`:${room}`)) continue;
    const expected = parseInt(key.split(':')[0], 10);
    recordMismatch({ expected, actual: actualPalace, room, screenId: screen.id });
    return { screen, expected };
  }
  return null;
};

/** Every palace mismatch seen so far, keyed by `livePalace:room`. */
const getPalaceMismatches = (): ReadonlyMap<string, PalaceMismatch> => seen;

/** Clears the recorded mismatches — for tests that assert on a clean slate. */
const clearPalaceMismatches = (): void => { seen.clear(); };

export { scanForRoom, getPalaceMismatches, clearPalaceMismatches, describePalaceMismatch };
export type { PalaceMismatch };
