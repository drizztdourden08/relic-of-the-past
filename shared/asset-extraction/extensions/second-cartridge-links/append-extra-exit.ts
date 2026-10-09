/* @layer shared-asset-extraction @kind logic */
import type { ExitArrays } from './second-cartridge-links.type';
import { EXTRA_DUNGEON_ROOM, PIXEL_DELTA, POS_DELTA, PYRAMID_ROOM } from './second-cartridge-links.constants';

const appendExtraExit = (a: ExitArrays): void => {
  const source = a.rooms.indexOf(PYRAMID_ROOM);
  if (source < 0) throw new Error(`No exit record for room 0x${PYRAMID_ROOM.toString(16)} to clone`);

  a.screen.push(a.screen[source]);
  a.rooms.push(EXTRA_DUNGEON_ROOM);
  a.loadOff.push(a.loadOff[source] + POS_DELTA);
  a.scrollX.push(a.scrollX[source] + PIXEL_DELTA);
  a.scrollY.push(a.scrollY[source]);
  a.x.push(a.x[source] + PIXEL_DELTA);
  a.y.push(a.y[source]);
  a.camX.push(a.camX[source] + PIXEL_DELTA);
  a.camY.push(a.camY[source]);
  a.nDoor.push(a.nDoor[source]);
  a.fDoor.push(a.fDoor[source]);
  a.unk1.push(a.unk1[source]);
  a.unk3.push(a.unk3[source]);
};

export { appendExtraExit };
