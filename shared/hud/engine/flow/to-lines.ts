/* @layer shared-hud @kind logic */
import { outerCross } from './outer-cross';
import { outerMain } from './outer-main';
import { EPSILON } from './flow.constants';
import type { FlowItem, FlowLine } from './flow.type';

const lineOf = (items: FlowItem[], row: boolean, mainGap: number): FlowLine => ({
  items,
  main: items.reduce((sum, item) => sum + outerMain(item, row), 0) + mainGap * Math.max(0, items.length - 1),
  cross: items.reduce((tallest, item) => Math.max(tallest, outerCross(item, row)), 0),
});

const toLines = (
  items: readonly FlowItem[],
  row: boolean,
  mainGap: number,
  wrap: boolean,
  available: number,
): FlowLine[] => {
  if (!wrap || !Number.isFinite(available)) return items.length ? [lineOf([...items], row, mainGap)] : [];
  const lines: FlowLine[] = [];
  let current: FlowItem[] = [];
  let main = 0;
  items.forEach((item) => {
    const own = outerMain(item, row);
    const next = current.length ? main + mainGap + own : own;
    if (current.length && next > available + EPSILON) {
      lines.push(lineOf(current, row, mainGap));
      current = [item];
      main = own;
      return;
    }
    current.push(item);
    main = next;
  });
  if (current.length) lines.push(lineOf(current, row, mainGap));
  return lines;
};

export { toLines };
