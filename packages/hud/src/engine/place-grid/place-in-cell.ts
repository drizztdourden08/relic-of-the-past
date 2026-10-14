/* @layer shared-hud @kind logic */
import { insetsOf } from '../flow';
import { measureBox } from '../measure';
import { resolveExtent } from '../resolve-extent';
import { clampToBox } from '../resolve-box';
import type { Extent, HudNode } from '../../types/hud-node';
import type { MeasureContext } from '../engine.type';
import type { CellAlignment, CellPlacement } from './place-grid.type';

const offsetIn = (placement: string, free: number): number => {
  if (placement === 'center') return free / 2;
  if (placement === 'end') return free;
  return 0;
};

const extentFor = (preferred: Extent | undefined, placement: string): Extent =>
  preferred ?? (placement === 'stretch' ? 'fill' : 'auto');

const placeInCell = (
  node: HudNode, cell: { w: number; h: number }, ctx: MeasureContext, items: CellAlignment,
): CellPlacement => {
  const margin = insetsOf(node.margin);
  const innerW = Math.max(0, cell.w - margin.left - margin.right);
  const innerH = Math.max(0, cell.h - margin.top - margin.bottom);
  const natural = measureBox(node, ctx);
  const justify = node.justifySelf ?? node.alignSelf ?? items.justify;
  const align = node.alignSelf ?? items.align;
  const rawW = resolveExtent(extentFor(node.size?.w, justify), natural.w, innerW, ctx);
  const rawH = resolveExtent(extentFor(node.size?.h, align), natural.h, innerH, ctx);
  const w = clampToBox(node, 'w', rawW === 'fill' ? innerW : rawW, ctx);
  const h = clampToBox(node, 'h', rawH === 'fill' ? innerH : rawH, ctx);
  const x = margin.left + offsetIn(justify, innerW - w);
  const y = margin.top + offsetIn(align, innerH - h);
  return { w, h, x, y };
};

export { placeInCell };
