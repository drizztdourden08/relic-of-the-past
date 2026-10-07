/* @layer renderer-lib @kind logic */
/**
 * `interval`: fire at fixed offsets measured from the moment the track started, so a cue can
 * be placed deliberately (a thunderclap eight seconds in) instead of drifting. The offsets
 * repeat as a cycle once the last one passes, and resume re-enters the cycle where it left off.
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

const createIntervalScheduler = (ctx: LayerContext, atSeconds: number[]): LayerScheduler => {
  // Sorted and de-duplicated: the schedule is a cycle, so order is meaning, not preference.
  const points = [...new Set(atSeconds.filter((s) => Number.isFinite(s) && s >= 0))].sort((a, b) => a - b);
  const cycle = points.length > 0 ? points[points.length - 1] : 0;

  let timer: ReturnType<typeof setTimeout> | null = null;
  let live: { voice: Voice; fileIndex: number }[] = [];
  let pointIndex = 0;
  let dueAt = 0;
  // Same reporting as the random mode: the gap being counted down, and what last fired.
  let currentWait: number | null = null;
  let lastFileIndex: number | null = null;

  const fireIndex = (index: number): void => {
    if (ctx.files.length === 0) return;
    // With a file per point, each offset gets its own sound; a single file serves them all.
    const fileIndex = ctx.files.length > 1 ? index % ctx.files.length : 0;
    lastFileIndex = fileIndex;
    const entry = { voice: null as unknown as Voice, fileIndex };
    entry.voice = ctx.play(fileIndex, { loop: false, onEnded: () => { live = live.filter((v) => v !== entry); } });
    live.push(entry);
  };

  const scheduleIn = (seconds: number): void => {
    dueAt = ctx.elapsedSeconds() + seconds;
    currentWait = seconds;
    timer = setTimeout(() => {
      timer = null;
      fireIndex(pointIndex);
      pointIndex += 1;
      if (pointIndex >= points.length) pointIndex = 0;
      const previous = points[(pointIndex - 1 + points.length) % points.length];
      const next = points[pointIndex];
      // Wrapping past the last point restarts the cycle: gap = (cycle - previous) + next.
      scheduleIn(pointIndex === 0 ? Math.max(0, cycle - previous) + next : Math.max(0, next - previous));
    }, Math.max(0, seconds) * 1000);
  };

  const start = (resume: LayerResume | null): void => {
    if (points.length === 0) return;
    pointIndex = Math.min(resume?.fileIndex ?? 0, points.length - 1);
    scheduleIn(resume?.nextEventInSeconds ?? points[pointIndex]);
  };

  // fileIndex carries the cycle position, so the next entry resumes the same point.
  const position = (): LayerResume => ({
    fileIndex: pointIndex,
    offsetSeconds: 0,
    nextEventInSeconds: Math.max(0, dueAt - ctx.elapsedSeconds()),
  });

  const activity = (): LayerActivity => {
    const newest = live[live.length - 1];
    return {
      fileName: ctx.fileNames[newest?.fileIndex ?? lastFileIndex ?? 0] ?? null,
      nextEventInSeconds: timer === null ? null : Math.max(0, dueAt - ctx.elapsedSeconds()),
      waitSeconds: currentWait,
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

export { createIntervalScheduler };
