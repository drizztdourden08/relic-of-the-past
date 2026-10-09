/* @layer shared-hud @kind constants */
import type { CubicBezier } from './motion-easing.type';

const NAMED_BEZIERS: Readonly<Record<string, CubicBezier>> = {
  ease: { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1.0 },
  'ease-in': { x1: 0.42, y1: 0, x2: 1.0, y2: 1.0 },
  'ease-out': { x1: 0, y1: 0, x2: 0.58, y2: 1.0 },
  'ease-in-out': { x1: 0.42, y1: 0, x2: 0.58, y2: 1.0 },
};

const STEPS_RE = /^steps\((\d+)\)$/;

const BEZIER_BISECTION_STEPS = 20;

export { BEZIER_BISECTION_STEPS, NAMED_BEZIERS, STEPS_RE };
