/* @layer renderer-lib @kind logic */
import type { LayerResume } from '@rotp/game-data';
import type { LayerActivity, LayerContext, LayerScheduler, LiveVoice } from './scheduler.type';
import { liveActivity } from './live-activity';
import { playLiveVoice } from './play-live-voice';

const createRandomScheduler = (
  ctx: LayerContext, minDelaySeconds: number, maxDelaySeconds: number, waitForCompletion = false,
): LayerScheduler => {
  const min = Math.max(0, Math.min(minDelaySeconds, maxDelaySeconds));
  const max = Math.max(0, Math.max(minDelaySeconds, maxDelaySeconds));

  let timer: ReturnType<typeof setTimeout> | null = null;
  let live: LiveVoice[] = [];
  let dueAt = 0;
  let currentWait: number | null = null;
  let lastFileIndex: number | null = null;

  const gap = (): number => (max <= min ? min : min + Math.random() * (max - min));

  const fire = (): void => {
    if (ctx.files.length === 0) return;
    const index = Math.floor(Math.random() * ctx.files.length);
    lastFileIndex = index;
    live.push(playLiveVoice(ctx, index, (entry) => {
      live = live.filter((v) => v !== entry);
      if (waitForCompletion) scheduleIn(gap());
    }));
  };

  const scheduleIn = (seconds: number): void => {
    dueAt = ctx.elapsedSeconds() + seconds;
    currentWait = seconds;
    timer = setTimeout(() => {
      timer = null;
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
    nextEventInSeconds: Math.max(0, dueAt - ctx.elapsedSeconds()),
  });

  const activity = (): LayerActivity => liveActivity({
    live,
    fileNames: ctx.fileNames,
    lastFileIndex,
    nextEventInSeconds: timer === null ? null : Math.max(0, dueAt - ctx.elapsedSeconds()),
    waitSeconds: timer === null ? null : currentWait,
  });

  const stop = (): void => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    live.forEach((v) => v.voice.stop());
    live = [];
  };

  return { start, position, activity, stop };
};

export { createRandomScheduler };
