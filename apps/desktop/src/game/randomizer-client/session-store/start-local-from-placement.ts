/* @layer bridge-wasm @kind logic */
import { createLocalSession } from '../local-session';
import { adoptSession } from './adopt-session';
import { NO_OWNERS } from '@rotp/randomizer';
import { storeSlots } from './store-slots';
import type { Placement } from '@rotp/randomizer';
import type { SessionSource } from './session-store.type';

const startLocalFromPlacement = async (nextPlacement: Placement, nextSource: SessionSource): Promise<void> => {
  const next = createLocalSession(nextPlacement);
  storeSlots.placement = nextPlacement;
  storeSlots.foreignOwners = NO_OWNERS;
  adoptSession(next, nextSource);
  await next.start();
};

export { startLocalFromPlacement };
