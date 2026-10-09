/* @layer shared-hud @kind logic */
import { parseSteps } from './parse-steps';
import { BEZIER_BISECTION_STEPS, NAMED_BEZIERS } from './motion-easing.constants';
import type { CubicBezier } from './motion-easing.type';

const bezierComponent = (t: number, p1: number, p2: number): number => {
  const inv = 1 - t;
  return 3 * inv * inv * t * p1 + 3 * inv * t * t * p2 + t * t * t;
};

const solveBezierT = (x: number, curve: CubicBezier): number => {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < BEZIER_BISECTION_STEPS; i += 1) {
    const mid = (lo + hi) / 2;
    if (bezierComponent(mid, curve.x1, curve.x2) < x) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
};

const bezierEase = (t: number, curve: CubicBezier): number => bezierComponent(solveBezierT(t, curve), curve.y1, curve.y2);

const stepsEaseJumpEnd = (t: number, n: number): number => {
  if (t >= 1) return 1;
  if (t <= 0) return 0;
  return Math.floor(t * n) / n;
};

const easingFn = (name: string | undefined): ((t: number) => number) => {
  if (name === undefined || name === 'linear') return (t) => Math.min(1, Math.max(0, t));
  const steps = parseSteps(name);
  if (steps !== null) return (t) => stepsEaseJumpEnd(t, steps);
  const curve = NAMED_BEZIERS[name];
  if (curve) return (t) => bezierEase(Math.min(1, Math.max(0, t)), curve);
  return (t) => Math.min(1, Math.max(0, t));
};

export { easingFn };
