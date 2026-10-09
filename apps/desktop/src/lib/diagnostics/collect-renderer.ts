/* @layer renderer-lib @kind logic */
import type { RendererDiagnostics } from './diagnostics.type';
import { probeWebgl } from './probe-webgl';
import { probeAudio } from './probe-audio';
import { probeDisplay } from './probe-display';
import { probeDevice } from './probe-device';
import { probeRefreshRate } from './probe-refresh-rate';

const collectRendererDiagnostics = async (): Promise<RendererDiagnostics> => {
  const [audio, refreshHz, device] = await Promise.all([probeAudio(), probeRefreshRate(), probeDevice()]);
  return {
    webgl: probeWebgl(),
    audio,
    display: probeDisplay(refreshHz),
    device,
  };
};

export { collectRendererDiagnostics };
