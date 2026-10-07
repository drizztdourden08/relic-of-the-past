/* @layer bridge-wasm @kind constants */
/**
 * The TS half of the capacity-profile contract with core/game-hooks/capacity_profile.c
 * and wallet_grants.c: the family indices WasmSetCapacityProfile takes and each
 * family's last tier index on its ladder. The ladders and the wallet's virtual id
 * range are owned by the shared model (capacity-ladders.data.ts, upgrade-receive-id.ts,
 * wallet-jump-table.ts) and only re-exported here, so the bridge can never drift
 * from the pool, the names and the receipt export.
 */

import { WALLET_SLOT_COUNT, WALLET_VIRT_FIRST, WALLET_VIRT_LAST, isWalletReceiveId } from '@shared/game/data';
import { FAMILIES, WALLET_LADDER, WALLET_LADDER_LAST, maxSpanOf } from '@shared/randomizer/ap-world/capacity';
import type { CapacityFamilyId } from '@shared/game/data';

/** Family → the index WasmSetCapacityProfile addresses it by (the core's enum order). */
const CAPACITY_FAMILY_INDEX: Readonly<Record<CapacityFamilyId, number>> = {
  explosives: 0,
  projectiles: 1,
  meter: 2,
  wallet: 3,
};

/** Last rung per family: the eighth pond level, the bat's quarter setting, the wallet ladder top. */
const CAPACITY_FAMILY_LAST_TIER: Readonly<Record<CapacityFamilyId, number>> = Object.fromEntries(
  FAMILIES.map((family) => [family.id, maxSpanOf(family)]),
) as Record<CapacityFamilyId, number>;

/** Sixteen slots, 0x67-0x76. */
const WALLET_JUMP_SLOTS = WALLET_SLOT_COUNT;

/** The virtual receive id of wallet jump-table slot |slot| (0-15). */
const walletReceiveIdOfSlot = (slot: number): number => WALLET_VIRT_FIRST + slot;

/** Wallet ladder index i => cap 0, then 100 * i - 1; clamped to the ladder. */
const walletCapOfIndex = (index: number): number =>
  WALLET_LADDER[Math.min(WALLET_LADDER_LAST, Math.max(0, Math.trunc(index)))];

export {
  CAPACITY_FAMILY_INDEX,
  CAPACITY_FAMILY_LAST_TIER,
  WALLET_JUMP_SLOTS,
  WALLET_LADDER_LAST,
  WALLET_VIRT_FIRST,
  WALLET_VIRT_LAST,
  isWalletReceiveId,
  walletCapOfIndex,
  walletReceiveIdOfSlot,
};
