/* @layer renderer-components @kind types */
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import type { MsuFile } from '../msu.type';

interface FilePanelParams {
  pack: string;
  files: MsuFile[];
  saveBase: MsuPackManifest | null;
  reload: () => void;
}

interface FormatCount {
  ext: string;
  count: number;
}

export type { FilePanelParams, FormatCount };
