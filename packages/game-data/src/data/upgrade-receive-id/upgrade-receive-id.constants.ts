/* @layer shared-game @kind constants */
import { PROGRESSIVE_CAPACITY_VIRT_LAST } from '../capacity-progressive-receive-id';
import { WALLET_SLOT_COUNT } from '../wallet-jump-table';
import type { StepFamilyId } from '../capacity-family.type';
import type { IdRange } from './upgrade-receive-id.type';

const UPGRADE_VIRT_FIRST = 0x50;
const UPGRADE_VIRT_LAST = PROGRESSIVE_CAPACITY_VIRT_LAST;
const STEP_VIRT_LAST = 0x61;
const WALLET_VIRT_FIRST = 0x67;
const WALLET_VIRT_LAST = WALLET_VIRT_FIRST + WALLET_SLOT_COUNT - 1;

const STEP_RANGES: Readonly<Record<StepFamilyId, IdRange>> = {
  explosives: { first: 0x50, last: 0x57 },
  projectiles: { first: 0x58, last: 0x5f },
  meter: { first: 0x60, last: 0x61 },
};

const UPGRADE_RECEIVE_ID_BY_ITEM: ReadonlyMap<string, number> = new Map([
  ['item-132', STEP_RANGES.explosives.first],
  ['item-133', STEP_RANGES.explosives.first + 1],
  ['item-134', STEP_RANGES.explosives.last],
  ['item-129', STEP_RANGES.projectiles.first],
  ['item-130', STEP_RANGES.projectiles.first + 1],
  ['item-131', STEP_RANGES.projectiles.last],
  ['item-077', STEP_RANGES.meter.first],
  ['item-135', STEP_RANGES.meter.first + 1],
]);

export {
  STEP_RANGES, STEP_VIRT_LAST, UPGRADE_RECEIVE_ID_BY_ITEM, UPGRADE_VIRT_FIRST, UPGRADE_VIRT_LAST, WALLET_VIRT_FIRST,
  WALLET_VIRT_LAST,
};
