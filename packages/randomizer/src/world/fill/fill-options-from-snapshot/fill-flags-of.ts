/* @layer shared-game @kind logic */
import {
  capacityProfileFromSnapshot, capacityProgressiveFromSnapshot,
} from '../../capacity/capacity-profile-from-snapshot';
import { capacityBonusFromSnapshot } from '../../capacity/bonus/capacity-bonus-from-snapshot';
import { darkRoomSettingFromSnapshot } from '../../dark-rooms/dark-room-from-snapshot';
import { includeNpcChecksOf, includeWorldItemsOf } from '../../scope-option-keys';
import { difficultyFromSnapshot } from '../../difficulty/difficulty-from-snapshot';
import { pondProfilesFromSnapshot } from '../../pond/pond-profiles-from-snapshot';
import { itemPowerFromSnapshot } from '../../item-power/item-power-from-snapshot';
import { progressiveSettingFromSnapshot } from '../../progressive/progressive-from-snapshot';
import { progressiveModesFromSnapshot } from '../../progressive/progressive-mode-from-snapshot';
import { retroBowFromSnapshot } from '../../retro/retro-from-snapshot';
import { withRetroArrowSlots } from '../../retro/retro-shops';
import { shopScopeOfValues } from '../../shops/shop-scope-from-values';
import { accessibilityFromSnapshot } from '../../accessibility/accessibility-from-snapshot';
import { dungeonItemSettingFromSnapshot } from '../../dungeon-items/dungeon-item-from-snapshot';
import { storyGatesFromSnapshot } from '../../story-gates/story-gate-from-snapshot';
import { POND_SLOTS_FOLLOW_MODE_FROM_SNAPSHOT } from '../fill.constants';
import type { RandomizerOptionsSnapshot } from '../../options.type';
import type { SnapshotFillFlags } from '../fill.type';

const fillFlagsOf = (snapshot: RandomizerOptionsSnapshot, shopSeed = ''): SnapshotFillFlags => {
  const retroBow = retroBowFromSnapshot(snapshot);
  return {
    keyDropShuffle: snapshot.values['key_drop_shuffle'] !== false,
    includeNpcChecks: includeNpcChecksOf(snapshot.values),
    includeWorldItems: includeWorldItemsOf(snapshot.values),
    capacity: capacityProfileFromSnapshot(snapshot),
    capacityProgressive: capacityProgressiveFromSnapshot(snapshot),
    capacityBonus: capacityBonusFromSnapshot(snapshot),
    shops: withRetroArrowSlots(shopScopeOfValues(snapshot.values, shopSeed), retroBow),
    retroBow,
    ponds: pondProfilesFromSnapshot(snapshot),
    pondSlotsFollowMode: POND_SLOTS_FOLLOW_MODE_FROM_SNAPSHOT,
    darkRooms: darkRoomSettingFromSnapshot(snapshot),
    storyGates: storyGatesFromSnapshot(snapshot),
    difficulty: difficultyFromSnapshot(snapshot),
    progressiveTiers: progressiveSettingFromSnapshot(snapshot),
    progressiveModes: progressiveModesFromSnapshot(snapshot),
    itemPower: itemPowerFromSnapshot(snapshot),
    dungeonItems: dungeonItemSettingFromSnapshot(snapshot),
    accessibility: accessibilityFromSnapshot(snapshot),
  };
};

export { fillFlagsOf };
