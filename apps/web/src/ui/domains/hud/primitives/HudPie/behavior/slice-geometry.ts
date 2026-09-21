/* @layer renderer-hud @kind logic */
/** Wedge paths for a pie cut into equal slices, clockwise from twelve o'clock. */
import { PUSH_DISTANCE, SLICE_RADIUS } from '../HudPie.constants';
import type { SliceShape, SliceState } from '../HudPie.type';

const FULL_TURN = Math.PI * 2;
const round = (value: number): number => Math.round(value * 1000) / 1000;

/** A point at |radius| from the centre, |angle| radians clockwise from twelve o'clock. */
const pointAt = (angle: number, radius: number): [number, number] =>
  [round(Math.sin(angle) * radius), round(-Math.cos(angle) * radius)];

/** A lone slice is the whole disc. One arc cannot close on itself, so it takes two half turns. */
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

/** Slices leave in index order, so the first one still in place is the next to go. */
const sliceStateAt = (index: number, sliceCount: number, slicesLeft: number): SliceState => {
  const gone = sliceCount - Math.min(Math.max(0, slicesLeft), sliceCount);
  if (index < gone) return 'gone';
  return index === gone ? 'next' : 'idle';
};

export { buildSlices, sliceStateAt };
