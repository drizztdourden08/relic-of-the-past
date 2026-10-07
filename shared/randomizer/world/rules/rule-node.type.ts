/* @layer shared-game @kind types */
/**
 * A rule as DATA: the tree every access rule of the randomizer is written in, so it can be read,
 * walked and exported as JSON (the Interpreter pattern: rule-eval.ts compiles a tree into the
 * closure the engine calls, and the closure is only a cache of the tree).
 *
 * The op set is kept to what the rules really ask. A leaf that reads the collection answers one
 * primitive question; anything that needs arithmetic over raw state (a capacity ladder, the
 * magic meter, the hearts) is a named HELPER with arguments, listed in helpers-registry.ts. A
 * leaf that reads the world's settings is an OPTION test against one named reading
 * (rule-options.ts), so a setting that changes a rule changes it inside the tree.
 *
 * Semantics, each one the engine's own reading:
 *  - has:          at least `count` copies (default 1), and USABLE (item-usability.ts);
 *  - hasAny:       any one of the items held and usable;
 *  - hasDistinct:  how many of the listed items are held and usable, at least `atLeast`;
 *  - countGroup:   the raw summed count of the listed items, usability ignored, at least `atLeast`;
 *  - all / any:    short-circuit, left to right;
 *  - if:           `cond ? then : else`;
 *  - region:       the region is reachable;
 *  - location:     the location exists, its region is reachable and its own rule holds;
 *  - exit:         the rule registered on that exit holds (an unruled exit holds);
 *  - placedAt:     the fill seam holds that item at that location;
 *  - option:       the named setting reading equals the value;
 *  - seed:         the named value of the world's seed table equals the value;
 *  - helper:       the named helper, asked with its arguments.
 * A count may name a setting reading instead of a number ({ option }), for the gates whose
 * number is a setting. A count, a helper argument or the item of a `has` may name a value of
 * the seed table ({ seed }): the numbers the app settles for one profile before any fill (a
 * shelf's price, a pond rung's demand), so a tree keeps one shape for every seed and the
 * values travel beside it (rules/seed-values.ts).
 */
import type { RegionId } from '@shared/game/data/types/ids';
import type { ItemKey } from '../item-ids.data';
import type { LocationKey } from '../location-key';
import type { Holding } from '../collection-state';

/** Every setting reading a rule may test (rule-options.ts reads each one off a world). */
type RuleOptionKey =
  | 'storyGates.pedestal' | 'storyGates.sahasrahla' | 'storyGates.barrier' | 'storyGates.bombShop'
  | 'storyGates.pyramidHole' | 'storyGates.tower.kind' | 'storyGates.tower.count'
  | 'storyGates.tower.crystals' | 'storyGates.ganon.kind' | 'storyGates.ganon.count'
  | 'storyGates.ganon.crystals'
  | 'darkRooms.requireLight' | 'darkRooms.light.lamp' | 'darkRooms.light.fireRod'
  | 'darkRooms.light.bombos' | 'darkRooms.light.redCane' | 'unlitEscapeExempt'
  | 'events.recordAttached'
  | 'itemPower.hammerTablets' | 'itemPower.swordlessMedallions' | 'itemPower.pullableCurtains'
  | 'itemPower.hammerLastFight' | 'itemPower.hammerTowerSeal'
  | 'progressive.swordless' | 'dungeonItems.keyFamilyPinned'
  | 'retroBow.enabled' | 'retroBow.quiverInPool' | 'retroBow.shotWalletNeed' | 'retroBow.walletNeed'
  | 'medallions.mire' | 'medallions.turtleRock';

type RuleOptionValue = string | number | boolean;

/** A number a setting decides, resolved against the world the rule is asked in. */
interface OptionRef {
  option: RuleOptionKey;
}

/** A value one profile settled before the fill, read off the world's seed table. */
interface SeedRef {
  seed: string;
}

type RuleCount = number | OptionRef | SeedRef;
type RuleArg = number | string | boolean | OptionRef | SeedRef;

/** Helpers that read raw state no primitive op can express. Python implements exactly these. */
type PrimitiveHelperName =
  | 'explosivesAtLeast' | 'projectilesAtLeast' | 'walletAtLeast' | 'heartCapacityAbove'
  | 'hasHearts' | 'canExtendMagic';

/** Helpers that are a tree of primitives, kept by name so the tables stay readable. */
type DerivedHelperName =
  | 'hasSword' | 'hasBeamSword' | 'hasMeleeWeapon' | 'canLiftRocks' | 'canLiftHeavyRocks'
  | 'hasFireSource' | 'canMeltThings' | 'canShootArrows' | 'canUseBombs' | 'canBombOrBonk'
  | 'hasCrystals' | 'canActivateCrystalSwitch' | 'canKillMostThings' | 'canKillStandardStart'
  | 'canGetGoodBee' | 'canRetrieveTablet' | 'canUseMedallion' | 'hasMireMedallion'
  | 'hasTurtleRockMedallion';

type HelperName = PrimitiveHelperName | DerivedHelperName;

type RuleNode =
  | { op: 'true' }
  | { op: 'false' }
  | { op: 'has'; item: Holding | SeedRef; count?: number }
  | { op: 'hasAny'; items: readonly Holding[] }
  | { op: 'hasDistinct'; items: readonly Holding[]; atLeast: RuleCount }
  | { op: 'countGroup'; items: readonly Holding[]; atLeast: RuleCount }
  | { op: 'all'; of: readonly RuleNode[] }
  | { op: 'any'; of: readonly RuleNode[] }
  | { op: 'if'; cond: RuleNode; then: RuleNode; else: RuleNode }
  | { op: 'region'; region: RegionId }
  | { op: 'location'; location: LocationKey }
  | { op: 'exit'; name: string }
  | { op: 'placedAt'; location: LocationKey; item: ItemKey }
  | { op: 'option'; key: RuleOptionKey; equals: RuleOptionValue }
  | { op: 'seed'; key: string; equals: RuleOptionValue }
  | { op: 'helper'; name: HelperName; args?: readonly RuleArg[] };

type RuleOp = RuleNode['op'];

export type {
  DerivedHelperName, HelperName, OptionRef, PrimitiveHelperName, RuleArg, RuleCount, RuleNode, RuleOp,
  RuleOptionKey, RuleOptionValue, SeedRef,
};
