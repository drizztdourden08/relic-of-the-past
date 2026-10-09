/* @layer renderer-lib @kind logic */
import type { LayerResume } from '@rotp/game-data';
import type { LayerActivity, LayerContext, LayerScheduler, LiveVoice } from './scheduler.type';
import type { Voice } from '../voice';
import { soundingVoices } from './sounding-voices';

const createIntervalScheduler = (ctx: LayerContext, atSeconds: number[]): LayerScheduler => {
  const points = [...new Set(atSeconds.filter((s) => Number.isFinite(s) && s >= 0))].sort((a, b) => a - b);
  const cycle = points.length > 0 ? points[points.length - 1] : 0;

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
    const entry = { voice: null as unknown as Voice, fileIndex };
    entry.voice = ctx.play(fileIndex, { loop: false, onEnded: () => { live = live.filter((v) => v !== entry); } });
    live.push(entry);
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
      const previous = points[(pointIndex - 1 + points.length) % points.length];
      const next = points[pointIndex];
      scheduleIn(gapAfter(previous, next));
    }, Math.max(0, seconds) * 1000);
  };

  const start = (resume: LayerResume | null): void => {
    if (points.length === 0) return;
    pointIndex = Math.min(resume?.fileIndex ?? 0, points.length - 1);
    scheduleIn(resume?.nextEventInSeconds ?? points[pointIndex]);
  };

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
