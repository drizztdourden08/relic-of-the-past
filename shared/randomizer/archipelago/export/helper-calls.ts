/* @layer shared-game @kind logic */
import { walkRuleNode } from '../../world/rules/rule-node-walk';
import { callKey } from './call-key';
import { expansionOf } from './expansion-of';
import type { World } from '../../world/world.type';
import type { RuleNode } from '../../world/rules/rule-node.type';
import type { HelperArgValue } from '../../world/rules/helper-definition.type';
import type { ExportedHelperCall } from './export.type';

const helperCallsOf = (world: World, roots: Iterable<RuleNode>): ExportedHelperCall[] => {
  const calls = new Map<string, ExportedHelperCall>();
  const visit = (root: RuleNode): void => walkRuleNode(root, (node) => {
    if (node.op !== 'helper') return;
    const key = callKey(node);
    if (calls.has(key)) return;
    const expansion = expansionOf(node, world);
    if (expansion === undefined) return;
    calls.set(key, { name: node.name, args: (node.args ?? []) as HelperArgValue[], rule: expansion });
    visit(expansion);
  });
  for (const root of roots) visit(root);
  return [...calls.values()].sort((a, b) => (a.name + JSON.stringify(a.args)).localeCompare(b.name + JSON.stringify(b.args)));
};

export { helperCallsOf };
