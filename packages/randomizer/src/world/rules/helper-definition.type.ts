/* @layer shared-game @kind types */
import type { CollectionState } from '../collection-state.type';
import type { World } from '../world.type';
import type { HelperName, RuleNode } from './rule-node.type';

type HelperArgValue = number | string | boolean;

interface HelperDefinition {
  name: HelperName;
  params: readonly string[];
  body: (state: CollectionState, ...args: readonly HelperArgValue[]) => boolean;
  expand?: (world: World, ...args: readonly HelperArgValue[]) => RuleNode;
}

export type { HelperArgValue, HelperDefinition };
