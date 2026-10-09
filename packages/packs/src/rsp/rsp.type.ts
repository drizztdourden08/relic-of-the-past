/* @layer renderer-lib @kind types */
import type { RspSource, RspExtras } from '@rotp/hub-contracts';

interface RspWriteOptions {
  source?: RspSource;
  extras?: RspExtras;
  withPreview?: boolean;
}

export type { RspWriteOptions };
