import type { Requirement } from '../../types/tracker';

// ─── Sword Checks ───

export const hasSword: Requirement = {
  or: ['Fighter Sword', 'Master Sword', 'Tempered Sword', 'Golden Sword'],
};

export const hasBeamSword: Requirement = {
  or: ['Master Sword', 'Tempered Sword', 'Golden Sword'],
};

// ─── Melee ───

export const hasMeleeWeapon: Requirement = {
  or: [hasSword, 'Hammer'],
};

// ─── Gloves ───

export const canLiftRocks: Requirement = {
  or: ['Power Glove', 'Titans Mitts'],
};

export const canLiftHeavyRocks: Requirement = 'Titans Mitts';

// ─── Ranged ───

export const canShootArrows: Requirement = {
  or: ['Bow', 'Silver Bow'],
};

// ─── Bombs (always available in vanilla open mode) ───

export const canUseBombs: Requirement = 'Bombs';

export const canBombOrBonk: Requirement = {
  or: ['Pegasus Boots', canUseBombs],
};

// ─── Fire / Ice ───

export const hasFireSource: Requirement = {
  or: ['Fire Rod', 'Lamp'],
};

export const canMeltThings: Requirement = {
  or: ['Fire Rod', { and: ['Bombos', hasSword] }],
};

// ─── Tablets ───

export const canRetrieveTablet: Requirement = {
  and: ['Book of Mudora', hasBeamSword],
};

// ─── Crystal Switch ───

export const canActivateCrystalSwitch: Requirement = {
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

export const canKillMostThings: Requirement = {
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

export const hasMiseryMireMedallion: Requirement = 'Ether';
export const hasTurtleRockMedallion: Requirement = 'Quake';

// ─── Crystal Count ───

export const hasCrystals = (n: number): Requirement => ({
  count: ['Crystals', n],
});
