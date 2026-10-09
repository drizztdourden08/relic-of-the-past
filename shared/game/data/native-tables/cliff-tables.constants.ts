/* @layer shared-game @kind constants */
import type { CliffDir } from '../types/native-tables';
import { NO_ATTRS } from './native-table-fallbacks.constants';
import { pickNativeTable } from './pick-native-table';

const byteSet = (name: string): ReadonlySet<number> => new Set(pickNativeTable<readonly number[]>(name, NO_ATTRS));

const CLIFF_TRIGGERS = byteSet('CLIFF_TRIGGER_BYTES');
const CLIFF_DIRS_INDOOR = pickNativeTable<Record<number, CliffDir>>('CLIFF_DIRS_INDOOR', {});
const CLIFF_DIRS_OUTDOOR = pickNativeTable<Record<number, CliffDir>>('CLIFF_DIRS_OUTDOOR', {});
const CLIFF_WALL_INDOOR = byteSet('CLIFF_WALL_INDOOR_BYTES');
const CLIFF_WALL_OUTDOOR = byteSet('CLIFF_WALL_OUTDOOR_BYTES');
const DIAG_EDGE_ATTRS = byteSet('DIAG_EDGE_BYTES');
const CLIFF_BORDER_ATTRS = byteSet('CLIFF_BORDER_BYTES');
const VERTICAL_CLIFF_DIRS = pickNativeTable<Record<number, -1 | 1>>('VERTICAL_CLIFF_DIRS', {});
const HORIZ_LEDGE_ATTRS = byteSet('HORIZ_LEDGE_BYTES');
const VERT_LEDGE_ATTRS = byteSet('VERT_LEDGE_BYTES');
const DRAW_DOTS_LEDGE_ATTRS = byteSet('DRAW_DOTS_LEDGE_BYTES');

export {
  CLIFF_BORDER_ATTRS, CLIFF_DIRS_INDOOR, CLIFF_DIRS_OUTDOOR, CLIFF_TRIGGERS, CLIFF_WALL_INDOOR, CLIFF_WALL_OUTDOOR,
  DIAG_EDGE_ATTRS, DRAW_DOTS_LEDGE_ATTRS, HORIZ_LEDGE_ATTRS, VERT_LEDGE_ATTRS, VERTICAL_CLIFF_DIRS,
};
