/* @layer bridge-wasm @kind logic */
import type { PreviewTarget } from '../bridge/sound-preview';
import type { PlayOutcome } from './original-sound.type';
import { ensurePreviewModule } from '../preview-core';
import { audioContext } from './audio-context';
import { loadOriginalSound } from './load-original-sound';
import { originalSoundState } from './original-sound-state';
import { stopOriginalSound } from './stop-original-sound';
import { CONTINUOUS } from './original-sound.constants';

const playOriginalSound = async (
  target: PreviewTarget,
  soundId: number,
  onEnded?: () => void,
): Promise<PlayOutcome> => {
  stopOriginalSound();
  if (await ensurePreviewModule() === null) return { started: false, silent: false };
  const sound = loadOriginalSound(target, soundId);
  if (sound === null) return { started: false, silent: false };
  if (!sound.audible) return { started: false, silent: true };

  const ctx = audioContext();
  void ctx.resume();
  const source = ctx.createBufferSource();
  source.buffer = sound.buffer;
  source.loop = CONTINUOUS.includes(target);
  source.connect(ctx.destination);
  source.onended = () => {
    const stillCurrent = originalSoundState.playing === source;
    if (stillCurrent) originalSoundState.playing = null;
    onEnded?.();
  };
  originalSoundState.playing = source;
  source.start();
  return { started: true, silent: false };
};

export { playOriginalSound };
