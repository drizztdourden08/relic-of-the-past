/* @layer shared-game @kind constants */
import { helperRule } from '../combinators';

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

export {
  canActivateCrystalSwitch, canBombOrBonk, canGetGoodBee, canLiftHeavyRocks, canLiftRocks, canMeltThings,
  canRetrieveTablet, canUseMedallion, hasBeamSword, hasFireSource, hasMeleeWeapon, hasMireMedallion, hasSword,
  hasTurtleRockMedallion,
};
