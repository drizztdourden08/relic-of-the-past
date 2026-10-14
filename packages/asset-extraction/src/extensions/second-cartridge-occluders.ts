/* @layer shared-asset-extraction @kind logic */
import type { DungeonEntityRecord, DungeonRoomRecord } from '../dungeon/model';
import { HEAD_COLS, HEAD_ROWS, MAP_COLS, OCCLUDER_ENTITY_TYPES } from './second-cartridge-occluders.constants';

const addEntityCells = (cells: Set<number>, entity: DungeonEntityRecord): void => {
  const col = entity.x >> 3;
  const baseRow = (entity.y >> 3) - HEAD_ROWS;
  for (let dy = 0; dy < HEAD_ROWS; dy++) {
    for (let dx = 0; dx < HEAD_COLS; dx++) {
      const row = baseRow + dy;
      if (row >= 0 && row < MAP_COLS && col + dx < MAP_COLS) cells.add(row * MAP_COLS + col + dx);
    }
  }
};

const occluderCells = (room: DungeonRoomRecord): Set<number> => {
  const cells = new Set<number>();
  for (const entity of room.entities) {
    if (OCCLUDER_ENTITY_TYPES.has(entity.type)) addEntityCells(cells, entity);
  }
  return cells;
};

export { occluderCells };
