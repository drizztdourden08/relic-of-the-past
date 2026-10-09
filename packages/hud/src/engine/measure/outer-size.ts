/* @layer shared-hud @kind logic */
import { insetsOf } from '../flow';
import { measureBox } from './measure-box';
import type { HudNode } from '../../types/hud-node';
import type { MeasureContext } from '../engine.type';
import type { Size } from '../../layouts/geometry.type';

const outerSize = (node: HudNode, ctx: MeasureContext = {}): Size => {
  const box = measureBox(node, ctx);
  const m = insetsOf(node.margin);
  return { w: box.w + m.left + m.right, h: box.h + m.top + m.bottom };
};

export { outerSize };
