/* @layer shared-hud @kind logic */
import { childBoxes } from '../place-flow';
import { childBoxesGrid } from '../place-grid';
import { resolveOpacity, resolveScale, resolveVisible } from '../resolve-box';
import { intrinsicSize } from '../intrinsic-size';
import { containRect } from './contain-rect';
import { isDimmed } from './is-dimmed';
import { ROOT_ENV } from './place.constants';
import type { HudContainer, HudNode } from '../../../types/hud/hud-node';
import type { ChildBox } from '../place-flow.type';
import type { MeasureContext, PlacedNode } from '../engine.type';
import type { Rect } from '../../layouts/geometry.type';
import type { PlaceEnv } from './place.type';

const childBoxesOf = (node: HudContainer, box: Rect, unit: number, ctx: MeasureContext): ChildBox[] =>
  (node.layout === 'grid' ? childBoxesGrid(node, box, unit, ctx) : childBoxes(node, box, unit, ctx));

const place = (
  node: HudNode,
  box: Rect,
  unit: number,
  ctx: MeasureContext,
  env: PlaceEnv = ROOT_ENV,
): PlacedNode[] => {
  if (!resolveVisible(node, ctx)) return [];
  const opacity = env.opacity * resolveOpacity(node, ctx);
  const dimmed = env.dimmed || isDimmed(node, ctx);

  if (node.kind === 'element') {
    const intrinsic = intrinsicSize(node.element, ctx);
    const rect = containRect(intrinsic, box);
    const scale = intrinsic.w > 0 ? rect.w / intrinsic.w : unit * resolveScale(node, ctx);
    return [{ id: node.id, node, rect, scale, opacity, dimmed }];
  }

  const inner = unit * resolveScale(node, ctx);
  const child: PlaceEnv = { opacity, dimmed };
  return [
    { id: node.id, node, rect: { ...box }, scale: inner, opacity, dimmed },
    ...childBoxesOf(node, box, inner, ctx)
      .flatMap((placed) => place(placed.node, placed.box, inner, ctx, child)),
  ];
};

export { place };
