/* @layer renderer-stores @kind types */
import type { RefreshRateInfo } from '@shared/types/display';

interface RefreshRateState {
  info: RefreshRateInfo;
  reading: boolean;
  refresh: () => Promise<void>;
}

export type { RefreshRateState };
