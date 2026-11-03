/* @layer shared-hud @kind logic */
import { DEFAULT_LAYOUT } from '../built-in-layouts';
import { DEFAULT_HEARTS } from '../element-sizes';
import { layoutHudBands } from '../../engine/layout';
import { unionOf } from '../union-of';
import { HEALTH_UNITS_PER_HEART, REFERENCE_VIEW } from './vitals-reserve.constants';
import type { PlacedNode } from '../../engine/engine.type';
import type { Rect, Size } from '../geometry.type';

const drawsLife = (nodes: readonly PlacedNode[]): boolean =>
  nodes.some((placed) => (
    placed.node.kind === 'element' && placed.node.element.type === 'shape' && placed.node.element.shape === 'heart'
  ));

const vitalsReserve = (hearts: number = DEFAULT_HEARTS, view: Size = REFERENCE_VIEW): Rect => {
  const scope = { life_max: hearts * HEALTH_UNITS_PER_HEART };
  const placed = layoutHudBands(DEFAULT_LAYOUT, view, { scope }).bands.find(drawsLife) ?? [];
  return unionOf(placed.filter((node) => node.node.kind === 'element').map((node) => node.rect));
};

export { vitalsReserve };
