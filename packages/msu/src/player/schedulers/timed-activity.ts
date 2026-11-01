/* @layer renderer-lib @kind logic */
import type { LayerActivity, LayerContext } from './scheduler.type';
import type { TimedState } from './timed-state.type';
import { liveActivity } from './live-activity';
import { secondsUntilDue } from './seconds-until-due';

const timedActivity = (ctx: LayerContext, state: TimedState, waitSeconds: number | null): LayerActivity =>
  liveActivity({
    live: state.live,
    fileNames: ctx.fileNames,
    lastFileIndex: state.lastFileIndex,
    nextEventInSeconds: state.timer === null ? null : secondsUntilDue(ctx, state),
    waitSeconds,
  });

export { timedActivity };
