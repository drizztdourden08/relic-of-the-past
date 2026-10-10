/* @layer renderer-lib @kind logic */
import type { LayerResume } from '@rotp/game-data';
import type { LayerActivity, LayerContext, LayerScheduler, LiveVoice } from './scheduler.type';
import { liveActivity } from './live-activity';
import { intervalPointAt } from './interval-point-at';
import { playLiveVoice } from './play-live-voice';

const createIntervalScheduler = (ctx: LayerContext, atSeconds: number[]): LayerScheduler => {
  const points = [...new Set(atSeconds.filter((s) => Number.isFinite(s) && s >= 0))].sort((a, b) => a - b);
  const cycle = points.at(-1) ?? 0;
  const pointAt = (index: number): number => intervalPointAt(points, index);

  let timer: ReturnType<typeof setTimeout> | null = null;
  let live: LiveVoice[] = [];
  let pointIndex = 0;
  let dueAt = 0;
  let currentWait: number | null = null;
  let lastFileIndex: number | null = null;

  const fireIndex = (index: number): void => {
    if (ctx.files.length === 0) return;
    const fileIndex = ctx.files.length > 1 ? index % ctx.files.length : 0;
    lastFileIndex = fileIndex;
    live.push(playLiveVoice(ctx, fileIndex, (entry) => { live = live.filter((v) => v !== entry); }));
  };

  const gapAfter = (previous: number, next: number): number =>
    (pointIndex === 0 ? Math.max(0, cycle - previous) + next : Math.max(0, next - previous));

  const scheduleIn = (seconds: number): void => {
    dueAt = ctx.elapsedSeconds() + seconds;
    currentWait = seconds;
    timer = setTimeout(() => {
      timer = null;
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
    nextEventInSeconds: Math.max(0, dueAt - ctx.elapsedSeconds()),
  });

  const activity = (): LayerActivity => liveActivity({
    live,
    fileNames: ctx.fileNames,
    lastFileIndex,
    nextEventInSeconds: timer === null ? null : Math.max(0, dueAt - ctx.elapsedSeconds()),
    waitSeconds: currentWait,
  });

  const stop = (): void => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    live.forEach((v) => v.voice.stop());
    live = [];
  };

  return { start, position, activity, stop };
};

export { createIntervalScheduler };
