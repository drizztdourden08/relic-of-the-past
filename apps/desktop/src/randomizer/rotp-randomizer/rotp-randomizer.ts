/* @layer renderer-app @kind logic */
import { PLACEMENT_SCHEMAS, rotpWorldGame } from '@rotp/randomizer';
import type { DeliveryAction, Placement } from '@rotp/randomizer';
import { defineRandomizerGame } from '@drizztdourden08/brock-randomizer';
import './rotp-randomizer.augment.type';
import { rotpApplier } from './rotp-applier';
import { rotpApStateStore } from './rotp-ap-state-store';
import { rotpCoreSignal } from './rotp-core-signal';
import { describePlacement } from './rotp-describe';
import { isRotpPlacement } from './rotp-is-placement';
import { rotpMemoryBridge } from './rotp-memory-bridge';
import { rotpPoll } from './rotp-poll';
import { rotpProfile } from './rotp-profile';
import { rollRotpPlacement } from './rotp-roll';

const rotpRandomizer = defineRandomizerGame<Placement, DeliveryAction>({
  id: 'rotp',
  world: rotpWorldGame,
  placementSchemas: PLACEMENT_SCHEMAS,
  core: rotpCoreSignal,
  roll: rollRotpPlacement,
  describe: describePlacement,
  isPlacement: isRotpPlacement,
  memory: rotpMemoryBridge,
  applier: rotpApplier,
  apState: rotpApStateStore,
  poll: rotpPoll,
  profile: rotpProfile,
});

export { rotpRandomizer };
