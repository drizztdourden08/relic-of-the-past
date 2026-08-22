/* @layer renderer-lib @kind logic */
/** `once`: play one file through and stop. Resuming picks up mid-file. */
import type { LayerResume } from '@shared/types/msu-manifest';
import type { LayerActivity, LayerContext, LayerScheduler } from './scheduler.type';
import type { Voice } from '../voice';

const createOnceScheduler = (ctx: LayerContext): LayerScheduler => {
  let voice: Voice | null = null;
  let fileIndex = 0;
  let finished = false;

  const start = (resume: LayerResume | null): void => {
    fileIndex = Math.min(resume?.fileIndex ?? 0, Math.max(ctx.files.length - 1, 0));
    if (ctx.files.length === 0) return;
    voice = ctx.play(fileIndex, {
      loop: false,
      offsetSeconds: resume?.offsetSeconds ?? 0,
      onEnded: () => { finished = true; voice = null; },
    });
  };

  // A finished one-shot resumes from the start rather than replaying its tail.
  const position = (): LayerResume => ({
    fileIndex,
    offsetSeconds: finished ? 0 : (voice?.offsetSeconds() ?? 0),
    nextEventInSeconds: null,
  });

  const activity = (): LayerActivity => ({
    fileName: ctx.fileNames[fileIndex] ?? null,
    nextEventInSeconds: null,
    waitSeconds: null,
    positionSeconds: voice ? voice.offsetSeconds() : null,
    durationSeconds: ctx.files[fileIndex]?.buffer.duration ?? null,
    sounding: voice !== null,
    voiceCount: voice ? 1 : 0,
    voices: voice ? [{
      fileName: ctx.fileNames[fileIndex] ?? null,
      positionSeconds: voice.offsetSeconds(),
      durationSeconds: voice.durationSeconds,
      fade: voice.fade(),
    }] : [],
  });

  const stop = (): void => {
    voice?.stop();
    voice = null;
  };

  return { start, position, activity, stop };
};

export { createOnceScheduler };
