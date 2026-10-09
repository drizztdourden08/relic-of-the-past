/* @layer renderer-lib @kind logic */
import type { MedallionId } from '@shared/randomizer/world/item-groups';
import { hasSword } from '@rotp/game-data';
import { ITEM_GROUP_IDS } from '@rotp/game-data';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { PedestalGate } from '@shared/randomizer/world/story-gates/story-gate.type';
import type { CheckId, Requirement } from '@rotp/game-data';
import { ALWAYS, LIGHT_WORLD_CLEARED, MOON_PEARL } from './record-row-inputs.constants';

const pedestalRequirement = (gate: PedestalGate | undefined): Requirement => {
  switch (gate) {
    case 'onePendant': return { count: { groupId: ITEM_GROUP_IDS.Pendants, n: 1 } };
    case 'twoPendants': return { count: { groupId: ITEM_GROUP_IDS.Pendants, n: 2 } };
    case 'lightWorldDungeons': return LIGHT_WORLD_CLEARED;
    case 'open': return ALWAYS;
    default: return { count: { groupId: ITEM_GROUP_IDS.Pendants, n: 3 } };
  }
};

const medallionRequirement = (medallion: MedallionId): Requirement => ({
  allOf: [{ itemId: MOON_PEARL }, hasSword, { itemId: medallion }],
});

const recordRowOverrides = (placement: Placement): Partial<Record<CheckId, Requirement>> => ({
  'check-312': pedestalRequirement(placement.stats.storyGates.pedestal),
  'check-344': medallionRequirement(placement.medallions.mire),
  'check-345': medallionRequirement(placement.medallions.turtleRock),
});

export { recordRowOverrides };
