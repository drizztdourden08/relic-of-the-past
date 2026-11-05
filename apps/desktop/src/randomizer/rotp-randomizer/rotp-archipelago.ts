/* @layer renderer-app @kind logic */
import { AP_GAME, AP_WORLD_VERSION } from '@rotp/randomizer';
import type { DeliveryAction, Placement } from '@rotp/randomizer';
import type { ArchipelagoGame } from '@drizztdourden08/brock-randomizer';
import { isFileInPlay, onSaveSwap } from '@app/game/randomizer-client/file-in-play';
import { rotpArchipelia } from './rotp-archipelia';
import { rotpApDeathLink } from './rotp-ap-death-link';
import { rotpApGate } from './rotp-ap-gate';
import { rotpApGoal } from './rotp-ap-goal';
import { locationIdOf } from './rotp-ap-location-id-of';
import { locationKeyOf } from './rotp-ap-location-key-of';
import { rotpApMarkCollected } from './rotp-ap-collected';
import { rotpApArm } from './rotp-ap-arm';
import { rotpApDisarm } from './rotp-ap-disarm';
import { rotpApReceivedAction } from './rotp-ap-received-action';
import { rotpApReceivedOrder } from './rotp-ap-received-order';
import { rotpApSlot } from './rotp-ap-slot';

const rotpArchipelago: ArchipelagoGame<Placement, DeliveryAction> = {
  name: AP_GAME,
  worldVersion: AP_WORLD_VERSION,
  archipelia: rotpArchipelia,
  locationKeyOf,
  locationIdOf,
  slot: rotpApSlot,
  receivedAction: rotpApReceivedAction,
  receivedOrder: rotpApReceivedOrder,
  get goal() {
    return rotpApGoal();
  },
  deathLink: rotpApDeathLink,
  file: { inPlay: isFileInPlay, onSwap: onSaveSwap },
  markCollected: rotpApMarkCollected,
  arm: rotpApArm,
  disarm: rotpApDisarm,
  ...rotpApGate,
};

export { rotpArchipelago };
