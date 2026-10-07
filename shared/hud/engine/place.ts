/* @layer shared-hud @kind logic */
/**
 * Pass two: top-down, turning boxes into rectangles.
 *
 * A node is handed the box its parent gave it and answers with itself and
 * everything under it, parents first. Containers are emitted alongside leaves
 * because the editor selects and drags them; a renderer that only wants ink
 * filters on `node.kind` and pays nothing for the rest.
 *
 * AN ELEMENT IS CONTAINED, NEVER STRETCHED. Its rectangle is its intrinsic
 * aspect fitted inside the box and centred there, so a box of the wrong shape
 * letterboxes instead of distorting the art. That is the only fit there is,
 * which is why `HudElement.fit` has exactly one legal value: the JSON says out
 * loud what the engine could not do otherwise.
 *
 * DIMMING AND OPACITY BOTH DESCEND. A container that dims dims its subtree, and
 * opacity multiplies down it, so "this whole group has nothing on it" is one
 * statement on one node instead of a flag repeated on every leaf.
 */

import { childBoxes } from './place-flow';
import { childBoxesGrid } from './place-grid';
import { resolveOpacity, resolveScale, resolveVisible } from './resolve-box';
import { intrinsicSize } from './intrinsic-size';
import type { HudContainer, HudNode } from '../../types/hud/hud-node';
import type { ChildBox } from './place-flow';
import type { MeasureContext, PlacedNode } from './engine.type';
import type { Rect, Size } from '../layouts/geometry.type';

interface PlaceEnv { opacity: number; dimmed: boolean }

const ROOT_ENV: PlaceEnv = { opacity: 1, dimmed: false };

/** Dimmed when the node names slots and not one of them fires anything. A node
 *  that names none is never dimmed by this rule - only by an ancestor. */
const isDimmed = (node: HudNode, ctx: MeasureContext): boolean => {
  const slots = node.dimWhenEmpty;
  if (!slots || slots.length === 0) return false;
  const filled = ctx.filledSlots ?? [];
  return !slots.some((slot) => filled.includes(slot));
};

/** The one place a container picks its placement engine - grid beside flex,
 *  never both. */
const childBoxesOf = (node: HudContainer, box: Rect, unit: number, ctx: MeasureContext): ChildBox[] =>
  (node.layout === 'grid' ? childBoxesGrid(node, box, unit, ctx) : childBoxes(node, box, unit, ctx));

/** The intrinsic aspect, fitted inside the box and centred in it. */
const containRect = (content: Size, box: Rect): Rect => {
  if (content.w <= 0 || content.h <= 0) return { ...box };
  const fit = Math.min(box.w / content.w, box.h / content.h);
  const w = content.w * fit;
  const h = content.h * fit;
  return { x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h };
};

/**
 * @param box   the rectangle this node was given, in view pixels
 * @param unit  view pixels per authored pixel in the node's parent - the
 *              product of every ancestor's scale, and 1 at a region's root
 */
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

export { containRect, isDimmed, place };
export type { PlaceEnv };
