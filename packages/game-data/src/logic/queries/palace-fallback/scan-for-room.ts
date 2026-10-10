/* @layer shared-game @kind logic */
import type { ScreenRecord } from '../../../data';
import type { PalaceMismatch, RoomScanHit } from './palace-fallback.type';
import { seenMismatches } from './seen-mismatches';

const keyOf = (mismatch: { actual: number; room: number }): string => `${mismatch.actual}:${mismatch.room}`;

const recordMismatch = (mismatch: PalaceMismatch): void => {
  const key = keyOf(mismatch);
  if (!seenMismatches.has(key)) seenMismatches.set(key, mismatch);
};

const scanForRoom = (byDungeonRoom: Map<string, ScreenRecord>, room: number, actualPalace: number): RoomScanHit | null => {
  for (const [key, screen] of byDungeonRoom) {
    if (!key.endsWith(`:${room}`)) continue;
    const expected = parseInt(key.slice(0, key.indexOf(':')), 10);
    recordMismatch({ expected, actual: actualPalace, room, screenId: screen.id });
    return { screen, expected };
  }
  return null;
};

export { scanForRoom };
