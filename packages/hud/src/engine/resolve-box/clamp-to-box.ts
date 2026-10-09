/* @layer shared-hud @kind logic */
import { resolveBound } from './resolve-bound';
import type { HudBox } from '../../types/hud-node';
import type { MeasureContext } from '../engine.type';

const clampToBox = (node: HudBox, axis: 'w' | 'h', resolved: number, ctx: MeasureContext): number => {
  const min = resolveBound(node.min?.[axis], ctx, -Infinity);
  const max = resolveBound(node.max?.[axis], ctx, Infinity);
  return Math.min(max, Math.max(min, resolved));
};

export { clampToBox };
