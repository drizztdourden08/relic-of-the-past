/* @layer renderer-components @kind types */
import type { PackFormat } from '../msu.type';

type WriteDroppedParams = {
  pack: string;
  trackNum: number;
  dropped: File[];
  format: PackFormat;
  taken: Set<string>;
  prefix: string;
  onCopied: (done: number, total: number) => void;
};

export type { WriteDroppedParams };
