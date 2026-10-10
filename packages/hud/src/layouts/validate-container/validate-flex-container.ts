/* @layer shared-hud @kind logic */
import { checkKeys, oneOf, validateBox } from '../validate-box';
import { containerCommon } from './container-common';
import { motionParts } from './motion-parts';
import { validateChildren } from './validate-children';
import { ALIGN, DIRECTIONS, FLEX_KEYS, JUSTIFY } from './validate-container.constants';
import type { HudFlexContainer } from '../../types/hud-node';
import type { NodeContext, NodeValidator } from './validate-container.type';

const validateFlexContainer = (
  value: Record<string, unknown>, path: string, ctx: NodeContext, validateNode: NodeValidator,
): HudFlexContainer | null => {
  const { issues, insideRepeat } = ctx;
  checkKeys(value, FLEX_KEYS, path, issues);
  const direction = oneOf(value.direction, DIRECTIONS, `${path}.direction`, issues);
  if (!direction) {
    if (value.direction === undefined) issues.push(`${path}.direction: a flex container needs a direction`);
    return null;
  }
  const common = containerCommon(value, path, issues, insideRepeat);
  if (value.wrap !== undefined && typeof value.wrap !== 'boolean') issues.push(`${path}.wrap: expected true or false`);
  const justify = oneOf(value.justify, JUSTIFY, `${path}.justify`, issues);
  const align = oneOf(value.align, ALIGN, `${path}.align`, issues);
  if (!Array.isArray(value.children)) { issues.push(`${path}.children: expected an array`); return null; }
  const motion = motionParts(value, path, issues, insideRepeat);
  return {
    ...validateBox(value, path, issues, insideRepeat),
    kind: 'container',
    direction,
    ...common,
    ...(justify ? { justify } : {}),
    ...(align ? { align } : {}),
    ...(typeof value.wrap === 'boolean' ? { wrap: value.wrap } : {}),
    ...motion,
    children: validateChildren(value, path, ctx, validateNode),
  };
};

export { validateFlexContainer };
