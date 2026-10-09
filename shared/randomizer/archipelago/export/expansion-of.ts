/* @layer shared-game @kind logic */
import { HELPERS } from '../../world/rules/helpers-registry';
import { callKey } from './call-key';
import type { World } from '../../world/world.type';
import type { RuleNode } from '../../world/rules/rule-node.type';
import type { HelperArgValue } from '../../world/rules/helper-definition.type';
import type { HelperNode } from './export.type';

const expansionOf = (node: HelperNode, world: World): RuleNode | undefined => {
  const definition = HELPERS.get(node.name);
  if (definition?.expand === undefined) return undefined;
  const args = node.args ?? [];
  if (args.some((arg) => typeof arg === 'object')) {
    throw new Error(`derived helper called with a setting or seed argument: ${callKey(node)}`);
  }
  return definition.expand(world, ...(args as readonly HelperArgValue[]));
};

export { expansionOf };
