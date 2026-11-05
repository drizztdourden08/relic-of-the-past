/* @layer bridge-wasm @kind logic */
import { NO_OWNERS, rememberNetworkStatus } from '@rotp/randomizer';
import type { RandomizerSession } from '@drizztdourden08/brock-randomizer/session';
import { isActiveSession } from './is-active-session';
import { localStats } from './local-stats';
import { storeSlots } from './store-slots';

const ignoreUnrememberedStatus = (): void => undefined;

const releaseSession = (previous: RandomizerSession | null): void => {
  if (!isActiveSession(previous)) return;
  storeSlots.unwire.get(previous)?.();
  storeSlots.unwire.delete(previous);
  if (previous.kind === 'online') {
    try { rememberNetworkStatus(previous.networkStatus); } catch { ignoreUnrememberedStatus(); }
    storeSlots.foreignOwners = NO_OWNERS;
  } else {
    localStats.current = null;
  }
  storeSlots.source = null;
};

export { releaseSession };
