/* @layer electron-main @kind logic */
import { syncedRateMap } from './synced-rate-map';

const availableSyncedRates = (): number[] => [...syncedRateMap().keys()].sort((a, b) => a - b);

export { availableSyncedRates };
