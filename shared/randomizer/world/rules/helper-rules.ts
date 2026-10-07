/* @layer shared-game @kind logic */
/**
 * The helpers as rules, for the tables to write with: each one asks the state helper of the same
 * name (helpers-registry.ts) and carries a `helper` leaf, so a table row reads the way it always
 * did and still exports as data. A helper that takes an argument is a factory, and an argument
 * left off takes the helper's own default, exactly as a bare state-helper call did.
 */
import { helperRule } from './combinators';
import type { Rule } from '../world.type';
import type { HelperName } from './rule-node.type';

/** The argument only when it was given, so the helper's own default decides otherwise. */
const withOptional = (name: HelperName, value: number | undefined): Rule =>
  (value === undefined ? helperRule(name) : helperRule(name, value));

const hasSword = helperRule('hasSword');
const hasBeamSword = helperRule('hasBeamSword');
const hasMeleeWeapon = helperRule('hasMeleeWeapon');
const canLiftRocks = helperRule('canLiftRocks');
const canLiftHeavyRocks = helperRule('canLiftHeavyRocks');
const hasFireSource = helperRule('hasFireSource');
const canMeltThings = helperRule('canMeltThings');
const canBombOrBonk = helperRule('canBombOrBonk');
const canActivateCrystalSwitch = helperRule('canActivateCrystalSwitch');
const canGetGoodBee = helperRule('canGetGoodBee');
const canRetrieveTablet = helperRule('canRetrieveTablet');
const canUseMedallion = helperRule('canUseMedallion');
const hasMireMedallion = helperRule('hasMireMedallion');
const hasTurtleRockMedallion = helperRule('hasTurtleRockMedallion');

/** python can_shoot_arrows(count). */
const arrows = (count?: number): Rule => withOptional('canShootArrows', count);
/** python can_use_bombs(quantity). */
const bombs = (quantity?: number): Rule => withOptional('canUseBombs', quantity);
/** python can_extend_magic(smallmagic). */
const magic = (smallmagic?: number): Rule => withOptional('canExtendMagic', smallmagic);
/** python can_kill_most_things(enemies). */
const kill = (enemies?: number): Rule => withOptional('canKillMostThings', enemies);
/** python can_kill_standard_start(enemies). */
const killStart = (enemies?: number): Rule => withOptional('canKillStandardStart', enemies);
/** python has_hearts(count). */
const hearts = (count: number): Rule => helperRule('hasHearts', count);
/** python has_crystals(count). */
const crystals = (count: number): Rule => helperRule('hasCrystals', count);

export {
  arrows,
  bombs,
  canActivateCrystalSwitch,
  canBombOrBonk,
  canGetGoodBee,
  canLiftHeavyRocks,
  canLiftRocks,
  canMeltThings,
  canRetrieveTablet,
  canUseMedallion,
  crystals,
  hasBeamSword,
  hasFireSource,
  hasMeleeWeapon,
  hasMireMedallion,
  hasSword,
  hasTurtleRockMedallion,
  hearts,
  kill,
  killStart,
  magic,
};
