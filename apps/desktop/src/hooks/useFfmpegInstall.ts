/* @layer renderer-components @kind hook */
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
