/* @layer shared-game @kind logic */
import type { Requirement } from '../types';
import { ITEM_GROUP_IDS } from '../item-groups';

const hasCrystals = (n: number): Requirement => ({
  count: { groupId: ITEM_GROUP_IDS.Crystals, n },
});

export { hasCrystals };
