/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useState } from 'react';
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import type { MsuEngine } from '@app/lib/msu/engine';
import { usePreviewSession } from './usePreviewSession';
import type { PreviewReport } from './preview-report-store.type';
import { trackPreviewKey } from './preview-key';
import { singleTrackManifest } from './pack-manifest';

const readTrack = (engine: MsuEngine): PreviewReport | null => {
  const report = engine.report();
  if (report === null) return null;
  return {
    key: trackPreviewKey(report.trackNum),
    elapsedSeconds: report.elapsedSeconds,
    layers: report.layers,
    detail: null,
  };
};

const useTrackPreview = (pack: string | null, manifest: MsuPackManifest) => {
  const { start, stop: stopSession, error, reportStore } = usePreviewSession(pack);
  const [playing, setPlaying] = useState<number | null>(null);

  const stop = useCallback(() => {
    setPlaying(null);
    stopSession();
  }, [stopSession]);

  const play = useCallback(async (trackNum: number) => {
    setPlaying(trackNum);
    const started = await start({
      manifest: singleTrackManifest(manifest, trackNum),
      read: readTrack,
      begin: (engine) => engine.onMusicCtrl(trackNum, 0, 0, 0),
    });
    if (!started) setPlaying((current) => (current === trackNum ? null : current));
  }, [manifest, start]);

  useEffect(() => stop, [pack, stop]);

  return { playing, previewError: error, play, stop, reportStore };
};

export { useTrackPreview };
