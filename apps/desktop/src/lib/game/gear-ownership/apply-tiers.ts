/* @layer bridge-wasm @kind logic */
import { getPlatform } from '@drizztdourden08/brock-react';
import { writeJson } from '@drizztdourden08/brock-core';
import type { GearTiers, SlotRecord } from './gear-ownership.type';
import { NO_GEAR, PINNED_SLOT_KEY } from './gear-ownership.constants';
import { gearOwnershipState } from './gear-ownership-state';
import { gearOwnershipPath } from './gear-ownership-path';
import { raiseTiers } from './raise-tiers';

const sameTiers = (a: GearTiers, b: GearTiers): boolean =>
  a.sword === b.sword && a.shield === b.shield && a.mail === b.mail && a.bow === b.bow;

const persist = (id: string, next: SlotRecord): void => {
  gearOwnershipState.writeQueue = gearOwnershipState.writeQueue
    .then(() => writeJson(getPlatform().files, gearOwnershipPath(id), next))
    .catch(() => undefined);
};

const applyTiers = (id: string, tiers: GearTiers): void => {
  const current: GearTiers = { ...NO_GEAR, ...gearOwnershipState.record[PINNED_SLOT_KEY] };
  const next = raiseTiers(current, tiers);
  if (sameTiers(current, next)) return;
  gearOwnershipState.record = { ...gearOwnershipState.record, [PINNED_SLOT_KEY]: next };
  persist(id, gearOwnershipState.record);
};

export { applyTiers };
