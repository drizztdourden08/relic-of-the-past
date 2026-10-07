/* @layer shared-game @kind logic */
/**
 * Snapshot → fill-world options, the one reading of the option keys the
 * generator and the pool accounting share, so the In Pool column and the
 * seed can never disagree about what a snapshot means. The deliverable sets
 * name the scope locations and fairy slots the app proved physically
 * deliverable; an absent set counts as empty (everything of that scope
 * stays locked vanilla).
 */
import type { LocationKey } from '../location-key';
import { VANILLA_MEDALLIONS } from '../item-groups';
import {
  capacityProfileFromSnapshot, capacityProgressiveFromSnapshot,
} from '../capacity/capacity-profile-from-snapshot';
import { capacityBonusFromSnapshot } from '../capacity/bonus/capacity-bonus-from-snapshot';
import { darkRoomSettingFromSnapshot } from '../dark-rooms/dark-room-from-snapshot';
import { includeNpcChecksOf, includeWorldItemsOf } from '../scope-option-keys';
import { difficultyFromSnapshot } from '../difficulty/difficulty-from-snapshot';
import { pondProfilesFromSnapshot } from '../pond/pond-profiles-from-snapshot';
import { itemPowerFromSnapshot } from '../item-power/item-power-from-snapshot';
import { progressiveSettingFromSnapshot } from '../progressive/progressive-from-snapshot';
import { progressiveModesFromSnapshot } from '../progressive/progressive-mode-from-snapshot';
import { retroBowFromSnapshot } from '../retro/retro-from-snapshot';
import { withRetroArrowSlots } from '../retro/retro-shops';
import { shopScopeOfValues } from '../shops/shop-scope-from-values';
import { accessibilityFromSnapshot } from '../accessibility/accessibility-from-snapshot';
import { dungeonItemSettingFromSnapshot } from '../dungeon-items/dungeon-item-from-snapshot';
import type { AccessibilityMode } from '../accessibility/accessibility.type';
import type { DungeonItemSetting } from '../dungeon-items/dungeon-item.type';
import type { RandomizerOptionsSnapshot } from '../options.type';
import type { CapacityProfile } from '../capacity/capacity-profile.type';
import type { CapacityBonusSetting } from '../capacity/bonus/capacity-bonus.type';
import type { DarkRoomSetting } from '../dark-rooms/dark-room.type';
import { storyGatesFromSnapshot } from '../story-gates/story-gate-from-snapshot';
import type { StoryGateSetting } from '../story-gates/story-gate.type';
import type { DifficultySetting } from '../difficulty/difficulty.type';
import type { PondProfiles } from '../pond/pond-profiles.type';
import type { ItemPowerSetting } from '../item-power/item-power.type';
import type { ProgressiveModeSetting, ProgressiveSetting } from '../progressive/progressive.type';
import type { RetroBowSetting } from '../retro/retro.type';
import type { FillWorldOptions } from './fill-world.type';
import type { ShopScope } from '../shops/shop-scope.type';

interface DeliverableSets {
  npc?: ReadonlySet<LocationKey>;
  capacity?: ReadonlySet<LocationKey>;
  world?: ReadonlySet<LocationKey>;
}

interface SnapshotFillFlags {
  keyDropShuffle: boolean;
  includeNpcChecks: boolean;
  includeWorldItems: boolean;
  capacity: CapacityProfile;
  capacityProgressive: boolean;
  capacityBonus: CapacityBonusSetting;
  shops: ShopScope;
  ponds: PondProfiles;
  pondSlotsFollowMode: boolean;
  darkRooms: DarkRoomSetting;
  storyGates: StoryGateSetting;
  difficulty: DifficultySetting;
  progressiveTiers: ProgressiveSetting;
  progressiveModes: ProgressiveModeSetting;
  retroBow: RetroBowSetting;
  itemPower: ItemPowerSetting;
  dungeonItems: DungeonItemSetting;
  accessibility: AccessibilityMode;
}

type FillPickers = Pick<FillWorldOptions, 'pickBottle' | 'pickWeapon' | 'pickFiller'>;

const EMPTY_DELIVERABLE: ReadonlySet<LocationKey> = new Set();

/**
 * |seed| is the placement's own seed; the random shop mode draws its slots
 * from it and stores it on the scope, so a session rebuilding the scope opens
 * the identical shelves. Every other mode ignores it, which is why the live
 * panel may read a snapshot with none.
 */
const fillFlagsOf = (snapshot: RandomizerOptionsSnapshot, seed = ''): SnapshotFillFlags => {
  const includeNpcChecks = includeNpcChecksOf(snapshot.values);
  // Under retro no shop may still be selling arrows, so the arrow shelves open
  // whatever the mode drew and the scope every consumer sees is the one the
  // seed is really built from: the mode's own slots plus those shelves
  // (retro/retro-shops.ts). With retro off it is the scope untouched, so
  // nothing that came before it moves.
  const retroBow = retroBowFromSnapshot(snapshot);
  return {
    keyDropShuffle: snapshot.values['key_drop_shuffle'] !== false,
    includeNpcChecks,
    includeWorldItems: includeWorldItemsOf(snapshot.values),
    capacity: capacityProfileFromSnapshot(snapshot),
    capacityProgressive: capacityProgressiveFromSnapshot(snapshot),
    capacityBonus: capacityBonusFromSnapshot(snapshot),
    shops: withRetroArrowSlots(shopScopeOfValues(snapshot.values, seed), retroBow),
    retroBow,
    ponds: pondProfilesFromSnapshot(snapshot),
    // Every seed rolled from a snapshot lets a wish pond's mode decide her two
    // vanilla slots (pond/pond-vanilla-slots.ts).
    pondSlotsFollowMode: true,
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

/**
 * Whether the ten dungeon rewards are shuffled over the ten reward slots. Read here
 * instead of in the generator so every consumer of a snapshot reads the option once, the
 * same rule the flags above follow. Only an explicit false turns it off: an absent row is
 * its baseline.
 */
const shufflePrizesFromSnapshot = (snapshot: RandomizerOptionsSnapshot): boolean =>
  snapshot.values['dungeon_prize_shuffle'] !== false;

/** |seed| is the placement's own seed, which the rolled flags below are drawn from. */
const fillOptionsFromSnapshot = (
  snapshot: RandomizerOptionsSnapshot, deliverable: DeliverableSets, pickers: FillPickers = {}, seed = '',
): FillWorldOptions => ({
  ...fillFlagsOf(snapshot, seed),
  deliverableNpcLocations: deliverable.npc ?? EMPTY_DELIVERABLE,
  deliverableWorldLocations: deliverable.world ?? EMPTY_DELIVERABLE,
  deliverableCapacityLocations: deliverable.capacity ?? EMPTY_DELIVERABLE,
  medallions: { ...VANILLA_MEDALLIONS },
  ...pickers,
});

export { fillFlagsOf, fillOptionsFromSnapshot, shufflePrizesFromSnapshot };
export type { DeliverableSets, FillPickers, SnapshotFillFlags };
