/* @layer renderer-components @kind types */
import type { MsuFile } from '../msu.type';

interface SoundUploadParams {
  pack: string | null;
  files: MsuFile[];
  reload: () => void;
}

export type { SoundUploadParams };
