/* @layer shared-hud @kind logic */
import type { HudNode } from '../../types/hud-node';
import type { NodeContext, NodeValidator } from './validate-container.type';

const validateChildren = (
  value: Record<string, unknown>, path: string, ctx: NodeContext, validateNode: NodeValidator,
): HudNode[] => {
  if (!Array.isArray(value.children)) return [];
  return value.children
    .map((child: unknown, index) => validateNode(child, `${path}.children[${index}]`, ctx))
    .filter((child): child is HudNode => child !== null);
};

export { validateChildren };
