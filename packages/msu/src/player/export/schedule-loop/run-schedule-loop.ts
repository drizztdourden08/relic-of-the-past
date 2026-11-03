/* @layer renderer-lib @kind logic */
import type { ResolvedLayer } from '../layer-window';
import { bufferAt } from '../layer-window';
import type { ScheduleOptions } from '../place-source';
import { MAX_EVENTS } from '../place-source';
import { orderPicker } from './order-picker';
import type { LoopStep } from './run-schedule-loop.type';

const runScheduleLoop = (resolved: ResolvedLayer, options: ScheduleOptions, step: LoopStep): void => {
  const advance = orderPicker(resolved, options.seed);
  let index = 0;
  let at = 0;
  for (let events = 0; events < MAX_EVENTS && at < options.windowSeconds; events += 1) {
    const advanced = step(bufferAt(resolved, index), at, events === 0);
    if (advanced <= 0) break;
    at += advanced;
    index = advance(index);
  }
};

export { runScheduleLoop };
