/* @layer shared-game @kind logic */
import type { HelperName, RuleArg, RuleNode } from '../rule-node.type';

const helper = (name: HelperName, ...args: readonly RuleArg[]): RuleNode =>
  (args.length === 0 ? { op: 'helper', name } : { op: 'helper', name, args });

export { helper };
