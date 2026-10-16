/* @layer renderer-components @kind types */
import type { MsuPackManifest } from '@rotp/game-data';
import type { SelectOption } from '@drizztdourden08/tessera/primitives';
import type { PreviewReportStore } from './behavior/preview-report-store.type';
import type { MatchedTrack, MsuFile, PackFormat } from './msu.type';

interface MsuTrackPanelProps {
  selected: string;
  files: MsuFile[];
  manifest: MsuPackManifest;
  saveBase: MsuPackManifest;
  format: PackFormat;
  rows: MatchedTrack[];
  unusedFiles: MsuFile[];
  fileOptions: SelectOption[];
  playing: number | null;
  reportStore: PreviewReportStore;
  openTrack: number | null;
  busy: boolean;
  readOnly: boolean;
  onTrackAssign: (trackNum: number, fileName: string) => void;
  onTrackUpload: (trackNum: number, files: File[]) => void;
  onToggleLayers: (trackNum: number) => void;
  onPreview: (trackNum: number) => void;
  onStopPreview: () => void;
  onDeleteFile: (fileName: string) => void;
  onConfirm: (title: string, message: string, onConfirm: () => void) => void;
  onReload: () => void;
}

export type { MsuTrackPanelProps };
