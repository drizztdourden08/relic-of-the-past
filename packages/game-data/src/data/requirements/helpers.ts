/* @layer shared-game @kind data */
import type { Requirement } from '../types';

const FIGHTER_SWORD = 'item-074';
const MASTER_SWORD = 'item-002';
const TEMPERED_SWORD = 'item-003';
const GOLDEN_SWORD = 'item-004';
const FIRE_ROD = 'item-008';
const ICE_ROD = 'item-009';
const HAMMER = 'item-010';
const HOOKSHOT = 'item-011';
const BOW = 'item-012';
const BLUE_BOOMERANG = 'item-013';
const BOMBOS = 'item-016';
const QUAKE = 'item-018';
const LAMP = 'item-019';
const CANE_OF_SOMARIA = 'item-022';
const CANE_OF_BYRNA = 'item-025';
const POWER_GLOVE = 'item-028';
const TITANS_MITTS = 'item-029';
const BOOK_OF_MUDORA = 'item-030';
const BOMB_PICKUP = 'item-041';
const RED_BOOMERANG = 'item-043';
const SILVER_BOW = 'item-060';
const PEGASUS_BOOTS = 'item-076';

const hasSword: Requirement = {
  anyOf: [{ itemId: FIGHTER_SWORD }, { itemId: MASTER_SWORD }, { itemId: TEMPERED_SWORD }, { itemId: GOLDEN_SWORD }],
};

const hasBeamSword: Requirement = {
  anyOf: [{ itemId: MASTER_SWORD }, { itemId: TEMPERED_SWORD }, { itemId: GOLDEN_SWORD }],
};

const hasMeleeWeapon: Requirement = {
  anyOf: [hasSword, { itemId: HAMMER }],
};

const canLiftRocks: Requirement = {
  anyOf: [{ itemId: POWER_GLOVE }, { itemId: TITANS_MITTS }],
};

const canLiftHeavyRocks: Requirement = { itemId: TITANS_MITTS };

const canShootArrows: Requirement = {
  anyOf: [{ itemId: BOW }, { itemId: SILVER_BOW }],
};

const canUseBombs: Requirement = { itemId: BOMB_PICKUP };

const canBombOrBonk: Requirement = {
  anyOf: [{ itemId: PEGASUS_BOOTS }, canUseBombs],
};

const canSeeInDarkRooms: Requirement = { allOf: [{ itemId: LAMP }] };

const hasFireSource: Requirement = {
  anyOf: [{ itemId: FIRE_ROD }, { itemId: LAMP }],
};

const canMeltThings: Requirement = {
  anyOf: [{ itemId: FIRE_ROD }, { allOf: [{ itemId: BOMBOS }, hasSword] }],
};

const canRetrieveTablet: Requirement = {
  allOf: [{ itemId: BOOK_OF_MUDORA }, hasBeamSword],
};

const canActivateCrystalSwitch: Requirement = {
  anyOf: [
    hasSword,
    { itemId: HAMMER },
    canUseBombs,
    canShootArrows,
    { itemId: HOOKSHOT },
    { itemId: CANE_OF_SOMARIA },
    { itemId: CANE_OF_BYRNA },
    { itemId: FIRE_ROD },
    { itemId: ICE_ROD },
    { itemId: BLUE_BOOMERANG },
    { itemId: RED_BOOMERANG },
  ],
};

const canKillMostThings: Requirement = {
  anyOf: [
    hasMeleeWeapon,
    { itemId: CANE_OF_SOMARIA },
    { itemId: CANE_OF_BYRNA },
    canShootArrows,
    { itemId: FIRE_ROD },
    canUseBombs,
  ],
};

const hasTurtleRockMedallion: Requirement = { itemId: QUAKE };

export {
  canSeeInDarkRooms,
  canActivateCrystalSwitch,
  canBombOrBonk,
  canKillMostThings,
  canLiftHeavyRocks,
  canLiftRocks,
  canMeltThings,
  canRetrieveTablet,
  canShootArrows,
  canUseBombs,
  hasBeamSword,
  hasFireSource,
  hasMeleeWeapon,
  hasSword,
  hasTurtleRockMedallion,
};
