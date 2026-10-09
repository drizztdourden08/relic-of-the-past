/* @layer renderer-lib @kind logic */
import type { LayerResume } from '@rotp/game-data';
import type { LayerActivity, LayerContext, LayerScheduler, LiveVoice, SoundingVoice } from './scheduler.type';
import type { Voice } from '../voice';

const loopSoundingVoices = (entries: LiveVoice[], names: string[], loopSeconds: number): SoundingVoice[] =>
  entries.map((e) => ({
    fileName: names[e.fileIndex] ?? null,
    positionSeconds: e.voice.offsetSeconds(),
    durationSeconds: e.voice.durationSeconds,
    loopSeconds: loopSeconds > 0 ? loopSeconds : e.voice.loopSeconds,
    fade: e.voice.fade(),
  }));

const createLoopScheduler = (
  ctx: LayerContext, order: 'sequential' | 'random' | 'single', crossfadeSeconds = 0,
): LayerScheduler => {
  const crossfade = order === 'single' ? 0 : Math.max(0, crossfadeSeconds);
  let voices: LiveVoice[] = [];
  let fileIndex = 0;
  let handoff: ReturnType<typeof setTimeout> | null = null;

  const nextIndex = (): number => {
    if (ctx.files.length <= 1 || order === 'single') return 0;
    if (order === 'sequential') return (fileIndex + 1) % ctx.files.length;
    let candidate = fileIndex;
    while (candidate === fileIndex) candidate = Math.floor(Math.random() * ctx.files.length);
    return candidate;
  };

  const drop = (voice: Voice): void => {
    voice.stop();
    voices = voices.filter((v) => v.voice !== voice);
  };

  const playPlain = (index: number, offsetSeconds: number): void => {
    fileIndex = index;
    const loopsItself = ctx.files.length === 1 || order === 'single';
    const voice = ctx.play(index, {
      loop: loopsItself,
      offsetSeconds,
      onEnded: loopsItself ? undefined : () => { voices = []; playPlain(nextIndex(), ctx.loopSeconds); },
    });
    voices = [{ voice, fileIndex: index }];
  };

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
      playFaded(nextIndex(), ctx.loopSeconds, true);
    }, handoffIn * 1000);
  };

  const start = (resume: LayerResume | null): void => {
    if (ctx.files.length === 0) return;
    const index = Math.min(resume?.fileIndex ?? 0, ctx.files.length - 1);
    const offset = resume?.offsetSeconds ?? 0;
    if (crossfade > 0) playFaded(index, offset, false);
    else playPlain(index, offset);
  };

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
      voices: loopSoundingVoices(voices, ctx.fileNames, ctx.loopSeconds),
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
