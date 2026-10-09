/* @layer shared-game @kind constants */
import {
  EXPLOSIVES_TIERS, METER_TIERS, PROJECTILES_TIERS, WALLET_LADDER,
} from '../capacity-ladders.data';
import { capacityFamilyOf } from './capacity-family-of';
import type { CapacityFamilyId } from '../capacity-profile.type';
import type { CapacityFamily } from './capacity-family.type';

const EXPLOSIVES = capacityFamilyOf({
  id: 'explosives', label: 'Explosives', ladder: EXPLOSIVES_TIERS, referenceJumps: [1, 1, 1, 1, 1, 1, 2], hasSpot: true, defaultCount: 7,
});
const PROJECTILES = capacityFamilyOf({
  id: 'projectiles', label: 'Projectiles', ladder: PROJECTILES_TIERS, referenceJumps: [1, 1, 1, 1, 1, 1, 2], hasSpot: true, defaultCount: 7,
});
const METER = capacityFamilyOf({
  id: 'meter', label: 'Meter', ladder: METER_TIERS, referenceJumps: [1], hasSpot: true, defaultCount: 2,
});
const WALLET = capacityFamilyOf({
  id: 'wallet', label: 'Wallet', ladder: WALLET_LADDER, referenceJumps: [], hasSpot: false, defaultCount: 5,
});

const FAMILIES: readonly CapacityFamily[] = [EXPLOSIVES, PROJECTILES, METER, WALLET];

const FAMILY_BY_ID: Readonly<Record<CapacityFamilyId, CapacityFamily>> = {
  explosives: EXPLOSIVES,
  projectiles: PROJECTILES,
  meter: METER,
  wallet: WALLET,
};

export { EXPLOSIVES, FAMILIES, FAMILY_BY_ID, METER, PROJECTILES, WALLET };
