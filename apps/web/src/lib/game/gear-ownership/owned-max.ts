/* @layer bridge-wasm @kind logic */
import type { GearTiers } from './gear-ownership.type';
import { NO_GEAR, PINNED_SLOT_KEY } from './gear-ownership.constants';
import { gearOwnershipState } from './gear-ownership-state';

const ownedMax = (): GearTiers => ({ ...NO_GEAR, ...gearOwnershipState.record[PINNED_SLOT_KEY] });

export { ownedMax };
