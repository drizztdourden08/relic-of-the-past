/* @layer shared-hud @kind logic */
import type { HudNode } from '../../types/hud-node';
import type { Issues } from '../validate-box';
import type { NodeValidator } from './validate-container.type';

const validateChildren = (
  value: Record<string, unknown>, path: string, issues: Issues, seen: Set<string>, validateNode: NodeValidator,
  insideRepeat = false,
): HudNode[] => {
  if (!Array.isArray(value.children)) return [];
  return value.children
    .map((child, index) => validateNode(child, `${path}.children[${index}]`, issues, seen, insideRepeat))
    .filter((child): child is HudNode => child !== null);
};

export { validateChildren };
