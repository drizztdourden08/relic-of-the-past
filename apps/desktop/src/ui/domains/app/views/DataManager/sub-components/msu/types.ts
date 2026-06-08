/* @layer renderer-components @kind types */
import type { SelectOption } from '../../../../../../design-system/primitives/Select';

interface MsuPack {
  name: string;
  fileCount: number;
  totalSize: number;
}

interface MsuFile {
  name: string;
  size: number;
}

interface TrackInfo {
  fileName: string;
  trackNum: number;
  ext: string;
}

interface MatchedTrack {
  trackNum: number;
  description: string;
  fileName: string | null;
}

interface MsuManagerProps {
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
  onRefresh: () => void;
}

interface TrackRowProps {
  trackNum: number;
  description: string;
  fileName: string | null;
  fileSize?: number;
  options: SelectOption[];
  onAssign: (trackNum: number, fileName: string) => void;
}

const getTrackNumber = (filename: string): number | null => {
  const match = filename.match(/(\d+)\.(pcm|opuz)$/i);
  return match ? parseInt(match[1], 10) : null;
};

export { getTrackNumber };
export type { MsuPack, MsuFile, TrackInfo, MatchedTrack, MsuManagerProps, TrackRowProps };
