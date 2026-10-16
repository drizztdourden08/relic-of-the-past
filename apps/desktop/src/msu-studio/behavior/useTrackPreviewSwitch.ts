/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { useOriginalPreview } from './useOriginalPreview';
import type { TrackPreviewSwitchParams } from './track-preview-switch.type';

const useTrackPreviewSwitch = (params: TrackPreviewSwitchParams) => {
  const { onPreview, onStopPreview } = params;
  const original = useOriginalPreview('music');

  const previewTrack = useCallback((trackNum: number) => {
    original.stop();
    void onPreview(trackNum);
  }, [original, onPreview]);

  const playOriginal = useCallback((trackNum: number) => {
    onStopPreview();
    original.play(trackNum);
  }, [original, onStopPreview]);

  return { original, previewTrack, playOriginal };
};

export { useTrackPreviewSwitch };
