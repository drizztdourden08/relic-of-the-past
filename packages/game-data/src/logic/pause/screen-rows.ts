/* @layer shared-game @kind logic */
import type { PauseContext, PauseScreen, RowSegment } from './pause.type';
import { GEAR_LADDER_KINDS } from './gear-tiers.constants';
import { gearTierCount } from './gear-tier-count';
import {
  ACTION_COUNT, DEFAULT_BOTTLE_CELLS, DEFAULT_ITEM_CELLS, ITEM_COLUMNS, PASSIVE_COUNT,
} from './screens.constants';

const itemScreenRows = (ctx: PauseContext): RowSegment[][] => {
  const bottles = ctx.bottles.length || DEFAULT_BOTTLE_CELLS;
  const cells = Math.max(0, (ctx.owned.length || DEFAULT_ITEM_CELLS + bottles) - bottles);
  const rows: RowSegment[][] = [];
  let placed = false;
  for (let start = 0; start < cells; start += ITEM_COLUMNS) {
    const length = Math.min(ITEM_COLUMNS, cells - start);
    const row: RowSegment[] = [{ section: 'items', start, length, column: 0 }];
    if (length < ITEM_COLUMNS) {
      row.push({ section: 'bottles', start: 0, length: bottles, column: length });
      placed = true;
    }
    rows.push(row);
  }
  if (!placed) rows.push([{ section: 'bottles', start: 0, length: bottles, column: 0 }]);
  return rows;
};

const gearScreenRows = (): RowSegment[][] => [
  ...GEAR_LADDER_KINDS.map((kind) => [{ section: kind, start: 0, length: gearTierCount(kind), column: 0 }]),
  [{ section: 'passive', start: 0, length: PASSIVE_COUNT, column: 0 }],
];

const statusScreenRows = (): RowSegment[][] =>
  [[{ section: 'actions', start: 0, length: ACTION_COUNT, column: 0 }]];

const screenRows = (screen: PauseScreen, ctx: PauseContext): RowSegment[][] => {
  if (screen === 'items') return itemScreenRows(ctx);
  if (screen === 'gear') return gearScreenRows();
  return statusScreenRows();
};

export { screenRows };
