/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import type { MsuTrackPanelProps } from '../MsuTrackPanel.type';
import { useOriginalPreview } from './useOriginalPreview';

const useTrackPreviewSwitch = (props: Pick<MsuTrackPanelProps, 'onPreview' | 'onStopPreview'>) => {
  const { onPreview, onStopPreview } = props;
  const original = useOriginalPreview('music');

  const previewTrack = useCallback((trackNum: number) => {
    original.stop();
    onPreview(trackNum);
  }, [original, onPreview]);

  const playOriginal = useCallback((trackNum: number) => {
    onStopPreview();
    original.play(trackNum);
  }, [original, onStopPreview]);

  return { original, previewTrack, playOriginal };
};

export { useTrackPreviewSwitch };
