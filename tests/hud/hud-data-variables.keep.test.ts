/* @layer test @kind test */
/**
 * The flat variable table: the exact fifteen names the plan's data-surface
 * section lists, the three scope extras kept OUT of the table proper, and the
 * scope-builder that turns the HUD's existing vitals fields into the numbers
 * an expression actually evaluates against.
 */
import { describe, expect, it } from 'vitest';
import {
  HUD_SCOPE_EXTRAS, HUD_VARIABLES, hudDataScope, hudVariableNamesFor, isHudScopeExtra, isHudVariableName,
  suggestVariableName,
} from '@shared/hud/data';
import type { HudVitalsSource } from '@shared/hud/data';

const PLAN_VARIABLES = [
  'life_current', 'life_max', 'magic_current', 'magic_max', 'half_magic', 'armor',
  'arrow_current', 'arrow_max', 'bomb_current', 'bomb_max', 'key_current',
  'rupee_current', 'rupee_max', 'silver_arrows', 'slot_count',
];

describe('the table matches the plan, name for name', () => {
  it('is exactly the fifteen documented variables, one entry each', () => {
    expect(HUD_VARIABLES.map((entry) => entry.name)).toEqual(PLAN_VARIABLES);
    HUD_VARIABLES.forEach((entry) => expect(entry.note.length).toBeGreaterThan(0));
  });

  it('every table name reports as known; nothing else does', () => {
    PLAN_VARIABLES.forEach((name) => expect(isHudVariableName(name)).toBe(true));
    expect(isHudVariableName('index')).toBe(false);
    expect(isHudVariableName('nonsense')).toBe(false);
  });
});

describe('index/count/item are scope extras, never table entries', () => {
  it('are exactly the three named in the plan', () => {
    expect(HUD_SCOPE_EXTRAS).toEqual(['index', 'count', 'item']);
    HUD_SCOPE_EXTRAS.forEach((name) => expect(isHudScopeExtra(name)).toBe(true));
  });

  it('a picker offers them only when it says it is inside a repeat', () => {
    expect(hudVariableNamesFor({ insideRepeat: false })).not.toContain('index');
    expect(hudVariableNamesFor({ insideRepeat: true })).toEqual(expect.arrayContaining(['index', 'count', 'item']));
    expect(hudVariableNamesFor({ insideRepeat: false })).toHaveLength(PLAN_VARIABLES.length);
  });
});

describe('hudDataScope - sourced from the HUD\'s own existing fields, no new plumbing', () => {
  const vitals: HudVitalsSource = {
    healthCurrent: 28, healthCapacity: 40, magic: 96, halfMagic: true, armor: 2,
    arrows: 12, maxArrows: 40, bombs: 5, maxBombs: 30, keys: 3,
    rupees: 250, maxRupees: 999, hasSilverArrows: false,
  };

  it('maps every field to the name the plan gives it, unit for unit', () => {
    expect(hudDataScope(vitals, 6)).toEqual({
      life_current: 28, life_max: 40, magic_current: 96, magic_max: 128, half_magic: 1,
      armor: 2, arrow_current: 12, arrow_max: 40, bomb_current: 5, bomb_max: 30,
      key_current: 3, rupee_current: 250, rupee_max: 999, silver_arrows: 0, slot_count: 6,
    });
  });

  it('booleans become 0/1, both directions', () => {
    expect(hudDataScope({ ...vitals, halfMagic: false, hasSilverArrows: true }, 0)).toMatchObject({
      half_magic: 0, silver_arrows: 1,
    });
  });
});

describe('suggestVariableName - a typo, not a guess', () => {
  it('catches the exact typo the plan\'s own wireframe shows', () => {
    expect(suggestVariableName('life_curent', false)).toBe('life_current');
  });

  it('offers nothing for a name with no honest match', () => {
    expect(suggestVariableName('completely_unrelated_thing', false)).toBeUndefined();
  });

  it('only reaches for a scope extra when told the field is inside a repeat', () => {
    expect(suggestVariableName('indx', false)).toBeUndefined();
    expect(suggestVariableName('indx', true)).toBe('index');
  });
});
