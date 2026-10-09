/* @layer shared-hud @kind logic */
import { bakeValue } from './bake-value';
import type { HudNode } from '../../../types/hud/hud-node';
import type { Value } from '../../../types/hud/hud-value';
import type { Scope } from '../engine.type';

const bakeElement = (node: HudNode, scope: Scope): Record<string, unknown> => {
  if (node.kind !== 'element') return {};
  const { element } = node;
  if (element.type === 'text') {
    return {
      element: {
        ...element,
        ...(typeof element.value === 'string' ? {} : { value: bakeValue(element.value, scope) }),
        ...(element.stroke ? { stroke: { ...element.stroke, width: bakeValue(element.stroke.width, scope) as Value } } : {}),
      },
    };
  }
  if (element.type === 'shape') {
    return {
      element: {
        ...element,
        fill: bakeValue(element.fill, scope),
        ...(element.armor !== undefined ? { armor: bakeValue(element.armor, scope) } : {}),
        ...(element.bands !== undefined ? { bands: bakeValue(element.bands, scope) } : {}),
      },
    };
  }
  return {};
};

export { bakeElement };
