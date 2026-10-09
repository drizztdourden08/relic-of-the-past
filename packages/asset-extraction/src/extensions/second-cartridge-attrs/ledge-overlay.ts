/* @layer shared-asset-extraction @kind logic */
import type { DungeonRoomRecord } from '../../dungeon/model';
import type { AttrOverlayCell } from './second-cartridge-attrs.type';
import { ATTR_GRID_COLS, WALL, WATER_LADDER } from './second-cartridge-attrs.constants';
import { WATER_LEDGES, WATER_LEDGE_SIDES } from './wall-and-water-tiles.constants';

const onBothLayers = (column: number, row: number, attr: number): AttrOverlayCell[] =>
  ([0, 1] as const).map(layer => ({ layer, cell: row * ATTR_GRID_COLS + column, attr }));

const ledgeOverlay = (room: DungeonRoomRecord): AttrOverlayCell[] => [
  ...(WATER_LEDGES[room.id] ?? []).flatMap(([column, row]) => onBothLayers(column, row, WATER_LADDER)),
  ...(WATER_LEDGE_SIDES[room.id] ?? []).flatMap(([column, row]) => onBothLayers(column, row, WALL)),
];

export { ledgeOverlay };
