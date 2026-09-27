/* @layer shared-game @kind logic */
/**
 * Reading rule trees: a pre-order walk, the helpers a world's rules reach, and the inlining that
 * rewrites every derived helper into the primitive ops it stands for (helpers-registry.ts). Both
 * are what an exporter needs: the walk to list what the other side must implement, the inlining
 * to hand over trees that name only primitives.
 */
import { HELPERS } from './helpers-registry';
import type { World } from '../world.type';
import type { HelperName, RuleNode } from './rule-node.type';
import type { HelperArgValue } from './helper-definition.type';

type RuleNodeVisitor = (node: RuleNode, depth: number) => void;

const childrenOf = (node: RuleNode): readonly RuleNode[] => {
  if (node.op === 'all' || node.op === 'any') return node.of;
  if (node.op === 'if') return [node.cond, node.then, node.else];
  return [];
};

/** Every node of the tree, parents before children, left to right. */
const walkRuleNode = (node: RuleNode, visitor: RuleNodeVisitor, depth = 0): void => {
  visitor(node, depth);
  for (const child of childrenOf(node)) walkRuleNode(child, visitor, depth + 1);
};

/** A helper's own tree for these arguments, or undefined for a primitive or a setting-read argument. */
const expansionOf = (node: Extract<RuleNode, { op: 'helper' }>, world: World): RuleNode | undefined => {
  const definition = HELPERS.get(node.name);
  const args = node.args ?? [];
  if (definition?.expand === undefined || args.some((arg) => typeof arg === 'object')) return undefined;
  return definition.expand(world, ...(args as readonly HelperArgValue[]));
};

/** The tree with every derived helper replaced by its expansion, all the way down. */
const inlineHelpers = (node: RuleNode, world: World): RuleNode => {
  switch (node.op) {
    case 'all':
    case 'any': return { op: node.op, of: node.of.map((child) => inlineHelpers(child, world)) };
    case 'if': return {
      op: 'if',
      cond: inlineHelpers(node.cond, world),
      then: inlineHelpers(node.then, world),
      else: inlineHelpers(node.else, world),
    };
    case 'helper': {
      const expansion = expansionOf(node, world);
      return expansion === undefined ? node : inlineHelpers(expansion, world);
    }
    default: return node;
  }
};

/** The helpers one tree names, through every expansion it reaches. */
const helperNamesOf = (node: RuleNode, world: World, into: Set<HelperName>): void => {
  walkRuleNode(node, (visited) => {
    if (visited.op !== 'helper') return;
    into.add(visited.name);
    const expansion = expansionOf(visited, world);
    if (expansion !== undefined) helperNamesOf(expansion, world, into);
  });
};

/** Every helper the world's location and exit rules reach, expansions included, sorted. */
const collectHelperNames = (world: World): HelperName[] => {
  const names = new Set<HelperName>();
  for (const rule of world.locationRules.values()) helperNamesOf(rule.node, world, names);
  for (const rule of world.rules.values()) helperNamesOf(rule.node, world, names);
  return [...names].sort();
};

export { collectHelperNames, inlineHelpers, walkRuleNode };
export type { RuleNodeVisitor };
