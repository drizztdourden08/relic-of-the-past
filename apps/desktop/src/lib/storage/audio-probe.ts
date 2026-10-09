/* @layer renderer-lib @kind logic */
import type { AudioProbe } from '@shared/types/audio-probe';

const probeAudioFile: AudioProbe = (dataPath) =>
  window.api?.probeAudioFile?.(dataPath) ?? Promise.resolve(null);

export { probeAudioFile };
