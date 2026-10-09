/* @layer renderer-components @kind types */
import type { MsuPackManifest } from '@rotp/game-data';
import type { MsuFile, PackFormat } from '../msu.type';

interface TrackUploadParams {
  pack: string | null;
  format: PackFormat;
  manifest: MsuPackManifest;
  files: MsuFile[];
  reload: () => void;
}

export type { TrackUploadParams };
