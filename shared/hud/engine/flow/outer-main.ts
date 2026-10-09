/* @layer shared-hud @kind logic */
import { mainOf } from './main-of';
import type { FlowItem, Insets } from './flow.type';

const mainMargin = (m: Insets, row: boolean): number => (row ? m.left + m.right : m.top + m.bottom);

const outerMain = (item: FlowItem, row: boolean): number =>
  mainOf(item.size, row) + mainMargin(item.margin, row);

export { outerMain };
