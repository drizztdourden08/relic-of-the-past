/* @layer electron-main @kind logic */
import type { UpdateManager } from 'velopack';

const updateManagerState = {
  cached: null as UpdateManager | null,
  cachedPrerelease: null as boolean | null,
};

export { updateManagerState };
