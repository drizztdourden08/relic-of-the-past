/* @layer renderer-stores @kind logic */
import { displayPort } from '@app/platform/display-port';
import type { RefreshRateInfo } from '@shared/types/display';
import { EMPTY_REFRESH_RATE } from './refresh-rate-store.constants';

const readHostRefreshRate = async (): Promise<RefreshRateInfo> => {
  try {
    return await displayPort().getRefreshRate();
  } catch {
    return EMPTY_REFRESH_RATE;
  }
};

export { readHostRefreshRate };
