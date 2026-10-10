/* @layer bridge-wasm @kind logic */
import type { PreviewTarget } from '@rotp/game-core';
import type { OriginalSound } from './original-sound.type';
import { renderOriginalSound } from '@rotp/game-core';
import { audibleLength } from './audible-length';
import { audioContext } from './audio-context';
import { originalSoundState } from './original-sound-state';
import { soundKeyOf } from './sound-key';
import { CACHEABLE_SECONDS, PCM_FULL_SCALE, PREVIEW_SECONDS } from './original-sound.constants';

const toAudioBuffer = (samples: Int16Array, sampleRate: number, frames: number): AudioBuffer => {
  const buffer = audioContext().createBuffer(2, Math.max(1, frames), sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);
  for (let i = 0; i < frames; i++) {
    left[i] = (samples[i * 2] ?? 0) / PCM_FULL_SCALE;
    right[i] = (samples[i * 2 + 1] ?? 0) / PCM_FULL_SCALE;
  }
  return buffer;
};

const loadOriginalSound = (target: PreviewTarget, soundId: number): OriginalSound | null => {
  const key = soundKeyOf(target, soundId);
  const cached = originalSoundState.cache.get(key);
  if (cached !== undefined) return cached;

  const rendered = renderOriginalSound(target, soundId, PREVIEW_SECONDS[target]);
  if (rendered === null) return null;

  const frames = audibleLength(rendered.samples);
  const sound: OriginalSound = {
    buffer: toAudioBuffer(rendered.samples, rendered.sampleRate, frames),
    audible: frames > 0,
  };
  if (frames <= CACHEABLE_SECONDS * rendered.sampleRate) originalSoundState.cache.set(key, sound);
  return sound;
};

export { loadOriginalSound };
