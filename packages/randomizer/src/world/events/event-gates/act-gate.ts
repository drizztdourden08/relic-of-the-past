/* @layer shared-game @kind logic */
import { GATE_BY_CHECK } from './event-gates.constants';
import { compileRule } from '../../rules/rule-eval';
import { any, has, option } from '../../rules/rule-node-build';
import type { Rule } from '../../world.type';

const actGate = (checkId: string): Rule => {
  const gate = GATE_BY_CHECK.get(checkId);
  if (gate === undefined) throw new Error(`no event gate for check: ${checkId}`);
  const { precondition } = gate;
  return compileRule(any(
    has(gate.checkId),
    precondition === undefined ? option('events.recordAttached', false) : precondition.node,
  ));
};

export { actGate };
