/* @layer renderer-lib @kind logic */
/** Picks the scheduler strategy for a layer's play mode — the one place modes map to behavior. */
import type { LayerPlayMode } from '@shared/types/msu-manifest';
import type { LayerContext, LayerScheduler } from './scheduler.type';
import { createOnceScheduler } from './once-scheduler';
import { createLoopScheduler } from './loop-scheduler';
import { createRandomScheduler } from './random-scheduler';
import { createIntervalScheduler } from './interval-scheduler';

const createScheduler = (mode: LayerPlayMode, ctx: LayerContext): LayerScheduler => {
  switch (mode.kind) {
    case 'loop':
      return createLoopScheduler(ctx, mode.order, mode.crossfadeSeconds ?? 0);
    case 'random':
      return createRandomScheduler(ctx, mode.minDelaySeconds, mode.maxDelaySeconds, mode.waitForCompletion ?? false);
    case 'interval':
      return createIntervalScheduler(ctx, mode.atSeconds);
    case 'once':
    default:
      return createOnceScheduler(ctx);
  }
};

export { createScheduler };
