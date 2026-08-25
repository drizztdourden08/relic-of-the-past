/* @layer renderer-components @kind hook */
/**
 * The optional audio tool, as a step the user can complete.
 *
 * The tool is not bundled — it is a large download fetched on request and kept under the
 * app's own data root — so anything that needs it has to be able to ask for it, watch it
 * arrive, and carry on. The install reports every state it passes through on an event, so
 * the download and the verify are followed rather than polled.
 *
 * Nothing is fetched until `install` is called: merely opening something that COULD use the
 * tool must never start a download.
 */
import { useCallback, useEffect, useState } from 'react';
import type { FfmpegState } from '@shared/types/ffmpeg-tool';

const useFfmpegInstall = (active: boolean) => {
  const [state, setState] = useState<FfmpegState | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (!active) { setState(null); return undefined; }
    let live = true;
    void window.api.getFfmpegState()
      .then((current) => { if (live) setState(current); })
      .catch(() => { if (live) setState({ status: 'failed', reason: 'Could not read the tool state.' }); });
    return () => { live = false; };
  }, [active]);

  useEffect(() => (active ? window.api.onFfmpegProgress(setState) : undefined), [active]);

  // Resolves with the final state rather than only setting it, so a caller can decide what to
  // do next without waiting for a re-render to tell it whether the install worked.
  const install = useCallback(async (): Promise<FfmpegState> => {
    setInstalling(true);
    try {
      const settled = await window.api.installFfmpeg();
      setState(settled);
      return settled;
    } finally {
      setInstalling(false);
    }
  }, []);

  return { state, installing, install, ready: state?.status === 'ready' };
};

export { useFfmpegInstall };
