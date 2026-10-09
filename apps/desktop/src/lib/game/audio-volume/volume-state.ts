/* @layer bridge-wasm @kind logic */
import { DEFAULT_VOLUME } from './audio-volume.constants';

const volumeState = {
  gainNode: null as GainNode | null,
  pendingVolume: null as number | null,
  lastRequestedVolume: DEFAULT_VOLUME,
  pendingPollId: null as ReturnType<typeof setInterval> | null,
};

export { volumeState };
