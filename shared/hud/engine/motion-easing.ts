/* @layer shared-hud @kind logic */
/**
 * Easing curves, as pure `(t: number) => number` functions over `t` in 0-1.
 * The same five named CSS curves plus `steps(n)`, evaluated in JS instead of
 * left to the browser because `motion.ts` samples a keyframe VALUE at an
 * arbitrary instant, not a CSS property transitioning on its own.
 *
 * The four non-linear named curves are the exact `cubic-bezier(...)` control
 * points the CSS spec defines for them - solved by bisection on the curve's
 * own X (time) to find the T that produces it, then evaluating Y at that T,
 * which is how a browser reads `cubic-bezier` too.
 */

interface CubicBezier { x1: number; y1: number; x2: number; y2: number }

const NAMED_BEZIERS: Readonly<Record<string, CubicBezier>> = {
  ease: { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1.0 },
  'ease-in': { x1: 0.42, y1: 0, x2: 1.0, y2: 1.0 },
  'ease-out': { x1: 0, y1: 0, x2: 0.58, y2: 1.0 },
  'ease-in-out': { x1: 0.42, y1: 0, x2: 0.58, y2: 1.0 },
};

const STEPS_RE = /^steps\((\d+)\)$/;

/** `n`, or `null` when `name` is not `steps(n)` shaped at all. */
const parseSteps = (name: string): number | null => {
  const match = STEPS_RE.exec(name.trim());
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) && n >= 1 ? n : null;
};

const bezierComponent = (t: number, p1: number, p2: number): number => {
  const inv = 1 - t;
  return 3 * inv * inv * t * p1 + 3 * inv * t * t * p2 + t * t * t;
};

/** Bisection, not Newton-Raphson - this curve is monotonic in X by
 *  construction (every named curve's control points keep it so) and a dozen
 *  iterations is already far finer than a display pixel needs. */
const solveBezierT = (x: number, curve: CubicBezier): number => {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 20; i += 1) {
    const mid = (lo + hi) / 2;
    if (bezierComponent(mid, curve.x1, curve.x2) < x) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
};

const bezierEase = (t: number, curve: CubicBezier): number => bezierComponent(solveBezierT(t, curve), curve.y1, curve.y2);

/** `steps(n)`, jump-end (the CSS default): held at 0 through the first
 *  1/n of the span, then jumps once per step, landing on 1 only at t=1 -
 *  discrete, never interpolated, which is what a sprite-sheet frame needs. */
const stepsEase = (t: number, n: number): number => {
  if (t >= 1) return 1;
  if (t <= 0) return 0;
  return Math.floor(t * n) / n;
};

/** Never throws on an unrecognised name - it reads as linear, the same
 *  fallback every other malformed-but-optional field in this document model
 *  folds to instead of refusing a whole frame over one easing typo that
 *  should have been caught at validation. */
const easingFn = (name: string | undefined): ((t: number) => number) => {
  if (name === undefined || name === 'linear') return (t) => Math.min(1, Math.max(0, t));
  const steps = parseSteps(name);
  if (steps !== null) return (t) => stepsEase(t, steps);
  const curve = NAMED_BEZIERS[name];
  if (curve) return (t) => bezierEase(Math.min(1, Math.max(0, t)), curve);
  return (t) => Math.min(1, Math.max(0, t));
};

export { easingFn, parseSteps };
