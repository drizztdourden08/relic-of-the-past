/* @layer renderer-lib @kind logic */
import type { LiveVoice, SoundingVoice } from './scheduler.type';

const soundingVoices = (entries: LiveVoice[], names: string[]): SoundingVoice[] => entries.map((e) => ({
  fileName: names[e.fileIndex] ?? null,
  positionSeconds: e.voice.offsetSeconds(),
  durationSeconds: e.voice.durationSeconds,
  loopSeconds: e.voice.loopSeconds,
  fade: e.voice.fade(),
}));

export { soundingVoices };
