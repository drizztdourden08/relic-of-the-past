/* @layer shared-hud @kind logic */
import { validateBox } from '../validate-box';
import { motionParts } from './motion-parts';
import { validateChildren } from './validate-children';
import type { BuildContainerOptions } from './validate-container.type';

const buildContainer = <Own extends object>({ value, path, ctx, validateNode, own }: BuildContainerOptions<Own>) => {
  const { issues, insideRepeat } = ctx;
  if (!Array.isArray(value.children)) { issues.push(`${path}.children: expected an array`); return null; }
  const motion = motionParts(value, path, issues, insideRepeat);
  return {
    ...validateBox(value, path, issues, insideRepeat),
    kind: 'container' as const,
    ...own,
    ...motion,
    children: validateChildren(value, path, ctx, validateNode),
  };
};

export { buildContainer };
