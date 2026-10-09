/* @layer shared-game @kind logic */
import type { ScreenRecord } from '../../types';
import { screenIndexMaps } from './screen-index-maps';

const rebuildScreenIndex = (records: readonly ScreenRecord[]): void => {
  screenIndexMaps.byRoom.clear();
  screenIndexMaps.byOverworld.clear();
  for (const screen of records) {
    const { roomIndex, palaceIndex, overworldIndex } = screen.gameId;
    if (roomIndex !== undefined) screenIndexMaps.byRoom.set(`${roomIndex}:${palaceIndex ?? ''}`, screen);
    if (overworldIndex !== undefined) screenIndexMaps.byOverworld.set(overworldIndex, screen);
  }
};

export { rebuildScreenIndex };
