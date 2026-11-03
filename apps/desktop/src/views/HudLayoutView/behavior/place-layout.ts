/* @layer renderer-hud @kind logic */
import { layoutHudBands } from '@rotp/hud';
import type { HudLayout, MeasureContext, PlacedNode, Rect, Size } from '@rotp/hud';
import type { PlacedLayout } from '../HudLayoutView.type';

const drawsASlot = (nodes: readonly PlacedNode[]): boolean =>
  nodes.some((placed) => placed.node.kind === 'element' && placed.node.element.type === 'slot');

const unionOf = (nodes: readonly PlacedNode[]): Rect | null => {
  const [first, ...others] = nodes.map((placed) => placed.rect);
  if (!first) return null;
  const edges = others.reduce(
    (box, r) => ({ left: Math.min(box.left, r.x), top: Math.min(box.top, r.y), right: Math.max(box.right, r.x + r.w), bottom: Math.max(box.bottom, r.y + r.h) }),
    { left: first.x, top: first.y, right: first.x + first.w, bottom: first.y + first.h },
  );
  return { x: edges.left, y: edges.top, w: edges.right - edges.left, h: edges.bottom - edges.top };
};

const placeLayout = (doc: HudLayout, view: Size, ctx: MeasureContext): PlacedLayout => {
  const { screen, bands } = layoutHudBands(doc, view, ctx);
  const all: PlacedNode[] = [...screen];
  const buttons: PlacedNode[] = [];
  const rest: PlacedNode[] = [...screen];

  bands.forEach((placed) => {
    all.push(...placed);
    (drawsASlot(placed) ? buttons : rest).push(...placed);
  });

  const ink = buttons.filter((placed) => placed.node.kind === 'element');
  return { all, buttons, rest, bounds: unionOf(ink) };
};

export { placeLayout };
