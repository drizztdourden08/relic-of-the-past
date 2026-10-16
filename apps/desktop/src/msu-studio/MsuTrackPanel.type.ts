/* @layer renderer-components @kind types */
import type { MatchedTrack, MsuFile, TrackPreviewControls } from './msu.type';

interface MsuTrackPanelProps {
  rows: MatchedTrack[];
  files: MsuFile[];
  unusedFiles: MsuFile[];
  busy: boolean;
  readOnly: boolean;
  selected: number | null;
  note: string | null;
  controls: TrackPreviewControls;
  onSelect: (trackNum: number) => void;
  onDeleteFile: (fileName: string) => void;
}

export type { MsuTrackPanelProps };
