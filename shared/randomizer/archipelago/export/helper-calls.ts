/* @layer shared-game @kind logic */
/**
 * Every derived helper call a set of trees makes, each with the tree it stands for, following
 * each expansion into the helpers it names in turn. The trees keep their helper leaves; the
 * loader looks a call up by name and arguments and compiles the tree it finds, so a helper used
 * a thousand times ships once. A primitive helper has no expansion and is left to the loader.
 */
import { HELPERS } from '../../world/rules/helpers-registry';
import { walkRuleNode } from '../../world/rules/rule-node-walk';
import type { World } from '../../world/world.type';
import type { RuleNode } from '../../world/rules/rule-node.type';
import type { HelperArgValue } from '../../world/rules/helper-definition.type';
import type { ExportedHelper } from './export.type';

type HelperNode = Extract<RuleNode, { op: 'helper' }>;

const callKey = (node: HelperNode): string => `${node.name}${JSON.stringify(node.args ?? [])}`;

/** The expansion of one call, or undefined for a primitive. A derived call must carry plain arguments. */
const expansionOf = (node: HelperNode, world: World): RuleNode | undefined => {
  const definition = HELPERS.get(node.name);
  if (definition?.expand === undefined) return undefined;
  const args = node.args ?? [];
  if (args.some((arg) => typeof arg === 'object')) {
    throw new Error(`derived helper called with a setting or seed argument: ${callKey(node)}`);
  }
  return definition.expand(world, ...(args as readonly HelperArgValue[]));
};

const helperCallsOf = (world: World, roots: Iterable<RuleNode>): ExportedHelper[] => {
  const calls = new Map<string, ExportedHelper>();
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

export { callKey, expansionOf, helperCallsOf };
