/* @layer bridge-wasm @kind logic */
import type { PreviewTarget } from '@rotp/game-core';
import type { PlayOutcome } from '@rotp/msu';
import { ensurePreviewModule } from '../preview-core';
import { alttpMsuConfig, audioContext, isContinuousTarget, loadOriginalSound, originalSoundState, stopOriginalSound } from '@rotp/msu';
import { msuHost } from '../msu-session/msu-host';

const playOriginalSound = async (
  target: PreviewTarget,
  soundId: number,
  onEnded?: () => void,
): Promise<PlayOutcome> => {
  stopOriginalSound();
  if (await ensurePreviewModule() === null) return { started: false, silent: false };
  const sound = loadOriginalSound(msuHost, alttpMsuConfig, target, soundId);
  if (sound === null) return { started: false, silent: false };
  if (!sound.audible) return { started: false, silent: true };

  const ctx = audioContext();
  void ctx.resume();
  const source = ctx.createBufferSource();
  source.buffer = sound.buffer;
  source.loop = isContinuousTarget(alttpMsuConfig, target);
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
