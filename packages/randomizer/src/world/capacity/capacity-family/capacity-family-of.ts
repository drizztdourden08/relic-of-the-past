/* @layer shared-game @kind logic */
import { maxUpgradeJumpOf, upgradeItemName, progressiveCapacityItemName } from '@rotp/game-data';
import { VANILLA_RUNG } from '../capacity-ladders.constants';
import { itemKeyOfName } from '../../display-names/item-key-name';
import type { CapacityFamily, CapacityFamilySpec } from './capacity-family.type';

const capacityFamilyOf = (spec: CapacityFamilySpec): CapacityFamily => {
  const { id, label, ladder, referenceJumps, hasSpot, defaultCount } = spec;
  return {
    id,
    label,
    ladder,
    vanillaRung: VANILLA_RUNG[id],
    referenceJumps,
    hasSpot,
    defaultCount,
    indexOf: (value) => {
      const index = ladder.indexOf(value);
      if (index === -1) throw new Error(`${id}: ${value} is not on the ladder`);
      return index;
    },
    itemFor: (jump) => itemKeyOfName(upgradeItemName(id, jump)),
    progressiveItem: itemKeyOfName(progressiveCapacityItemName(id)),
    maxJump: maxUpgradeJumpOf(id),
  };
};

export { capacityFamilyOf };
