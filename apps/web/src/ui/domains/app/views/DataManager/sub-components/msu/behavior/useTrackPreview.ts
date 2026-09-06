/* @layer renderer-components @kind hook */
// Auditions one music slot as the game would hear it. The session underneath owns context, engine and polling.
import { useCallback, useEffect, useState } from 'react';
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import type { MsuEngine } from '@app/lib/msu/engine';
import { usePreviewSession } from './usePreviewSession';
import type { PreviewReport } from './preview-report-store';
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
    // Only clear the row this call was for: another slot may already have superseded it.
    if (!started) setPlaying((current) => (current === trackNum ? null : current));
  }, [manifest, start]);

  // Leaving the panel, or switching packs, must silence whatever is playing.
  useEffect(() => stop, [pack, stop]);

  return { playing, previewError: error, play, stop, reportStore };
};

export { useTrackPreview };
