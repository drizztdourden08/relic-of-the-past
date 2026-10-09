/* @layer shared-hud @kind logic */
import { bakeAnimation } from './bake-animation';
import { bakeExtent } from './bake-extent';
import { bakeStyle } from './bake-style';
import { bakeTransition } from './bake-transition';
import { bakeValue } from './bake-value';
import type { HudBox, HudNode } from '../../../types/hud/hud-node';
import type { Value } from '../../../types/hud/hud-value';
import type { Scope } from '../engine.type';

const bakeMinMax = (
  bound: { w?: Value; h?: Value } | undefined, scope: Scope,
): { w?: Value; h?: Value } | undefined => (
  bound === undefined ? undefined : {
    ...(bound.w !== undefined ? { w: bakeValue(bound.w, scope) } : {}),
    ...(bound.h !== undefined ? { h: bakeValue(bound.h, scope) } : {}),
  }
);

const bakeSize = (size: HudBox['size'], scope: Scope): HudBox['size'] => (
  size === undefined ? undefined : {
    ...(size.w !== undefined ? { w: bakeExtent(size.w, scope) } : {}),
    ...(size.h !== undefined ? { h: bakeExtent(size.h, scope) } : {}),
  }
);

const bakeBox = (node: HudNode, scope: Scope): Partial<HudBox> => ({
  ...(node.size ? { size: bakeSize(node.size, scope) } : {}),
  ...(node.min ? { min: bakeMinMax(node.min, scope) } : {}),
  ...(node.max ? { max: bakeMinMax(node.max, scope) } : {}),
  ...(node.scale !== undefined ? { scale: bakeValue(node.scale, scope) } : {}),
  ...(node.opacity !== undefined ? { opacity: bakeValue(node.opacity, scope) } : {}),
  ...(node.visible !== undefined
    ? { visible: typeof node.visible === 'boolean' ? node.visible : bakeValue(node.visible, scope) }
    : {}),
  ...(node.style ? { style: bakeStyle(node.style, scope) } : {}),
  ...(node.animation ? { animation: node.animation.map((a) => bakeAnimation(a, scope)) } : {}),
  ...(node.transition ? { transition: bakeTransition(node.transition, scope) } : {}),
});

export { bakeBox };
