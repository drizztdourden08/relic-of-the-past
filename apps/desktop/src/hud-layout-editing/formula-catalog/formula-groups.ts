/* @layer renderer-components @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { HUD_SCOPE_EXTRAS, HUD_VARIABLES } from '@rotp/hud';
import {
  CONSTANTS, DELTA_NOTE, FUNCTIONS, NOT_A_TRANSITION, OPERATORS, OUTSIDE_REPEAT, SCOPE_NOTES,
} from './formula-catalog.constants';
import type { FormulaGroup } from './formula-catalog.type';

const scopeGroup = (insideRepeat: boolean): FormulaGroup => ({
  title: insideRepeat ? msg('hud-editing:catalog.group.inside-repeat') : msg('hud-editing:catalog.group.outside-repeat'),
  items: HUD_SCOPE_EXTRAS.map((name) => ({
    name,
    note: SCOPE_NOTES[name],
    unavailable: insideRepeat ? undefined : OUTSIDE_REPEAT,
  })),
});

const gameGroup = (): FormulaGroup => ({
  title: msg('hud-editing:catalog.group.game'),
  items: HUD_VARIABLES.map((entry) => ({ name: entry.name, note: entry.note })),
});

const deltaGroup = (extraNames: readonly string[]): FormulaGroup => ({
  title: msg('hud-editing:catalog.group.transition'),
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
    { title: msg('hud-editing:catalog.group.operators'), items: OPERATORS },
    { title: msg('hud-editing:catalog.group.functions'), items: FUNCTIONS },
    { title: msg('hud-editing:catalog.group.reserved'), items: CONSTANTS },
  ];
};

export { formulaGroups };
