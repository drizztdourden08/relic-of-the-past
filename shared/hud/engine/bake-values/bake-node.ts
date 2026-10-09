/* @layer shared-hud @kind logic */
import { bakeBox } from './bake-box';
import { bakeContainerExtras } from './bake-container-extras';
import { bakeElement } from './bake-element';
import type { HudNode } from '../../../types/hud/hud-node';
import type { Scope } from '../engine.type';

const bakeNode = (node: HudNode, scope: Scope): HudNode => {
  const boxed = { ...node, ...bakeBox(node, scope), ...bakeElement(node, scope) } as HudNode;
  if (boxed.kind === 'container') return { ...boxed, ...bakeContainerExtras(boxed, scope) } as HudNode;
  return boxed;
};

export { bakeNode };
