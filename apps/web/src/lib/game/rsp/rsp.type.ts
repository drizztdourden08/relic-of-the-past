/* @layer renderer-lib @kind types */
import type { RspSource, RspExtras } from '@shared/storage/link-sprites/rsp.type';

interface RspWriteOptions {
  source?: RspSource;
  extras?: RspExtras;
  withPreview?: boolean;
}

export type { RspWriteOptions };
