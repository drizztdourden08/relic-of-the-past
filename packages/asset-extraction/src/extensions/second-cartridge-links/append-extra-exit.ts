/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../../checked-read';
import type { ExitArrays } from './second-cartridge-links.type';
import { EXTRA_DUNGEON_ROOM, PIXEL_DELTA, POS_DELTA, PYRAMID_ROOM } from './second-cartridge-links.constants';

const appendExtraExit = (a: ExitArrays): void => {
  const source = a.rooms.indexOf(PYRAMID_ROOM);
  if (source < 0) throw new Error(`No exit record for room 0x${PYRAMID_ROOM.toString(16)} to clone`);
  const at = (column: number[]): number => itemAt(column, source, 'exit record to clone');

  a.screen.push(at(a.screen));
  a.rooms.push(EXTRA_DUNGEON_ROOM);
  a.loadOff.push(at(a.loadOff) + POS_DELTA);
  a.scrollX.push(at(a.scrollX) + PIXEL_DELTA);
  a.scrollY.push(at(a.scrollY));
  a.x.push(at(a.x) + PIXEL_DELTA);
  a.y.push(at(a.y));
  a.camX.push(at(a.camX) + PIXEL_DELTA);
  a.camY.push(at(a.camY));
  a.nDoor.push(at(a.nDoor));
  a.fDoor.push(at(a.fDoor));
  a.unk1.push(at(a.unk1));
  a.unk3.push(at(a.unk3));
};

export { appendExtraExit };
