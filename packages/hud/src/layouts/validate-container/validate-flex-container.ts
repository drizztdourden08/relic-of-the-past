/* @layer shared-hud @kind logic */
import { checkKeys, oneOf } from '../validate-box';
import { buildContainer } from './build-container';
import { containerCommon } from './container-common';
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
  return buildContainer({
    value, path, ctx, validateNode,
    own: {
      direction,
      ...common,
      ...(justify ? { justify } : {}),
      ...(align ? { align } : {}),
      ...(typeof value.wrap === 'boolean' ? { wrap: value.wrap } : {}),
    },
  });
};

export { validateFlexContainer };
