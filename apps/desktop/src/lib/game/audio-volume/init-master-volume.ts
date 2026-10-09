/* @layer bridge-wasm @kind logic */
import { PENDING_POLL_MS } from './audio-volume.constants';
import { armGestureResume } from './arm-gesture-resume';
import { clearPendingPoll } from './clear-pending-poll';
import { getSDL2Audio } from './get-sdl2-audio';
import { handleResumeGesture } from './handle-resume-gesture';
import { volumeState } from './volume-state';

const startPendingPoll = (): void => {
  clearPendingPoll();
  volumeState.pendingPollId = setInterval(() => {
    if (volumeState.pendingVolume === null) {
      clearPendingPoll();
      return;
    }
    const sdl2 = getSDL2Audio();
    if (sdl2) {
      const vol = volumeState.pendingVolume;
      volumeState.pendingVolume = null;
      clearPendingPoll();
      initMasterVolume(vol);
    }
  }, PENDING_POLL_MS);
};

const initMasterVolume = (volume: number): void => {
  volumeState.lastRequestedVolume = volume;
  const sdl2 = getSDL2Audio();
  if (!sdl2) {
    volumeState.pendingVolume = volume;
    startPendingPoll();
    return;
  }

  armGestureResume();
  handleResumeGesture();

  const { audioContext: ctx, scriptProcessorNode: source } = sdl2;

  if (volumeState.gainNode) {
    volumeState.gainNode.gain.value = volume / 100;
    return;
  }

  const gainNode = ctx.createGain();
  volumeState.gainNode = gainNode;
  gainNode.gain.value = volume / 100;
  source.disconnect();
  source.connect(gainNode);
  gainNode.connect(ctx.destination);
};

export { initMasterVolume };
