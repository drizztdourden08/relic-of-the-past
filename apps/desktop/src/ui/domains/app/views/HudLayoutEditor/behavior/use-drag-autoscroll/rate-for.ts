/* @layer renderer-components @kind logic */
import { HOT } from './use-drag-autoscroll.constants';
import type { Scrollable } from './use-drag-autoscroll.type';

const rateFor = (rect: Scrollable, y: number, max: number): number => {
  if (y < rect.top || y > rect.bottom) return 0;
  const fromTop = y - rect.top;
  const fromBottom = rect.bottom - y;
  if (fromTop < HOT) return -max * (1 - fromTop / HOT);
  if (fromBottom < HOT) return max * (1 - fromBottom / HOT);
  return 0;
};

export { rateFor };
