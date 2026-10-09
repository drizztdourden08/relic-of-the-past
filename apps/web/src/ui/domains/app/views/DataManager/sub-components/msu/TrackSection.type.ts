/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { SelectOption } from '@ds/primitives/Select';
import type { PreviewReportStore } from './behavior/preview-report-store.type';
import type { MatchedTrack, MsuFile } from './msu.type';

interface TrackSectionProps {
  title: string;
  rows: MatchedTrack[];
  files: MsuFile[];
  fileOptions: SelectOption[];
  playing: number | null;
  playingOriginal: number | null;
  reportStore: PreviewReportStore;
  openTrack: number | null;
  busy: boolean;
  readOnly: boolean;
  onAssign: (trackNum: number, fileName: string) => void;
  onPreview: (trackNum: number) => void;
  onStopPreview: () => void;
  onPlayOriginal: (trackNum: number) => void;
  onToggleLayers: (trackNum: number) => void;
  renderDetail: (trackNum: number) => ReactNode;
}

export type { TrackSectionProps };
