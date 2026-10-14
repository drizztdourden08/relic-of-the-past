/* @layer renderer-lib @kind logic */
import { hostApi } from '@drizztdourden08/brock-react';
import type { AudioProbe } from '@rotp/msu';

const probeAudioFile: AudioProbe = (dataPath) =>
  hostApi()?.probeAudioFile?.(dataPath) ?? Promise.resolve(null);

export { probeAudioFile };
