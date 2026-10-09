/* @layer shared-hud @kind logic */
import { clampToBox, resolveScale } from '../resolve-box';
import { contentSize } from './content-size';
import { pxOf } from './px-of';
import type { HudNode } from '../../../types/hud/hud-node';
import type { MeasureContext } from '../engine.type';
import type { Size } from '../../layouts/geometry.type';

const measureBox = (node: HudNode, ctx: MeasureContext = {}): Size => {
  const scale = resolveScale(node, ctx);
  const content = contentSize(node, ctx);
  const w = pxOf(node.size?.w, ctx) ?? content.w * scale;
  const h = pxOf(node.size?.h, ctx) ?? content.h * scale;
  return { w: clampToBox(node, 'w', w, ctx), h: clampToBox(node, 'h', h, ctx) };
};

export { measureBox };
