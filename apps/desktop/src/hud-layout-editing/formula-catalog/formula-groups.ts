/* @layer renderer-components @kind logic */
import { HUD_SCOPE_EXTRAS, HUD_VARIABLES } from '@rotp/hud';
import {
  CONSTANTS, DELTA_NOTE, FUNCTIONS, NOT_A_TRANSITION, OPERATORS, OUTSIDE_REPEAT, SCOPE_NOTES,
} from './formula-catalog.constants';
import type { FormulaGroup } from './formula-catalog.type';

const scopeGroup = (insideRepeat: boolean): FormulaGroup => ({
  title: insideRepeat ? 'Inside this repeat' : 'Only inside a repeat',
  items: HUD_SCOPE_EXTRAS.map((name) => ({
    name,
    note: SCOPE_NOTES[name],
    unavailable: insideRepeat ? undefined : OUTSIDE_REPEAT,
  })),
});

const gameGroup = (): FormulaGroup => ({
  title: 'From the game',
  items: HUD_VARIABLES.map((entry) => ({ name: entry.name, note: entry.note })),
});

const deltaGroup = (extraNames: readonly string[]): FormulaGroup => ({
  title: 'On this transition',
  items: [{
    name: 'delta',
    note: DELTA_NOTE,
    unavailable: extraNames.includes('delta') ? undefined : NOT_A_TRANSITION,
  }],
});

const formulaGroups = (context: {
  insideRepeat: boolean; extraNames?: readonly string[];
}): readonly FormulaGroup[] => {
  const extras = context.extraNames ?? [];
  return [
    ...(context.insideRepeat ? [scopeGroup(true)] : []),
    gameGroup(),
    ...(context.insideRepeat ? [] : [scopeGroup(false)]),
    ...(extras.includes('delta') ? [deltaGroup(extras)] : []),
    { title: 'Operators', items: OPERATORS },
    { title: 'Functions', items: FUNCTIONS },
    { title: 'Reserved', items: CONSTANTS },
  ];
};

export { formulaGroups };
