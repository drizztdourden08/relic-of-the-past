/* @layer renderer-lib @kind logic */
import type { LayerResume } from '@rotp/game-data';
import type { LayerContext, LayerScheduler } from './scheduler.type';
import { loopActivity } from './loop-activity';
import type { LoopOrder, LoopRun } from './loop-scheduler.type';
import { playFaded } from './play-faded';
import { playPlain } from './play-plain';

const createLoopScheduler = (ctx: LayerContext, order: LoopOrder, crossfadeSeconds = 0): LayerScheduler => {
  const run: LoopRun = {
    ctx,
    order,
    crossfade: order === 'single' ? 0 : Math.max(0, crossfadeSeconds),
    state: { voices: [], fileIndex: 0, handoff: null },
  };
  const { state } = run;

  const start = (resume: LayerResume | null): void => {
    if (ctx.files.length === 0) return;
    const index = Math.min(resume?.fileIndex ?? 0, ctx.files.length - 1);
    const offset = resume?.offsetSeconds ?? 0;
    if (run.crossfade > 0) playFaded(run, index, offset, false);
    else playPlain(run, index, offset);
  };

  const position = (): LayerResume => ({
    fileIndex: state.fileIndex,
    offsetSeconds: state.voices[state.voices.length - 1]?.voice.offsetSeconds() ?? 0,
    nextEventInSeconds: null,
  });

  const stop = (): void => {
    if (state.handoff !== null) clearTimeout(state.handoff);
    state.handoff = null;
    state.voices.forEach((v) => v.voice.stop());
    state.voices = [];
  };

  return { start, position, activity: () => loopActivity(ctx, state), stop };
};

export { createLoopScheduler };
