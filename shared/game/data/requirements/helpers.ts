/* @layer shared-game @kind data */
import type { Requirement } from '../types';

// ─── Sword Checks ───

const hasSword: Requirement = {
  anyOf: [{ itemId: 'item-074' }, { itemId: 'item-002' }, { itemId: 'item-003' }, { itemId: 'item-004' }],
};

const hasBeamSword: Requirement = {
  anyOf: [{ itemId: 'item-002' }, { itemId: 'item-003' }, { itemId: 'item-004' }],
};

// ─── Melee ───

const hasMeleeWeapon: Requirement = {
  anyOf: [hasSword, { itemId: 'item-010' }], // Hammer
};

// ─── Gloves ───

const canLiftRocks: Requirement = {
  anyOf: [{ itemId: 'item-028' }, { itemId: 'item-029' }], // Power Glove / Titans Mitts
};

const canLiftHeavyRocks: Requirement = { itemId: 'item-029' }; // Titans Mitts

// ─── Ranged ───

const canShootArrows: Requirement = {
  anyOf: [{ itemId: 'item-012' }, { itemId: 'item-060' }], // Bow / Silver Bow
};

// ─── Bombs ───
// No dedicated "own the ability to use bombs" ItemRecord exists in the catalog
// (only the refill pickups — see item-041/item-050). This uses the initial
// bomb-bag pickup as the best-available proxy; flagged in the migration report
// for a real capability item to be added to the catalog.
const canUseBombs: Requirement = { itemId: 'item-041' };

const canBombOrBonk: Requirement = {
  anyOf: [{ itemId: 'item-076' }, canUseBombs], // Pegasus Boots
};

// ─── Fire / Ice ───

const hasFireSource: Requirement = {
  anyOf: [{ itemId: 'item-008' }, { itemId: 'item-019' }], // Fire Rod / Lamp
};

const canMeltThings: Requirement = {
  anyOf: [{ itemId: 'item-008' }, { allOf: [{ itemId: 'item-016' }, hasSword] }], // Fire Rod / (Bombos + sword)
};

// ─── Tablets ───

const canRetrieveTablet: Requirement = {
  allOf: [{ itemId: 'item-030' }, hasBeamSword], // Book of Mudora
};

// ─── Crystal Switch ───

const canActivateCrystalSwitch: Requirement = {
  anyOf: [
    hasSword,
    { itemId: 'item-010' }, // Hammer
    canUseBombs,
    canShootArrows,
    { itemId: 'item-011' }, // Hookshot
    { itemId: 'item-022' }, // Cane of Somaria
    { itemId: 'item-025' }, // Cane of Byrna
    { itemId: 'item-008' }, // Fire Rod
    { itemId: 'item-009' }, // Ice Rod
    { itemId: 'item-013' }, // Blue Boomerang
    { itemId: 'item-043' }, // Red Boomerang
  ],
};

// ─── Kill Most Things (non-enemizer) ───

const canKillMostThings: Requirement = {
  anyOf: [
    hasMeleeWeapon,
    { itemId: 'item-022' }, // Cane of Somaria
    { itemId: 'item-025' }, // Cane of Byrna
    canShootArrows,
    { itemId: 'item-008' }, // Fire Rod
    canUseBombs,
  ],
};

// ─── Medallion Helpers ───
// In vanilla, Misery Mire requires Ether and Turtle Rock requires Quake.
// These are the fixed vanilla medallion requirements.

const hasMiseryMireMedallion: Requirement = { itemId: 'item-017' }; // Ether
const hasTurtleRockMedallion: Requirement = { itemId: 'item-018' }; // Quake

// ─── Crystal Count ───

const hasCrystals = (n: number): Requirement => ({
  count: { groupId: 'Crystals', n },
});

export {
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
  hasCrystals,
  hasFireSource,
  hasMeleeWeapon,
  hasMiseryMireMedallion,
  hasSword,
  hasTurtleRockMedallion,
};
