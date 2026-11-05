/* @layer bridge-wasm @kind logic */
import { createLocalSession } from '@drizztdourden08/brock-randomizer/session';
import type { Placement } from '@rotp/randomizer';
import { rotpRandomizer } from '@app/randomizer/rotp-randomizer';
import { activateSession } from './activate-session';
import { localWithStats } from './local-with-stats';
import { rotpSessionLog } from './rotp-session-log';
import type { SessionSource } from './session-store.type';

const startLocalFromPlacement = async (placement: Placement, source: SessionSource): Promise<void> => {
  const base = createLocalSession({ game: rotpRandomizer, placement, seed: placement.seed, log: rotpSessionLog });
  await activateSession(localWithStats(base), source, placement);
};

export { startLocalFromPlacement };
