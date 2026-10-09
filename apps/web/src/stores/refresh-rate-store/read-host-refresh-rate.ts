/* @layer renderer-stores @kind logic */
import type { RefreshRateInfo } from '@shared/types/display';
import { getPlatform } from '../../platform/get-platform';
import { EMPTY_REFRESH_RATE } from './refresh-rate-store.constants';

const readHostRefreshRate = async (): Promise<RefreshRateInfo> => {
  try {
    return await getPlatform().display.getRefreshRate();
  } catch {
    return EMPTY_REFRESH_RATE;
  }
};

export { readHostRefreshRate };
