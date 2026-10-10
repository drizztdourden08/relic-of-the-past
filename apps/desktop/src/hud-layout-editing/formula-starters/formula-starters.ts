/* @layer renderer-components @kind logic */
import {
  GATE_STARTERS, NUMBER_STARTERS, REPEAT_GATE_STARTERS, REPEAT_NUMBER_STARTERS,
} from './formula-starters.constants';
import type { FormulaStarter, StarterRole } from './formula-starters.type';

const formulaStarters = (context: {
  role: StarterRole; insideRepeat: boolean;
}): readonly FormulaStarter[] => {
  const { role, insideRepeat } = context;
  const base = role === 'gate' ? GATE_STARTERS : NUMBER_STARTERS;
  const scoped = role === 'gate' ? REPEAT_GATE_STARTERS : REPEAT_NUMBER_STARTERS;
  return insideRepeat ? [...scoped, ...base] : base;
};

export { formulaStarters };
