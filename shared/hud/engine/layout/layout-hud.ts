/* @layer shared-hud @kind logic */
import { layoutHudBands } from './layout-hud-bands';
import type { HudLayout } from '../../../types/hud/hud-layout';
import type { MeasureContext, PlacedNode } from '../engine.type';
import type { Size } from '../../layouts/geometry.type';

const layoutHud = (doc: HudLayout, view: Size, ctx: MeasureContext = {}): PlacedNode[] => {
  const { screen, bands } = layoutHudBands(doc, view, ctx);
  return [...screen, ...bands.flat()];
};

export { layoutHud };
