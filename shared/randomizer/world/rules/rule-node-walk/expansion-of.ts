/* @layer shared-game @kind logic */
import { HELPERS } from '../helpers-registry';
import type { World } from '../../world.type';
import type { HelperNode, RuleNode } from '../rule-node.type';
import type { HelperArgValue } from '../helper-definition.type';

const expansionOf = (node: HelperNode, world: World): RuleNode | undefined => {
  const definition = HELPERS.get(node.name);
  const args = node.args ?? [];
  if (definition?.expand === undefined || args.some((arg) => typeof arg === 'object')) return undefined;
  return definition.expand(world, ...(args as readonly HelperArgValue[]));
};

export { expansionOf };
