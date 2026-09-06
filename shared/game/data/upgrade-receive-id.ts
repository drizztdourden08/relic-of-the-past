/* @layer shared-game @kind logic */
/**
 * Virtual receive ids for the counter upgrades — the TS half of the contract
 * in core/game-hooks/upgrade_grants.c and wallet_grants.c. The native grant
 * tables carry no id for the capacity/meter/wallet upgrades (their vanilla
 * grants are silent counter bumps inside scripted handlers), so an id space
 * ABOVE the native table is reserved for them: the core resolves such an id
 * at every substitution/receipt seam into the upgrade arithmetic plus a
 * native presentation item. A virtual id is grantable through every
 * override table and the receipt export, but is NOT a native id — keep the
 * two guards distinct where the difference matters.
 *
 *   0x50-0x57  explosives, jump of 1-8 tiers      (id = 0x50 + jump − 1)
 *   0x58-0x5F  projectiles, jump of 1-8 tiers     (id = 0x58 + jump − 1)
 *   0x60-0x61  meter, jump of 1-2 levels          (id = 0x60 + jump − 1)
 *   0x62-0x66  progressive equipment              (progressive-receive-id.ts, untouched)
 *   0x67-0x76  wallet, SLOT 0-15 into the session's jump table (wallet-jump-table.ts)
 *   0x77-0x7A  progressive capacity, one id per family (capacity-progressive-receive-id.ts)
 *
 * The three counted families keep a step per id (a jump never exceeds their
 * eight-rung span); the wallet's 100-rupee ladder needs jumps up to 100,
 * which a step-per-id scheme cannot hold below 0x80 — hence the slot table.
 */
import { isNativeReceiveId } from './native-receive-id';
import { isProgressiveReceiveId } from './progressive-receive-id';
import { isPrizeReceiveId } from './prize-receive-id';
import { isDungeonItemReceiveId } from './dungeon-item-receive-id';
import { upgradeItemName, upgradeItemOfName } from './capacity-upgrade-item';
import { WALLET_SLOT_COUNT, walletJumpOfSlot, walletSlotOfJump } from './wallet-jump-table';
import {
  PROGRESSIVE_CAPACITY_VIRT_LAST, isProgressiveCapacityReceiveId, progressiveCapacityFamilyOfReceiveId,
  progressiveCapacityItemNameOfReceiveId, progressiveCapacityReceiveIdOfName,
} from './capacity-progressive-receive-id';
import type { CapacityFamilyId, StepFamilyId } from './capacity-family.type';

const UPGRADE_VIRT_FIRST = 0x50;
const UPGRADE_VIRT_LAST = PROGRESSIVE_CAPACITY_VIRT_LAST;
const STEP_VIRT_LAST = 0x61;
const WALLET_VIRT_FIRST = 0x67;
const WALLET_VIRT_LAST = WALLET_VIRT_FIRST + WALLET_SLOT_COUNT - 1;

interface IdRange { first: number; last: number }

/** Step-per-id families: the id carries the jump directly. */
const STEP_RANGES: Readonly<Record<StepFamilyId, IdRange>> = {
  explosives: { first: 0x50, last: 0x57 },
  projectiles: { first: 0x58, last: 0x5f },
  meter: { first: 0x60, last: 0x61 },
};

const within = (id: number, range: IdRange): boolean => id >= range.first && id <= range.last;

const isWalletReceiveId = (id: number): boolean =>
  Number.isInteger(id) && id >= WALLET_VIRT_FIRST && id <= WALLET_VIRT_LAST;

/** Any virtual upgrade range; the progressive EQUIPMENT ids between them are NOT upgrades. */
const isUpgradeReceiveId = (id: number): boolean =>
  Number.isInteger(id) && ((id >= UPGRADE_VIRT_FIRST && id <= STEP_VIRT_LAST) || isWalletReceiveId(id)
    || isProgressiveCapacityReceiveId(id));

/** Grantable through the override/receipt seams: native, or any virtual range. */
const isGrantableReceiveId = (id: number): boolean =>
  isNativeReceiveId(id) || isUpgradeReceiveId(id) || isProgressiveReceiveId(id)
  || isPrizeReceiveId(id) || isDungeonItemReceiveId(id);

const upgradeFamilyOfReceiveId = (id: number): CapacityFamilyId | undefined => {
  if (isWalletReceiveId(id)) return 'wallet';
  if (isProgressiveCapacityReceiveId(id)) return progressiveCapacityFamilyOfReceiveId(id);
  for (const family of Object.keys(STEP_RANGES) as StepFamilyId[]) {
    if (within(id, STEP_RANGES[family])) return family;
  }
  return undefined;
};

/** Slot index of a wallet id, or undefined for any other id. */
const walletSlotOfReceiveId = (id: number): number | undefined =>
  isWalletReceiveId(id) ? id - WALLET_VIRT_FIRST : undefined;

/**
 * Virtual id carrying this jump: step-per-id for the counted families, the
 * slot holding the jump for the wallet (throws when the table lacks it).
 */
const upgradeReceiveIdOf = (
  family: CapacityFamilyId, jump: number, walletTable: readonly number[] = [],
): number => {
  if (family === 'wallet') {
    const slot = walletSlotOfJump(walletTable, jump);
    if (slot === undefined) throw new Error(`wallet jump ${jump} is not in the session's jump table`);
    return WALLET_VIRT_FIRST + slot;
  }
  const range = STEP_RANGES[family];
  if (!Number.isInteger(jump) || jump < 1 || range.first + jump - 1 > range.last) {
    throw new Error(`${family}: no virtual id carries a jump of ${jump}`);
  }
  return range.first + jump - 1;
};

/**
 * Jump carried by a virtual id (the wallet through the session table; unarmed
 * slot ⇒ undefined). A progressive id carries none: its jump is the plan's.
 */
const upgradeJumpOfReceiveId = (id: number, walletTable: readonly number[] = []): number | undefined => {
  const family = upgradeFamilyOfReceiveId(id);
  if (family === undefined || isProgressiveCapacityReceiveId(id)) return undefined;
  if (family === 'wallet') return walletJumpOfSlot(walletTable, id - WALLET_VIRT_FIRST);
  return id - STEP_RANGES[family].first + 1;
};

/** Pool-item name → virtual receive id (wallet names need the session table). */
const upgradeReceiveIdOfName = (
  standardItemName: string, walletTable: readonly number[] = [],
): number | undefined => {
  const progressive = progressiveCapacityReceiveIdOfName(standardItemName);
  if (progressive !== undefined) return progressive;
  const item = upgradeItemOfName(standardItemName);
  if (item === undefined) return undefined;
  if (item.family === 'wallet' && walletSlotOfJump(walletTable, item.jump) === undefined) return undefined;
  return upgradeReceiveIdOf(item.family, item.jump, walletTable);
};

/** Virtual receive id → pool-item name (wallet through the session table). */
const upgradeItemNameOfReceiveId = (id: number, walletTable: readonly number[] = []): string | undefined => {
  if (isProgressiveCapacityReceiveId(id)) return progressiveCapacityItemNameOfReceiveId(id);
  const family = upgradeFamilyOfReceiveId(id);
  const jump = upgradeJumpOfReceiveId(id, walletTable);
  return family === undefined || jump === undefined ? undefined : upgradeItemName(family, jump);
};

/** Dataset item id → virtual receive id (the records carry no gameId for these). */
const UPGRADE_RECEIVE_ID_BY_ITEM: ReadonlyMap<string, number> = new Map([
  ['item-132', 0x50], // explosives, one tier
  ['item-133', 0x51], // explosives, two tiers
  ['item-134', 0x57], // explosives, the whole grid
  ['item-129', 0x58], // projectiles, one tier
  ['item-130', 0x59], // projectiles, two tiers
  ['item-131', 0x5f], // projectiles, the whole grid
  ['item-077', 0x60], // meter, one level
  ['item-135', 0x61], // meter, two levels
]);

const upgradeReceiveIdOfItem = (itemId: string): number | undefined =>
  UPGRADE_RECEIVE_ID_BY_ITEM.get(itemId);

export {
  UPGRADE_VIRT_FIRST,
  UPGRADE_VIRT_LAST,
  WALLET_VIRT_FIRST,
  WALLET_VIRT_LAST,
  isGrantableReceiveId,
  isUpgradeReceiveId,
  isWalletReceiveId,
  upgradeFamilyOfReceiveId,
  upgradeItemNameOfReceiveId,
  upgradeJumpOfReceiveId,
  upgradeReceiveIdOf,
  upgradeReceiveIdOfItem,
  upgradeReceiveIdOfName,
  walletSlotOfReceiveId,
};
