/* @layer bridge-wasm @kind logic */
import type { SimLocation } from '../simulation';
import { findOne } from '@rotp/game-data';
import { SYNTHETIC_OW, SYNTHETIC_ROOM } from './screen-location.constants';

const syntheticLocation = (screenId: string): SimLocation | null => {
  const room = SYNTHETIC_ROOM.exec(screenId);
  if (room) return { isIndoors: true, roomId: Number(room[1]), owScreenIndex: 0 };
  const ow = SYNTHETIC_OW.exec(screenId);
  if (ow) return { isIndoors: false, roomId: 0, owScreenIndex: Number(ow[1]) };
  return null;
};

const locationForScreen = (screenId: string): SimLocation | null => {
  const screen = findOne('screen', (s) => s.id === screenId);
  if (!screen) return syntheticLocation(screenId);
  const isIndoors = screen.kind !== 'overworld';
  const index = (isIndoors ? screen.gameId.roomIndex : screen.gameId.overworldIndex) ?? 0;
  return { isIndoors, roomId: isIndoors ? index : 0, owScreenIndex: isIndoors ? 0 : index };
};

export { locationForScreen };
