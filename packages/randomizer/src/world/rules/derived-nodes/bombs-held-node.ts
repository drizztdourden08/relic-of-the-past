/* @layer shared-game @kind logic */
import { BOMBS_HELD_CHECK } from '../../events/bombs-record.constants';
import { MAX_BOMBS_ASKED } from '../../state-helpers';
import { all, any, has, helper, option } from '../rule-node-build';
import type { RuleNode } from '../rule-node.type';

const bombsHeldNode = (quantity: number): RuleNode => all(
  helper('explosivesAtLeast', Math.min(quantity, MAX_BOMBS_ASKED)),
  any(option('events.recordAttached', false), has(BOMBS_HELD_CHECK)),
);

export { bombsHeldNode };
