import type { Requirement } from '../types';

// ─── Sword Checks ───

const hasSword: Requirement = {
  or: ['Fighter Sword', 'Master Sword', 'Tempered Sword', 'Golden Sword'],
};

const hasBeamSword: Requirement = {
  or: ['Master Sword', 'Tempered Sword', 'Golden Sword'],
};

// ─── Melee ───

const hasMeleeWeapon: Requirement = {
  or: [hasSword, 'Hammer'],
};

// ─── Gloves ───

const canLiftRocks: Requirement = {
  or: ['Power Glove', 'Titans Mitts'],
};

const canLiftHeavyRocks: Requirement = 'Titans Mitts';

// ─── Ranged ───

const canShootArrows: Requirement = {
  or: ['Bow', 'Silver Bow'],
};

// ─── Bombs (always available in vanilla open mode) ───

const canUseBombs: Requirement = 'Bombs';

const canBombOrBonk: Requirement = {
  or: ['Pegasus Boots', canUseBombs],
};

// ─── Fire / Ice ───

const hasFireSource: Requirement = {
  or: ['Fire Rod', 'Lamp'],
};

const canMeltThings: Requirement = {
  or: ['Fire Rod', { and: ['Bombos', hasSword] }],
};

// ─── Tablets ───

const canRetrieveTablet: Requirement = {
  and: ['Book of Mudora', hasBeamSword],
};

// ─── Crystal Switch ───

const canActivateCrystalSwitch: Requirement = {
  or: [
    hasSword,
    'Hammer',
    canUseBombs,
    canShootArrows,
    'Hookshot',
    'Cane of Somaria',
    'Cane of Byrna',
    'Fire Rod',
    'Ice Rod',
    'Blue Boomerang',
    'Red Boomerang',
  ],
};

// ─── Kill Most Things (non-enemizer) ───

const canKillMostThings: Requirement = {
  or: [
    hasMeleeWeapon,
    'Cane of Somaria',
    'Cane of Byrna',
    canShootArrows,
    'Fire Rod',
    canUseBombs,
  ],
};

// ─── Medallion Helpers ───
// In vanilla, Misery Mire requires Ether and Turtle Rock requires Quake.
// These are the fixed vanilla medallion requirements.

const hasMiseryMireMedallion: Requirement = 'Ether';
const hasTurtleRockMedallion: Requirement = 'Quake';

// ─── Crystal Count ───

const hasCrystals = (n: number): Requirement => ({
  count: ['Crystals', n],
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
  hasTurtleRockMedallion
};
