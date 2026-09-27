/* @layer shared-game @kind logic */
/**
 * The numbers the six primitive helpers read, for one world: each capacity family's ladder,
 * the rung a new file stands on, the item for each jump and the planned jumps of its
 * progressive item, plus the items the meter, bottle and heart readings count. The loader's
 * primitives are the arithmetic of state-helpers-capacity.ts, state-helpers.ts and
 * rules/heart-capacity.ts over these tables and nothing else.
 */
import { ITEM, UNRECORDED } from '../../world/item-ids.data';
import { REGION } from '../../world/region-ids.data';
import { BOTTLE_ITEMS } from '../../world/item-groups';
import { BASELINE } from '../../world/state-helpers';
import { meterConsumingItems } from '../../world/item-usability';
import { FAMILIES } from '../../world/capacity/capacity-family';
import { REFERENCE_CAPACITY_PROFILE } from '../../world/capacity/capacity-profile-defaults';
import { planOf, startTierOf } from '../../world/capacity/family-plan';
import type { World } from '../../world/world.type';
import type { CapacityFamily } from '../../world/capacity/capacity-family';
import type { FamilySetting } from '../../world/capacity/capacity-profile.type';
import type { CapacityFamilyData, PrimitiveData } from './export.type';

const familyData = (capacityFamily: CapacityFamily, setting: FamilySetting): CapacityFamilyData => ({
  mode: setting.mode,
  ladder: capacityFamily.ladder,
  vanillaRung: capacityFamily.vanillaRung,
  startTier: startTierOf(capacityFamily, setting),
  jumpItems: Array.from({ length: capacityFamily.maxJump }, (_unused, index) => capacityFamily.itemFor(index + 1)),
  progressiveItem: capacityFamily.progressiveItem,
  planJumps: setting.mode === 'custom' ? planOf(capacityFamily, setting).jumps : [],
});

const primitiveDataOf = (world: World): PrimitiveData => {
  const profile = world.options.capacity ?? REFERENCE_CAPACITY_PROFILE;
  const families = Object.fromEntries(
    FAMILIES.map((capacityFamily) => [capacityFamily.id, familyData(capacityFamily, profile[capacityFamily.id])]),
  ) as PrimitiveData['families'];
  return {
    families,
    shopEvent: UNRECORDED.capacityShopEvent,
    meterHalf: ITEM.magicUpgradeHalf,
    meterQuarter: ITEM.magicUpgradeQuarter,
    meterItems: [...meterConsumingItems()].sort(),
    bottles: BOTTLE_ITEMS,
    bottleLimit: BASELINE.progressiveBottleLimit,
    hearts: {
      container: ITEM.bossHeartContainer,
      sanctuary: ITEM.sanctuaryHeartContainer,
      piece: ITEM.pieceOfHeart,
      start: BASELINE.startingHearts,
      containerCap: BASELINE.logicalHeartContainers,
      pieceCap: BASELINE.logicalHeartPieces,
    },
    potionSeller: REGION.potionSeller,
  };
};

export { primitiveDataOf };
