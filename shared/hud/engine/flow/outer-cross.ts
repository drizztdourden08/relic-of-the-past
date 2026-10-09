/* @layer shared-hud @kind logic */
import { crossMargin } from './cross-margin';
import { crossOf } from './cross-of';
import type { FlowItem } from './flow.type';

const outerCross = (item: FlowItem, row: boolean): number =>
  crossOf(item.size, row) + crossMargin(item.margin, row);

export { outerCross };
