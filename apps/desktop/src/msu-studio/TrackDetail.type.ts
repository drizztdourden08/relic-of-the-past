/* @layer renderer-components @kind types */
import type { MsuManagerModel } from './msu-manager.type';
import type { MatchedTrack, TrackPreviewControls } from './msu.type';

interface TrackDetailProps {
  msu: MsuManagerModel;
  pack: string;
  row: MatchedTrack;
  readOnly: boolean;
  controls: TrackPreviewControls;
  onClose: () => void;
  onConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export type { TrackDetailProps };
