/* @layer renderer-lib @kind logic */
import type { LayerResume } from '@rotp/game-data';
import type { LayerActivity, LayerContext, LayerScheduler, LiveVoice } from './scheduler.type';
import type { Voice } from '../voice';
import { soundingVoices } from './sounding-voices';

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
    const entry = { voice: null as unknown as Voice, fileIndex: index };
    entry.voice = ctx.play(index, {
      loop: false,
      onEnded: () => {
        live = live.filter((v) => v !== entry);
        if (waitForCompletion) scheduleIn(gap());
      },
    });
    live.push(entry);
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

  const activity = (): LayerActivity => {
    const newest = live[live.length - 1];
    return {
      fileName: ctx.fileNames[newest?.fileIndex ?? lastFileIndex ?? 0] ?? null,
      nextEventInSeconds: timer === null ? null : Math.max(0, dueAt - ctx.elapsedSeconds()),
      waitSeconds: timer === null ? null : currentWait,
      positionSeconds: newest?.voice.offsetSeconds() ?? null,
      durationSeconds: newest?.voice.durationSeconds ?? null,
      sounding: live.length > 0,
      voiceCount: live.length,
      voices: soundingVoices(live, ctx.fileNames),
    };
  };

  const stop = (): void => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    live.forEach((v) => v.voice.stop());
    live = [];
  };

  return { start, position, activity, stop };
};

export { createRandomScheduler };
