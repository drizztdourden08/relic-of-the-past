/* @layer shared-game @kind types */
import type { RegionId } from '@shared/game/data/types/ids';
import type { ItemKey } from '../item-ids.data';
import type { LocationKey } from '../location-key.type';
import type { Holding } from '../collection-state.type';

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

interface OptionRef {
  option: RuleOptionKey;
}

interface SeedRef {
  seed: string;
}

type RuleCount = number | OptionRef | SeedRef;

type RuleArg = number | string | boolean | OptionRef | SeedRef;

type PrimitiveHelperName =
  | 'explosivesAtLeast' | 'projectilesAtLeast' | 'walletAtLeast' | 'heartCapacityAbove'
  | 'hasHearts' | 'canExtendMagic';

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

type HelperNode = Extract<RuleNode, { op: 'helper' }>;

export type {
  DerivedHelperName, HelperName, HelperNode, OptionRef, PrimitiveHelperName, RuleArg, RuleCount, RuleNode, RuleOp,
  RuleOptionKey, RuleOptionValue, SeedRef,
};
