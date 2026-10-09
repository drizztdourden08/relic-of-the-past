/* @layer renderer-components @kind types */
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import type { MsuFile, PackFormat } from '../msu.type';

interface TrackAssignParams {
  pack: string | null;
  format: PackFormat;
  manifest: MsuPackManifest;
  files: MsuFile[];
  reload: () => void;
}

export type { TrackAssignParams };
