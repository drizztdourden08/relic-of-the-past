/* @layer bridge-wasm @kind constants */
import { WALLET_SLOT_COUNT, WALLET_VIRT_FIRST, WALLET_VIRT_LAST } from '@rotp/game-data';
import { FAMILIES, WALLET_LADDER_LAST, maxSpanOf } from '../world/capacity';
import type { CapacityFamilyId } from '@rotp/game-data';

const CAPACITY_FAMILY_INDEX: Readonly<Record<CapacityFamilyId, number>> = {
  explosives: 0,
  projectiles: 1,
  meter: 2,
  wallet: 3,
};

const CAPACITY_FAMILY_LAST_TIER: Readonly<Record<CapacityFamilyId, number>> = Object.fromEntries(
  FAMILIES.map((family) => [family.id, maxSpanOf(family)]),
) as Record<CapacityFamilyId, number>;

const WALLET_JUMP_SLOTS = WALLET_SLOT_COUNT;

export {
  CAPACITY_FAMILY_INDEX,
  CAPACITY_FAMILY_LAST_TIER,
  WALLET_JUMP_SLOTS,
  WALLET_LADDER_LAST,
  WALLET_VIRT_FIRST,
  WALLET_VIRT_LAST,
};
