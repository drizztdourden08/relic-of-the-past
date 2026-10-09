/* @layer renderer-hud @kind logic */
import { FULL_TURN, PUSH_DISTANCE, SLICE_RADIUS } from '../HudPie.constants';
import type { SliceShape } from '../HudPie.type';

const round = (value: number): number => Math.round(value * 1000) / 1000;

const pointAt = (angle: number, radius: number): [number, number] =>
  [round(Math.sin(angle) * radius), round(-Math.cos(angle) * radius)];

const fullDiscPath = (): string => {
  const r = SLICE_RADIUS;
  return `M 0 ${-r} A ${r} ${r} 0 1 1 0 ${r} A ${r} ${r} 0 1 1 0 ${-r} Z`;
};

const wedgePath = (from: number, to: number): string => {
  const [x0, y0] = pointAt(from, SLICE_RADIUS);
  const [x1, y1] = pointAt(to, SLICE_RADIUS);
  const largeArc = to - from > Math.PI ? 1 : 0;
  return `M 0 0 L ${x0} ${y0} A ${SLICE_RADIUS} ${SLICE_RADIUS} 0 ${largeArc} 1 ${x1} ${y1} Z`;
};

const buildSlices = (sliceCount: number): SliceShape[] => {
  const count = Math.max(1, Math.floor(sliceCount));
  const step = FULL_TURN / count;
  return Array.from({ length: count }, (_, index) => {
    const from = index * step;
    const [pushX, pushY] = pointAt(from + step / 2, PUSH_DISTANCE);
    return { path: count === 1 ? fullDiscPath() : wedgePath(from, from + step), pushX, pushY };
  });
};

export { buildSlices };
