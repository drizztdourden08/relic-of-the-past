/* @layer renderer-lib @kind logic */
import type { LoopState } from './loop-scheduler.type';
import type { LayerActivity, LayerContext, LiveVoice, SoundingVoice } from './scheduler.type';

const loopSoundingVoices = (entries: LiveVoice[], names: string[], loopSeconds: number): SoundingVoice[] =>
  entries.map((e) => ({
    fileName: names[e.fileIndex] ?? null,
    positionSeconds: e.voice.offsetSeconds(),
    durationSeconds: e.voice.durationSeconds,
    loopSeconds: loopSeconds > 0 ? loopSeconds : e.voice.loopSeconds,
    fade: e.voice.fade(),
  }));

const loopActivity = (ctx: LayerContext, state: LoopState): LayerActivity => {
  const { voices, fileIndex } = state;
  const active = voices[voices.length - 1];
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

export { loopActivity };
