/* @layer shared-game @kind logic */
import { syncedRateOptions } from './synced-rate-options';

const bestSyncedRate = (hz: number | null): number | null => {
  const options = syncedRateOptions(hz);
  return options.length ? options[options.length - 1] : null;
};

export { bestSyncedRate };
