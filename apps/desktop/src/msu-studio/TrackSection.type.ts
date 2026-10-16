/* @layer renderer-components @kind types */
import type { MatchedTrack, MsuFile, TrackPreviewControls } from './msu.type';

interface TrackSectionProps {
  title: string;
  rows: MatchedTrack[];
  files: MsuFile[];
  selected: number | null;
  controls: TrackPreviewControls;
  onSelect: (trackNum: number) => void;
}

export type { TrackSectionProps };
