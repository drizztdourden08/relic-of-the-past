/* @layer renderer-lib @kind logic */
import type { LayerResume } from '@rotp/game-data';
import type { LayerActivity, LayerContext, LayerScheduler } from './scheduler.type';
import { playLiveVoice } from './play-live-voice';
import { secondsUntilDue } from './seconds-until-due';
import { stopTimed } from './stop-timed';
import { timedActivity } from './timed-activity';
import { createTimedState } from './timed-state';

const createRandomScheduler = (
  ctx: LayerContext, minDelaySeconds: number, maxDelaySeconds: number, waitForCompletion = false,
): LayerScheduler => {
  const min = Math.max(0, Math.min(minDelaySeconds, maxDelaySeconds));
  const max = Math.max(0, Math.max(minDelaySeconds, maxDelaySeconds));

  const state = createTimedState();

  const gap = (): number => (max <= min ? min : min + Math.random() * (max - min));

  const fire = (): void => {
    if (ctx.files.length === 0) return;
    const index = Math.floor(Math.random() * ctx.files.length);
    state.lastFileIndex = index;
    state.live.push(playLiveVoice(ctx, index, (entry) => {
      state.live = state.live.filter((v) => v !== entry);
      if (waitForCompletion) scheduleIn(gap());
    }));
  };

  const scheduleIn = (seconds: number): void => {
    state.dueAt = ctx.elapsedSeconds() + seconds;
    state.currentWait = seconds;
    state.timer = setTimeout(() => {
      state.timer = null;
      fire();
      if (!waitForCompletion) scheduleIn(gap());
    }, Math.max(0, seconds) * 1000);
  };

  const start = (resume: LayerResume | null): void => {
    scheduleIn(resume?.nextEventInSeconds ?? gap());
  };

  const position = (): LayerResume => ({
    fileIndex: 0,
    offsetSeconds: 0,
    nextEventInSeconds: secondsUntilDue(ctx, state),
  });

  const activity = (): LayerActivity =>
    timedActivity(ctx, state, state.timer === null ? null : state.currentWait);

  const stop = (): void => stopTimed(state);

  return { start, position, activity, stop };
};

export { createRandomScheduler };
