/* @layer shared-asset-extraction @kind logic */
import { MAIN_TILE_THEME } from '../../sources/gba-alttp/blockset-identity';
import { EXTRA_DUNGEON_PALACE } from '../second-cartridge-map';
import type { EntranceArrays } from './second-cartridge-links.type';
import {
  BASE_ENTRANCE_COUNT, CAMERA_THRESHOLD_X, CAMERA_THRESHOLD_Y, ENTRY_STANDING_IN_DOORWAY, EXTRA_DUNGEON_MUSIC,
  EXTRA_DUNGEON_ROOM, PLAYER_OFFSET_X, PLAYER_OFFSET_Y, PLAYER_QUADRANT, QUADRANT_FULLSIZE_BOTH, ROOMS_PER_GRID_ROW,
  ROOM_SPAN, SCROLL_OFFSET_X, SCROLL_OFFSET_Y,
} from './second-cartridge-links.constants';

const appendExtraEntrance = (a: EntranceArrays): void => {
  if (a.rooms.length !== BASE_ENTRANCE_COUNT) {
    throw new Error(`Expected ${BASE_ENTRANCE_COUNT} base entrance records, found ${a.rooms.length}`);
  }
  const row = Math.floor(EXTRA_DUNGEON_ROOM / ROOMS_PER_GRID_ROW);
  const column = EXTRA_DUNGEON_ROOM % ROOMS_PER_GRID_ROW;
  const originX = column * ROOM_SPAN;
  const originY = row * ROOM_SPAN;

  a.rooms.push(EXTRA_DUNGEON_ROOM);
  a.scrollX.push(originX + SCROLL_OFFSET_X);
  a.scrollY.push(originY + SCROLL_OFFSET_Y);
  a.playerX.push(originX + PLAYER_OFFSET_X);
  a.playerY.push(originY + PLAYER_OFFSET_Y);
  a.cameraX.push(CAMERA_THRESHOLD_X);
  a.cameraY.push(CAMERA_THRESHOLD_Y);
  a.blockset.push(MAIN_TILE_THEME);
  a.floor.push(0);
  a.palace.push(EXTRA_DUNGEON_PALACE);
  a.doorway.push(ENTRY_STANDING_IN_DOORWAY);
  a.startBg.push(0);
  a.quad1.push(QUADRANT_FULLSIZE_BOTH);
  a.quad2.push(PLAYER_QUADRANT);
  a.doorSettings.push(0);
  a.music.push(EXTRA_DUNGEON_MUSIC);
  const halfRoomsY = row * 2;
  const halfRoomsX = column * 2;
  a.relCoords.push(
    halfRoomsY + 1, halfRoomsY, halfRoomsY + 1, halfRoomsY + 1,
    halfRoomsX, halfRoomsX, halfRoomsX, halfRoomsX + 1,
  );
};

export { appendExtraEntrance };
