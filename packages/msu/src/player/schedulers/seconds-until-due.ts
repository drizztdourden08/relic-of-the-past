/* @layer renderer-lib @kind logic */
import type { LayerContext } from './scheduler.type';
import type { TimedState } from './timed-state.type';

const secondsUntilDue = (ctx: LayerContext, state: TimedState): number =>
  Math.max(0, state.dueAt - ctx.elapsedSeconds());

export { secondsUntilDue };
