/* @layer renderer-lib @kind logic */
/**
 * The creation form's randomizer choices ⇄ the catalog option keys they
 * stand for. ONE reading, shared by the live options panel (which snapshots
 * the choices on every edit to recompute the In Pool column and the totals)
 * and by the profile writer that freezes the same snapshot onto disk.
 *
 * Keeping both on this module is the point. When each built its own override
 * list, a row added to one and forgotten in the other froze silently. The
 * control moved, the snapshot kept the baseline, and nothing downstream ever
 * saw the change. For the same reason the plain scalar rows are declared as
 * ONE key → field map that drives both directions: the panel reads a row's
 * value through it and the snapshot writes that row through it, so there is
 * no second list that could disagree.
 */
import { ACCESSIBILITY_KEY } from '@shared/randomizer/ap-world/accessibility/accessibility-from-snapshot';
import {
  CAPACITY_ENABLED_KEY, CAPACITY_PROGRESSIVE_KEY, DEFAULT_CAPACITY_BONUS, capacityBonusValuesOf, capacityValuesOf,
} from '@shared/randomizer/ap-world/capacity';
import { reconcileCapacityPond } from '@shared/randomizer/ap-world/capacity-pond';
import { darkRoomLightKeyOf, DARK_ROOM_REQUIRED_KEY } from '@shared/randomizer/ap-world/dark-rooms/dark-room-option-keys';
import { difficultyValuesOf } from '@shared/randomizer/ap-world/difficulty/difficulty-from-snapshot';
import { DUNGEON_ITEM_OPTION_KEYS } from '@shared/randomizer/ap-world/dungeon-items/dungeon-item-modes';
import { itemPowerValuesOf } from '@shared/randomizer/ap-world/item-power/item-power-from-snapshot';
import { potionPriceOverrides } from '@shared/randomizer/ap-world/potion-price';
import { progressiveValuesOf } from '@shared/randomizer/ap-world/progressive/progressive-from-snapshot';
import { progressiveModeValuesOf } from '@shared/randomizer/ap-world/progressive/progressive-mode-from-snapshot';
import { retroBowValuesOf } from '@shared/randomizer/ap-world/retro/retro-from-snapshot';
import { pondValuesOf } from '@shared/randomizer/ap-world/pond/pond-from-snapshot';
import { INCLUDE_NPC_CHECKS_KEY, INCLUDE_WORLD_ITEMS_KEY } from '@shared/randomizer/ap-world/scope-option-keys';
import { shopScopeValues } from '@shared/randomizer/ap-world/shops/shop-scope-from-values';
import { buildOptionsSnapshot } from '@shared/randomizer/options-snapshot';
import type { AccessibilityMode } from '@shared/randomizer/ap-world/accessibility/accessibility.type';
import type { CapacityBonusSetting, CapacityProfile } from '@shared/randomizer/ap-world/capacity';
import type { CapacityPondSelection } from '@shared/randomizer/ap-world/capacity-pond';
import type { DifficultySetting } from '@shared/randomizer/ap-world/difficulty/difficulty.type';
import type { DungeonItemMode } from '@shared/randomizer/ap-world/dungeon-items/dungeon-item.type';
import type { ItemPowerSetting } from '@shared/randomizer/ap-world/item-power/item-power.type';
import type { ProgressiveModeSetting, ProgressiveSetting } from '@shared/randomizer/ap-world/progressive/progressive.type';
import type { RetroBowSetting } from '@shared/randomizer/ap-world/retro/retro.type';
import type { ApOptionValue, RandomizerOptionsSnapshot } from '@shared/randomizer/ap-world/options.type';
import type { PondSetting } from '@shared/randomizer/ap-world/pond/pond-profile.type';
import type { ShopScope } from '@shared/randomizer/ap-world/shops/shop-scope.type';

interface RandomizerOptionChoices {
  keyDropShuffle: boolean;
  includeNpcChecks: boolean;
  includeWorldItems: boolean;
  /**
   * How far each dungeon-flavoured family may travel. One field per family
   * instead of one object: the four are separate catalog rows the player sets
   * apart, and each reaches the generator through its own source key.
   */
  bigKeyShuffle: DungeonItemMode;
  smallKeyShuffle: DungeonItemMode;
  compassShuffle: DungeonItemMode;
  mapShuffle: DungeonItemMode;
  /**
   * What the shops are asked for: the shuffle mode, which slots may be
   * shuffled, how many of them a counted mode opens, and how deep each stocks.
   * One field for the whole shop scope, so its ~34 catalog rows are wired here
   * in ONE line instead of listed twice.
   */
  shops: ShopScope;
  /** The shop-price rows, by catalog key. The block owns their whole set. */
  shopPrices: Readonly<Record<string, ApOptionValue>>;
  shufflePrizes: boolean;
  /** The master switch: off leaves all four families vanilla and the pond native. */
  capacityEnabled: boolean;
  capacity: CapacityProfile;
  /** Pickups climb each Custom family's ladder in order. */
  capacityProgressive: boolean;
  /** What a pickup hands over beside its ceiling; one field for all eight rows, wired here once. */
  capacityBonus: CapacityBonusSetting;
  /** What the rupee pond sells; the legacy setting leaves it exactly as it was. */
  pond: PondSetting;
  /**
   * Which tiers of each progressive family exist. One field for the whole set,
   * so its thirteen catalog rows are wired here in ONE line instead of listed
   * twice, and unticking every blade rung is what the retired swordless row
   * used to say.
   */
  progressiveTiers: ProgressiveSetting;
  /**
   * How each family's copies arrive: in order, or the rungs themselves in any
   * order. One field for all five rows, on the same terms as the ticks above.
   */
  progressiveModes: ProgressiveModeSetting;
  /** The retro switch and the two per-shot costs, one field for the whole block. */
  retroBow: RetroBowSetting;
  /**
   * How many copies of each tiered family the seed carries, and how high the
   * hearts climb. One field for all six rows, on the same terms as the ticks:
   * the block owns them, so they are wired here once instead of listed twice.
   */
  difficulty: DifficultySetting;
  /** The seven item-power switches, one field for the whole set. */
  itemPower: ItemPowerSetting;
  /** How much of the seed has to be reachable for it to count as valid. */
  accessibility: AccessibilityMode;
  /** Must an unlit room be lit to count as passable? */
  darkRoomLightRequired: boolean;
  /** The four lights, one field each; the lamp alone is the reference reading. */
  darkRoomLightLamp: boolean;
  darkRoomLightFireRod: boolean;
  darkRoomLightBombos: boolean;
  darkRoomLightRedCane: boolean;
}

/** Every plain unlocked option that maps to one creation-form field. */
type ChoiceField = Exclude<
  keyof RandomizerOptionChoices,
  'capacity' | 'capacityBonus' | 'capacityEnabled' | 'capacityProgressive' | 'difficulty' | 'itemPower' | 'pond'
  | 'progressiveTiers' | 'progressiveModes' | 'retroBow' | 'shopPrices' | 'shops'
>;

/**
 * Catalog key → creation-form field, one row per plain unlocked option, and
 * the only place that correspondence is written down. A new plain unlocked
 * option is one line here plus its field on the choices.
 */
const PLAIN_FIELD_BY_KEY: Readonly<Record<string, ChoiceField>> = {
  key_drop_shuffle: 'keyDropShuffle',
  [INCLUDE_NPC_CHECKS_KEY]: 'includeNpcChecks',
  [INCLUDE_WORLD_ITEMS_KEY]: 'includeWorldItems',
  dungeon_prize_shuffle: 'shufflePrizes',
  [DUNGEON_ITEM_OPTION_KEYS.bigKey]: 'bigKeyShuffle',
  [DUNGEON_ITEM_OPTION_KEYS.smallKey]: 'smallKeyShuffle',
  [DUNGEON_ITEM_OPTION_KEYS.compass]: 'compassShuffle',
  [DUNGEON_ITEM_OPTION_KEYS.map]: 'mapShuffle',
  [ACCESSIBILITY_KEY]: 'accessibility',
  [DARK_ROOM_REQUIRED_KEY]: 'darkRoomLightRequired',
  [darkRoomLightKeyOf('lamp')]: 'darkRoomLightLamp',
  [darkRoomLightKeyOf('fireRod')]: 'darkRoomLightFireRod',
  [darkRoomLightKeyOf('bombos')]: 'darkRoomLightBombos',
  [darkRoomLightKeyOf('redCane')]: 'darkRoomLightRedCane',
};

/**
 * The numeric fields, so a slider row writes a number and a toggle row a
 * boolean. Empty while every plain row is a toggle, because the shop sliders moved
 * into the shop block, which writes their values through the scope.
 */
const NUMERIC_FIELDS: ReadonlySet<ChoiceField> = new Set([]);

/**
 * The fields a SELECT row writes, so its chosen key is stored as the string
 * the catalog offered instead of being coerced to a boolean.
 */
const CHOICE_FIELDS: ReadonlySet<ChoiceField> = new Set<ChoiceField>([
  'accessibility', 'bigKeyShuffle', 'smallKeyShuffle', 'compassShuffle', 'mapShuffle',
]);

/**
 * The pair the capacity/pond rule reads, lifted off the choices. The retro
 * switch rides along because it pins the projectiles family (the rule masks
 * it); a choices object that never carried the retro block reads as off.
 */
const capacityPondOf = (choices: RandomizerOptionChoices): CapacityPondSelection => ({
  enabled: choices.capacityEnabled,
  capacity: choices.capacity,
  pond: choices.pond,
  retroBow: choices.retroBow?.enabled === true,
});

/** The plain scalar rows, read off the one map above. */
const plainOverrides = (choices: RandomizerOptionChoices): Record<string, ApOptionValue> =>
  Object.fromEntries(Object.entries(PLAIN_FIELD_BY_KEY).map(([key, field]) => [key, choices[field]]));

/**
 * Every catalog key these choices decide, with the value chosen for it. Two
 * dependency rules run here instead of at the controls, so a pair the panel
 * somehow left contradicting each other still freezes as a playable seed: the
 * capacity families and the pond are settled together (the upgrades always
 * exist somewhere), and a bottle content whose cauldron went to the shuffle
 * is masked off the player's own price rows. Both are masks, not rewrites,
 * the choices keep what the player asked for, so untying either dependency
 * gives their setting straight back.
 */
const randomizerChoiceOverrides = (
  choices: RandomizerOptionChoices,
): Readonly<Record<string, ApOptionValue>> => {
  const { enabled, capacity, pond } = reconcileCapacityPond(capacityPondOf(choices));
  return {
    ...plainOverrides(choices),
    ...shopScopeValues(choices.shops),
    ...choices.shopPrices,
    ...potionPriceOverrides(choices.shops),
    [CAPACITY_ENABLED_KEY]: enabled,
    ...capacityValuesOf(capacity),
    [CAPACITY_PROGRESSIVE_KEY]: choices.capacityProgressive,
    // A choices object that never carried the bonus block reads as the baselines.
    ...capacityBonusValuesOf(choices.capacityBonus ?? DEFAULT_CAPACITY_BONUS),
    ...pondValuesOf(pond),
    ...progressiveValuesOf(choices.progressiveTiers),
    ...progressiveModeValuesOf(choices.progressiveModes),
    ...retroBowValuesOf(choices.retroBow),
    ...itemPowerValuesOf(choices.itemPower),
    ...difficultyValuesOf(choices.difficulty),
  };
};

/** The snapshot these choices freeze: what the panel reads and the profile stores. */
const snapshotOfChoices = (choices: RandomizerOptionChoices): RandomizerOptionsSnapshot =>
  buildOptionsSnapshot(randomizerChoiceOverrides(choices));

export {
  CHOICE_FIELDS, NUMERIC_FIELDS, PLAIN_FIELD_BY_KEY,
  capacityPondOf, randomizerChoiceOverrides, snapshotOfChoices,
};
export type { ChoiceField, RandomizerOptionChoices };
