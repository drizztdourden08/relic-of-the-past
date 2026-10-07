/* @layer shared-game @kind types */
/**
 * One named helper a rule tree may call. `body` is what the engine runs: the state helper as it
 * was always written, so naming a helper in a tree changes no answer. `expand`, where present,
 * is the same question written as a tree (a helper with none is a PRIMITIVE, and an exporter's
 * other side has to implement it). The expansion is built for one world, because a few helpers
 * read that world's own structure, and it may call other helpers by name.
 */
import type { CollectionState } from '../collection-state';
import type { World } from '../world.type';
import type { HelperName, RuleNode } from './rule-node.type';

type HelperArgValue = number | string | boolean;

interface HelperDefinition {
  name: HelperName;
  /** The argument names, in order; an argument left off takes the helper's own default. */
  params: readonly string[];
  body: (state: CollectionState, ...args: readonly HelperArgValue[]) => boolean;
  expand?: (world: World, ...args: readonly HelperArgValue[]) => RuleNode;
}

export type { HelperArgValue, HelperDefinition };
