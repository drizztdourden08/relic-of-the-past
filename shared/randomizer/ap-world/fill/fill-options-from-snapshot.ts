/* @layer shared-game @kind logic */
/**
 * Snapshot → fill-world options, the one reading of the option keys the
 * generator and the pool accounting share, so the In Pool column and the
 * seed can never disagree about what a snapshot means. The deliverable sets
 * name the scope locations and fairy slots the app proved physically
 * deliverable; an absent set counts as empty (everything of that scope
 * stays locked vanilla).
 */
import { VANILLA_MEDALLIONS } from '../item-names.data';
import {
  capacityProfileFromSnapshot, capacityProgressiveFromSnapshot,
} from '../capacity/capacity-profile-from-snapshot';
import { capacityBonusFromSnapshot } from '../capacity/bonus/capacity-bonus-from-snapshot';
import { darkRoomSettingFromSnapshot } from '../dark-rooms/dark-room-from-snapshot';
import { includeNpcChecksOf, includeWorldItemsOf } from '../scope-option-keys';
import { difficultyFromSnapshot } from '../difficulty/difficulty-from-snapshot';
import { pondSettingFromSnapshot } from '../pond/pond-from-snapshot';
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
import type { DifficultySetting } from '../difficulty/difficulty.type';
import type { PondSetting } from '../pond/pond-profile.type';
import type { ItemPowerSetting } from '../item-power/item-power.type';
import type { ProgressiveModeSetting, ProgressiveSetting } from '../progressive/progressive.type';
import type { RetroBowSetting } from '../retro/retro.type';
import type { FillWorldOptions } from './fill-world.type';
import type { ShopScope } from '../shops/shop-scope.type';

interface DeliverableSets {
  npc?: ReadonlySet<string>;
  capacity?: ReadonlySet<string>;
  world?: ReadonlySet<string>;
}

interface SnapshotFillFlags {
  keyDropShuffle: boolean;
  includeNpcChecks: boolean;
  includeWorldItems: boolean;
  capacity: CapacityProfile;
  capacityProgressive: boolean;
  capacityBonus: CapacityBonusSetting;
  shops: ShopScope;
  pond: PondSetting;
  darkRooms: DarkRoomSetting;
  difficulty: DifficultySetting;
  progressiveTiers: ProgressiveSetting;
  progressiveModes: ProgressiveModeSetting;
  retroBow: RetroBowSetting;
  itemPower: ItemPowerSetting;
  dungeonItems: DungeonItemSetting;
  accessibility: AccessibilityMode;
}

type FillPickers = Pick<FillWorldOptions, 'pickBottle' | 'pickWeapon' | 'pickFiller'>;

const EMPTY_DELIVERABLE: ReadonlySet<string> = new Set();

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
    // No bonus row at all reads as the baselines: the goods a pickup handed
    // over before the rows existed.
    capacityBonus: capacityBonusFromSnapshot(snapshot),
    shops: withRetroArrowSlots(shopScopeOfValues(snapshot.values, seed), retroBow),
    retroBow,
    // No pond row at all (every profile written before the option existed)
    // reads as the legacy pond, so a stored placement keeps its meaning.
    pond: pondSettingFromSnapshot(snapshot),
    // No dark-room row at all, every profile written before the settings
    // existed, reads as the reference rule, so a stored placement keeps its
    // meaning: light required, the lamp alone providing it.
    darkRooms: darkRoomSettingFromSnapshot(snapshot),
    // No difficulty row at all (every profile written before they existed)
    // reads as the reference pool: one copy per rung and the game's own
    // twenty-heart ceiling, which is what it was rolled from.
    difficulty: difficultyFromSnapshot(snapshot),
    // No tier row at all (every profile written before they existed) reads
    // as every tier ticked, which is the reference pool it was rolled from.
    progressiveTiers: progressiveSettingFromSnapshot(snapshot),
    // No mode row at all reads as every family in order, which is the pool a
    // stored placement was rolled from.
    progressiveModes: progressiveModesFromSnapshot(snapshot),
    // No item-power row at all reads as the reference's normal step, so a
    // stored placement keeps the game it was rolled against.
    itemPower: itemPowerFromSnapshot(snapshot),
    // No dungeon-item rows at all, every profile frozen before the engine
    // read them, reads as the reference baseline: each family pinned to the
    // dungeon that owns it, which is how those placements were rolled.
    dungeonItems: dungeonItemSettingFromSnapshot(snapshot),
    // No accessibility row at all reads as this app's baseline, `full`, the
    // contract every stored placement was verified against.
    accessibility: accessibilityFromSnapshot(snapshot),
  };
};

/**
 * Whether the ten dungeon rewards are shuffled over the ten reward slots. Read here
 * instead of in the generator so every consumer of a snapshot reads the option once, the
 * same rule the flags above follow. Absent (any snapshot predating the option) is OFF, so
 * a stored placement keeps the vanilla rewards it was generated with.
 */
const shufflePrizesFromSnapshot = (snapshot: RandomizerOptionsSnapshot): boolean =>
  snapshot.values['dungeon_prize_shuffle'] === true;

/**
 * |seed| is the placement's own seed: the pond's gamble schedule is drawn from
 * it, so the same profile always sells the same winning throws. Every other
 * mode ignores it, which is why the live panel may read a snapshot with none.
 */
const fillOptionsFromSnapshot = (
  snapshot: RandomizerOptionsSnapshot, deliverable: DeliverableSets, pickers: FillPickers = {}, seed = '',
): FillWorldOptions => ({
  ...fillFlagsOf(snapshot, seed),
  pondSeed: seed,
  deliverableNpcLocations: deliverable.npc ?? EMPTY_DELIVERABLE,
  deliverableWorldLocations: deliverable.world ?? EMPTY_DELIVERABLE,
  deliverableCapacityLocations: deliverable.capacity ?? EMPTY_DELIVERABLE,
  medallions: { ...VANILLA_MEDALLIONS },
  ...pickers,
});

export { fillFlagsOf, fillOptionsFromSnapshot, shufflePrizesFromSnapshot };
export type { DeliverableSets, FillPickers, SnapshotFillFlags };
