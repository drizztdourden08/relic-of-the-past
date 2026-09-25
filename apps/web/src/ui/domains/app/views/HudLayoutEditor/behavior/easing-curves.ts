/* @layer renderer-components @kind logic */
/**
 * The easing surface an author may pick from, derived from the ENGINE rather
 * than re-typed beside it: `motion-easing.ts` is the only thing that decides
 * what a curve does, and `validate-motion.ts` is the only thing that decides
 * what a document may hold. This file offers exactly the intersection, which is the
 * five named curves plus `steps(n)`, and draws each one by SAMPLING
 * `easingFn`, so a picker thumbnail cannot drift from the curve it names.
 *
 * `steps(0)` IS UNREACHABLE FROM HERE, not merely discouraged. The validator's
 * own `/^steps\([1-9]\d*\)$/` refuses it ("`steps(0)` has nothing to step
 * between"), and `parseSteps` reads it as `null`, so `stepsName` clamps `n`
 * to 1 or more before it ever forms a string. A picker that can author a
 * document the validator will reject is a picker that blocks Save with no
 * field to blame.
 */
import { easingFn } from '@shared/hud/engine';
import type { HudEasing, HudNamedEasing } from '@shared/types/hud';

/** The five, in the order a person reads them: no curve, then the three
 *  one-sided ones, then both. Same list `validate-motion.ts` accepts. */
const NAMED_EASINGS: readonly HudNamedEasing[] = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'];

/** The thumbnail's own box, in its viewBox's units. Square, so the 45° line a
 *  `linear` curve draws reads as 45° and every other curve is judged against
 *  it by eye. */
const CURVE_BOX = 16;

/** Enough samples that `steps(4)`'s plateaus have flat tops and `ease-in-out`
 *  has no visible corners at 16 px, and few enough that the `d` string stays
 *  short enough to sit in a DOM attribute without comment. */
const CURVE_SAMPLES = 24;

const MIN_STEPS = 1;
const DEFAULT_STEPS = 3;

/** `steps(n)` with `n` forced into the range the validator accepts. A
 *  non-finite or fractional `n` (a half-typed spinner) folds to the default
 *  instead of forming `steps(NaN)`. */
const stepsName = (n: number): HudEasing =>
  `steps(${Math.max(MIN_STEPS, Math.floor(Number.isFinite(n) ? n : DEFAULT_STEPS))})`;

/** `n` when `name` is `steps(n)`, else `null`. It is the engine's own reader, so
 *  the picker and the sampler agree on what counts as a steps curve. */
const stepsCountOf = (name: string | undefined): number | null => {
  if (name === undefined) return null;
  const match = /^steps\((\d+)\)$/.exec(name.trim());
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) && n >= MIN_STEPS ? n : null;
};

/**
 * An SVG polyline `d` for one curve, in a `CURVE_BOX`-square viewBox with y
 * flipped (SVG's y grows downward; an easing's output grows upward). Sampled
 * from `easingFn`, never hand-drawn. An unrecognised name reads as linear
 * here for the same reason it does at render time.
 */
const curvePath = (name: string | undefined): string => {
  const fn = easingFn(name);
  const points: string[] = [];
  for (let i = 0; i <= CURVE_SAMPLES; i += 1) {
    const t = i / CURVE_SAMPLES;
    const x = t * CURVE_BOX;
    const y = CURVE_BOX - Math.min(1, Math.max(0, fn(t))) * CURVE_BOX;
    points.push(`${i === 0 ? 'M' : 'L'}${Math.round(x * 10) / 10} ${Math.round(y * 10) / 10}`);
  }
  return points.join(' ');
};

/** What the picker shows as the current selection's name. It is `default` when the
 *  field is unset and inherits the animation's own easing. */
const easingLabel = (value: string | undefined): string => value ?? 'default';

export {
  CURVE_BOX, CURVE_SAMPLES, curvePath, DEFAULT_STEPS, easingLabel, MIN_STEPS, NAMED_EASINGS, stepsCountOf, stepsName,
};
