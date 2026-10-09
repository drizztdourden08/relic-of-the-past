/* @layer shared-hud @kind logic */
import { DEFAULT_LAYOUT } from '../built-in-layouts';
import { DEFAULT_HEARTS } from '../element-sizes';
import { layoutHudBands } from '../../engine/layout';
import { EMPTY_RECT, HEALTH_UNITS_PER_HEART, REFERENCE_VIEW } from './vitals-reserve.constants';
import type { PlacedNode } from '../../engine/engine.type';
import type { Rect, Size } from '../geometry.type';

const drawsLife = (nodes: readonly PlacedNode[]): boolean =>
  nodes.some((placed) => (
    placed.node.kind === 'element' && placed.node.element.type === 'shape' && placed.node.element.shape === 'heart'
  ));

const unionOf = (rects: readonly Rect[]): Rect => {
  if (rects.length === 0) return { ...EMPTY_RECT };
  const x = Math.min(...rects.map((r) => r.x));
  const y = Math.min(...rects.map((r) => r.y));
  return {
    x,
    y,
    w: Math.max(...rects.map((r) => r.x + r.w)) - x,
    h: Math.max(...rects.map((r) => r.y + r.h)) - y,
  };
};

const vitalsReserve = (hearts: number = DEFAULT_HEARTS, view: Size = REFERENCE_VIEW): Rect => {
  const scope = { life_max: hearts * HEALTH_UNITS_PER_HEART };
  const placed = layoutHudBands(DEFAULT_LAYOUT, view, { scope }).bands.find(drawsLife) ?? [];
  return unionOf(placed.filter((node) => node.node.kind === 'element').map((node) => node.rect));
};

export { vitalsReserve };
