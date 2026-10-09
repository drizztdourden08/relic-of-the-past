/* @layer shared-asset-extraction @kind logic */
import type { DungeonRoomRecord } from '../../dungeon/model';
import type { AttrOverlayCell } from './second-cartridge-attrs.type';
import { DEEP_WATER, TILE_NUMBER_MASK, WATER_TILE_FIRST, WATER_TILE_LAST } from './second-cartridge-attrs.constants';

const waterOverlay = (room: DungeonRoomRecord): AttrOverlayCell[] => {
  const surface = room.layers[1];
  const floor = room.layers[0];
  if (!surface || !floor) return [];
  const cells: AttrOverlayCell[] = [];
  for (let cell = 0; cell < surface.snesWords.length; cell++) {
    const tile = surface.snesWords[cell] & TILE_NUMBER_MASK;
    if (tile < WATER_TILE_FIRST || tile > WATER_TILE_LAST) continue;
    cells.push({ layer: 0, cell, attr: DEEP_WATER });
  }
  return cells;
};

export { waterOverlay };
