/* @layer shared-game @kind types */
import type {
  HelperNode as WorldHelperNode, RuleArg as WorldRuleArg,
  RuleCount as WorldRuleCount, RuleNode as WorldRuleNode, RuleOptionValue,
} from '@drizztdourden08/brock-randomizer/world';
import type { RotpKeys } from '../rotp-keys.type';

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

type RuleCount = WorldRuleCount<RotpKeys>;

type RuleArg = WorldRuleArg<RotpKeys>;

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

type RuleNode = WorldRuleNode<RotpKeys>;

type HelperNode = WorldHelperNode<RotpKeys>;

export type {
  HelperName, HelperNode, RuleArg, RuleCount, RuleNode, RuleOptionKey, RuleOptionValue,
};
