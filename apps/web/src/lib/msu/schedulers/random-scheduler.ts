/* @layer renderer-lib @kind logic */
/**
 * `random`: fire one file, wait a random gap, fire another, forever. The gap is measured from
 * the START of a sound by default (long sounds layer up); `waitForCompletion` measures from the
 * END, so exactly one plays at a time. Resume keeps the remaining gap, not the file position.
 */
import type { LayerResume } from '@shared/types/msu-manifest';
import type { LayerActivity, LayerContext, LayerScheduler, SoundingVoice } from './scheduler.type';
import type { Voice } from '../voice';

/** Live sounds, oldest first, each with its own position and fade. One preview row apiece. */
const soundingVoices = (
  entries: { voice: Voice; fileIndex: number }[], names: string[],
): SoundingVoice[] => entries.map((e) => ({
  fileName: names[e.fileIndex] ?? null,
  positionSeconds: e.voice.offsetSeconds(),
  durationSeconds: e.voice.durationSeconds,
  loopSeconds: e.voice.loopSeconds,
  fade: e.voice.fade(),
}));

const createRandomScheduler = (
  ctx: LayerContext, minDelaySeconds: number, maxDelaySeconds: number, waitForCompletion = false,
): LayerScheduler => {
  const min = Math.max(0, Math.min(minDelaySeconds, maxDelaySeconds));
  const max = Math.max(0, Math.max(minDelaySeconds, maxDelaySeconds));

  let timer: ReturnType<typeof setTimeout> | null = null;
  let live: { voice: Voice; fileIndex: number }[] = [];
  let dueAt = 0;
  // The gap the current countdown started from, and what last fired. Both are reported to the studio's
  // preview so the wait it chose is visible.
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
        // Waiting for completion means the gap starts here, not at the sound's start.
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
      // Overlapping mode chains straight off the start; the other waits for onEnded above.
      if (!waitForCompletion) scheduleIn(gap());
    }, Math.max(0, seconds) * 1000);
  };

  const start = (resume: LayerResume | null): void => {
    scheduleIn(resume?.nextEventInSeconds ?? gap());
  };

  // The remaining gap is the whole state worth keeping: what matters on returning to an area
  // is that the next event is not bunched against the previous one.
  const position = (): LayerResume => ({
    fileIndex: 0,
    offsetSeconds: 0,
    nextEventInSeconds: Math.max(0, dueAt - ctx.elapsedSeconds()),
  });

  const activity = (): LayerActivity => {
    // Report the newest sound: with overlap allowed, that is the one that just landed.
    const newest = live[live.length - 1];
    return {
      fileName: ctx.fileNames[newest?.fileIndex ?? lastFileIndex ?? 0] ?? null,
      // While waiting for a sound to finish there is no countdown yet; say so, don't show a stale one.
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
