/* @layer renderer-lib @kind logic */
/** Runs every renderer-side probe. The refresh-rate measurement is the only slow
 *  one (it has to watch real frames), so it runs alongside the audio probe. */
import type { RendererDiagnostics } from './types';
import { probeWebgl } from './probe-webgl';
import { probeAudio } from './probe-audio';
import { probeDisplay } from './probe-display';
import { probeDevice } from './probe-device';
import { probeRefreshRate } from './probe-refresh-rate';

const collectRendererDiagnostics = async (): Promise<RendererDiagnostics> => {
  const [audio, refreshHz] = await Promise.all([probeAudio(), probeRefreshRate()]);
  return {
    webgl: probeWebgl(),
    audio,
    display: probeDisplay(refreshHz),
    device: probeDevice(),
  };
};

export { collectRendererDiagnostics };
