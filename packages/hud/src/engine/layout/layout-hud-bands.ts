/* @layer shared-hud @kind logic */
import { expand } from '../expand';
import { place } from '../place';
import type { HudLayout } from '../../types/hud-layout';
import type { MeasureContext, PlacedNode } from '../engine.type';
import type { Rect, Size } from '../../layouts/geometry.type';

const layoutHudBands = (
  doc: HudLayout, view: Size, ctx: MeasureContext = {},
): { screen: PlacedNode[]; bands: PlacedNode[][] } => {
  const root = expand(doc.screen, ctx);
  const full: Rect = { x: 0, y: 0, w: view.w, h: view.h };
  const placed = place(root, full, 1, ctx);
  const starts = new Set(root.children.map((child) => child.id));
  const screen: PlacedNode[] = [];
  const bands: PlacedNode[][] = [];
  let band: PlacedNode[] | null = null;
  placed.forEach((node, index) => {
    if (index > 0 && starts.has(node.id)) { band = []; bands.push(band); }
    (band ?? screen).push(node);
  });
  return { screen, bands };
};

export { layoutHudBands };
