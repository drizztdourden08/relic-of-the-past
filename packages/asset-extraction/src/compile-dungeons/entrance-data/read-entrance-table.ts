/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../../rom/rom-types';
import { ENTRANCE_COLUMNS, REL_COORDS_EXTRA, REL_COORDS_MAIN, REL_COORDS_PER_ENTRANCE } from './entrance-data.constants';
import type { EntranceColumn, EntranceSpec, EntranceTable } from './entrance-data.type';
import { readEntranceValue } from './read-entrance-value';

const emptyTable = (): EntranceTable => ({
  rooms: [], relCoords: [], scrollX: [], scrollY: [], playerX: [], playerY: [], cameraX: [], cameraY: [],
  blockset: [], floor: [], palace: [], doorway: [], startBg: [], quad1: [], quad2: [], doorSettings: [], music: [],
  entrance: [],
});

const columnValueAt = (rom: RomData, column: EntranceColumn, set: 0 | 1, index: number): number | undefined => {
  const address = set === 0 ? column.main : column.extra;
  if (address !== null) return readEntranceValue(rom, column.kind, address, index);
  return column.key === 'entrance' ? undefined : 0;
};

const readEntranceTable = (rom: RomData, spec: EntranceSpec): EntranceTable => {
  const { set, count } = spec;
  const table = emptyTable();
  const relBase = set === 0 ? REL_COORDS_MAIN : REL_COORDS_EXTRA;
  for (let i = 0; i < count; i++) {
    for (const column of ENTRANCE_COLUMNS) {
      const value = columnValueAt(rom, column, set, i);
      if (value !== undefined) table[column.key].push(value);
    }
    for (let j = 0; j < REL_COORDS_PER_ENTRANCE; j++) {
      table.relCoords.push(rom.getByte(relBase + i * REL_COORDS_PER_ENTRANCE + j));
    }
  }
  return table;
};

export { readEntranceTable };
