/* @layer renderer-lib @kind logic */
import type { LayerResume } from '@rotp/game-data';
import type { LayerActivity, LayerContext, LayerScheduler } from './scheduler.type';
import { intervalPointAt } from './interval-point-at';
import { playLiveVoice } from './play-live-voice';
import { secondsUntilDue } from './seconds-until-due';
import { stopTimed } from './stop-timed';
import { timedActivity } from './timed-activity';
import { createTimedState } from './timed-state';

const createIntervalScheduler = (ctx: LayerContext, atSeconds: number[]): LayerScheduler => {
  const points = [...new Set(atSeconds.filter((s) => Number.isFinite(s) && s >= 0))].sort((a, b) => a - b);
  const cycle = points.at(-1) ?? 0;
  const pointAt = (index: number): number => intervalPointAt(points, index);

  const state = createTimedState();
  let pointIndex = 0;

  const fireIndex = (index: number): void => {
    if (ctx.files.length === 0) return;
    const fileIndex = ctx.files.length > 1 ? index % ctx.files.length : 0;
    state.lastFileIndex = fileIndex;
    state.live.push(playLiveVoice(ctx, fileIndex, (entry) => { state.live = state.live.filter((v) => v !== entry); }));
  };

  const gapAfter = (previous: number, next: number): number =>
    (pointIndex === 0 ? Math.max(0, cycle - previous) + next : Math.max(0, next - previous));

  const scheduleIn = (seconds: number): void => {
    state.dueAt = ctx.elapsedSeconds() + seconds;
    state.currentWait = seconds;
    state.timer = setTimeout(() => {
      state.timer = null;
      fireIndex(pointIndex);
      pointIndex += 1;
      if (pointIndex >= points.length) pointIndex = 0;
      const previous = pointAt((pointIndex - 1 + points.length) % points.length);
      const next = pointAt(pointIndex);
      scheduleIn(gapAfter(previous, next));
    }, Math.max(0, seconds) * 1000);
  };

  const start = (resume: LayerResume | null): void => {
    if (points.length === 0) return;
    pointIndex = Math.min(resume?.fileIndex ?? 0, points.length - 1);
    scheduleIn(resume?.nextEventInSeconds ?? pointAt(pointIndex));
  };

  const position = (): LayerResume => ({
    fileIndex: pointIndex,
    offsetSeconds: 0,
    nextEventInSeconds: secondsUntilDue(ctx, state),
  });

  const activity = (): LayerActivity => timedActivity(ctx, state, state.currentWait);

  const stop = (): void => stopTimed(state);

  return { start, position, activity, stop };
};

export { createIntervalScheduler };
