/* @layer shared-hud @kind logic */
import { checkKeys, oneOf, validateBox } from '../validate-box';
import { validateAnimations, validateTransition } from '../validate-motion';
import { validateStyle } from '../validate-style';
import { containerCommon } from './container-common';
import { validateChildren } from './validate-children';
import { ALIGN, DIRECTIONS, FLEX_KEYS, JUSTIFY } from './validate-container.constants';
import type { HudFlexContainer } from '../../../types/hud/hud-node';
import type { Issues } from '../validate-box';
import type { NodeValidator } from './validate-container.type';

const validateFlexContainer = (
  value: Record<string, unknown>, path: string, issues: Issues, seen: Set<string>, validateNode: NodeValidator,
  insideRepeat = false,
): HudFlexContainer | null => {
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
  const style = validateStyle(value.style, `${path}.style`, issues, insideRepeat);
  const animation = validateAnimations(value.animation, `${path}.animation`, issues, insideRepeat);
  const transition = validateTransition(value.transition, `${path}.transition`, issues, insideRepeat);
  return {
    ...validateBox(value, path, issues, insideRepeat),
    kind: 'container',
    direction,
    ...common,
    ...(justify ? { justify } : {}),
    ...(align ? { align } : {}),
    ...(typeof value.wrap === 'boolean' ? { wrap: value.wrap } : {}),
    ...(style ? { style } : {}),
    ...(animation ? { animation } : {}),
    ...(transition ? { transition } : {}),
    children: validateChildren(value, path, issues, seen, validateNode, insideRepeat),
  };
};

export { validateFlexContainer };
