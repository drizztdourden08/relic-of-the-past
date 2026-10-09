/* @layer renderer-lib @kind logic */
import { appApi } from '@app/ipc/app-api';
import type { AudioProbe } from '@rotp/msu';

const probeAudioFile: AudioProbe = (dataPath) =>
  appApi()?.probeAudioFile?.(dataPath) ?? Promise.resolve(null);

export { probeAudioFile };
