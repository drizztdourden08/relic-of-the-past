/* @layer renderer-lib @kind logic */
/**
 * `loop`: play continuously. One file loops on itself (using its MSU-1 loop point when it
 * has one); several files play one after another — in order, or shuffled, which is how a
 * "ten themes at random" overworld and a "two themes back to back" area are both expressed.
 *
 * With a crossfade the passes are chained by hand instead: the next one starts early and
 * rises while the outgoing one falls, so the two overlap for the crossfade window. That means
 * giving up the browser's own seamless looping, which is why a zero crossfade keeps the
 * simpler path — a self-looping file should not be re-triggered for nothing.
 */
import type { LayerResume } from '@shared/types/msu-manifest';
import type { LayerActivity, LayerContext, LayerScheduler, SoundingVoice } from './scheduler.type';
import type { Voice } from '../voice';

/** Live sounds, oldest first, each with its own position and fade — one preview row apiece. */
const soundingVoices = (
  entries: { voice: Voice; fileIndex: number }[], names: string[],
): SoundingVoice[] => entries.map((e) => ({
  fileName: names[e.fileIndex] ?? null,
  positionSeconds: e.voice.offsetSeconds(),
  durationSeconds: e.voice.durationSeconds,
  fade: e.voice.fade(),
}));

const createLoopScheduler = (
  ctx: LayerContext, order: 'sequential' | 'random', crossfadeSeconds = 0,
): LayerScheduler => {
  const crossfade = Math.max(0, crossfadeSeconds);
  let voices: { voice: Voice; fileIndex: number }[] = [];
  let fileIndex = 0;
  let handoff: ReturnType<typeof setTimeout> | null = null;

  const nextIndex = (): number => {
    if (ctx.files.length <= 1) return 0;
    if (order === 'sequential') return (fileIndex + 1) % ctx.files.length;
    // Never repeat the same file twice running — a shuffle that stutters reads as a bug.
    let candidate = fileIndex;
    while (candidate === fileIndex) candidate = Math.floor(Math.random() * ctx.files.length);
    return candidate;
  };

  const drop = (voice: Voice): void => {
    voice.stop();
    voices = voices.filter((v) => v.voice !== voice);
  };

  /** Hard-cut chaining: one voice at a time, the next starting when this one ends. */
  const playPlain = (index: number, offsetSeconds: number): void => {
    fileIndex = index;
    const single = ctx.files.length === 1;
    const voice = ctx.play(index, {
      loop: single,
      offsetSeconds,
      onEnded: single ? undefined : () => { voices = []; playPlain(nextIndex(), 0); },
    });
    voices = [{ voice, fileIndex: index }];
  };

  /**
   * Crossfaded chaining. Each pass fades out over its final `crossfade` seconds while the
   * next fades in, so the overlap is audible rather than a seam. A file shorter than the
   * crossfade would otherwise never finish rising, so the window is clamped to half its length.
   */
  const playFaded = (index: number, offsetSeconds: number, fadeIn: boolean): void => {
    fileIndex = index;
    const duration = ctx.files[index]?.buffer.duration ?? 0;
    const window = Math.min(crossfade, duration / 2);
    const remaining = Math.max(0, duration - offsetSeconds);
    const handoffIn = Math.max(0, remaining - window);

    const voice = ctx.play(index, {
      loop: false,
      offsetSeconds,
      fadeInSeconds: fadeIn ? window : 0,
      fadeOutAfterSeconds: handoffIn,
      fadeOutSeconds: window,
      onEnded: () => { voices = voices.filter((v) => v.voice !== voice); },
    });
    voices.push({ voice, fileIndex: index });

    handoff = setTimeout(() => {
      handoff = null;
      playFaded(nextIndex(), 0, true);
    }, handoffIn * 1000);
  };

  const start = (resume: LayerResume | null): void => {
    if (ctx.files.length === 0) return;
    const index = Math.min(resume?.fileIndex ?? 0, ctx.files.length - 1);
    const offset = resume?.offsetSeconds ?? 0;
    if (crossfade > 0) playFaded(index, offset, false);
    else playPlain(index, offset);
  };

  // The newest voice is the one a position readout should follow: during a crossfade the
  // outgoing pass is on its way out and the incoming one is what the listener is arriving at.
  const current = () => voices[voices.length - 1];

  const position = (): LayerResume => ({
    fileIndex,
    offsetSeconds: current()?.voice.offsetSeconds() ?? 0,
    nextEventInSeconds: null,
  });

  const activity = (): LayerActivity => {
    const active = current();
    return {
      fileName: ctx.fileNames[active?.fileIndex ?? fileIndex] ?? null,
      nextEventInSeconds: null,
      waitSeconds: null,
      positionSeconds: active?.voice.offsetSeconds() ?? null,
      durationSeconds: active?.voice.durationSeconds ?? null,
      sounding: voices.length > 0,
      voiceCount: voices.length,
      voices: soundingVoices(voices, ctx.fileNames),
    };
  };

  const stop = (): void => {
    if (handoff !== null) clearTimeout(handoff);
    handoff = null;
    voices.forEach((v) => drop(v.voice));
    voices = [];
  };

  return { start, position, activity, stop };
};

export { createLoopScheduler };
