/* @layer shared-game @kind logic */
/** Reverse gameId -> ScreenRecord lookups, pre-built once per rebuild(). */
import type { ScreenGameId, ScreenRecord } from '../types';

const screenByRoom = new Map<string, ScreenRecord>();
const screenByOverworld = new Map<number, ScreenRecord>();

const rebuildScreenIndex = (records: readonly ScreenRecord[]): void => {
  screenByRoom.clear();
  screenByOverworld.clear();
  for (const screen of records) {
    const { roomIndex, palaceIndex, overworldIndex } = screen.gameId;
    if (roomIndex !== undefined) screenByRoom.set(`${roomIndex}:${palaceIndex ?? ''}`, screen);
    if (overworldIndex !== undefined) screenByOverworld.set(overworldIndex, screen);
  }
};

const screenByGameId = (match: Partial<ScreenGameId>): ScreenRecord | undefined => {
  if (match.roomIndex !== undefined) return screenByRoom.get(`${match.roomIndex}:${match.palaceIndex ?? ''}`);
  if (match.overworldIndex !== undefined) return screenByOverworld.get(match.overworldIndex);
  return undefined;
};

export { rebuildScreenIndex, screenByGameId };
