/* @layer renderer-hud @kind logic */
import { layoutHudBands } from '@rotp/hud';
import type { HudLayout, MeasureContext, PlacedNode, Rect, Size } from '@rotp/hud';
import type { PlacedLayout } from '../HudLayoutView.type';

const drawsASlot = (nodes: readonly PlacedNode[]): boolean =>
  nodes.some((placed) => placed.node.kind === 'element' && placed.node.element.type === 'slot');

const unionOf = (nodes: readonly PlacedNode[]): Rect | null => {
  if (nodes.length === 0) return null;
  const rects = nodes.map((placed) => placed.rect);
  const x = Math.min(...rects.map((r) => r.x));
  const y = Math.min(...rects.map((r) => r.y));
  return {
    x,
    y,
    w: Math.max(...rects.map((r) => r.x + r.w)) - x,
    h: Math.max(...rects.map((r) => r.y + r.h)) - y,
  };
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
