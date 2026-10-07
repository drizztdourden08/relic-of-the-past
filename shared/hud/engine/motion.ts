/* @layer shared-hud @kind logic */
/**
 * Motion, sampled: keyframe animation and value-transition interpolation, both
 * pure functions of a clock the CALLER owns. Nothing here schedules a timer,
 * touches the DOM or remembers a previous frame - `apps/web/.../HudNodeMotion`
 * is where a clock and "what changed since last render" turn into these calls.
 *
 * WHY A SHARED CLOCK, NOT ONE PER NODE. `elapsedMs` is one number - ms since
 * the surface mounted - and every animation reads its OWN position in it via
 * `delay`: two nodes with `delay: 0` and `delay: 'index * 80'` are already out
 * of phase against the identical clock, which is the whole staggering
 * mechanism (`tests/hud/hud-motion.keep.test.ts` proves it). No per-node start
 * time to track, and gating an animation on/off with `when` never resets it -
 * it samples wherever the shared clock already is the instant it turns
 * true, which is the simpler rule and correct for every case this document
 * model has (nothing here asks for "restart from the top on activation").
 *
 * THE REFLOW RULE, ENFORCED STRUCTURALLY. `sampleAnimation` never returns
 * anything for `width`/`height` that the renderer could feed back into the
 * PLACEMENT pass - it returns a resolved pixel number, same as any other
 * property, and the renderer applies it as a transform/filter overlay on the
 * node's own already-placed box (`resolve-node-motion.ts`), never by
 * re-measuring. So the six safe properties structurally cannot move a
 * sibling; `width`/`height` visibly resize the node itself but do not cascade
 * - `validate-motion-warnings.ts` is what tells an author they asked for that.
 */

import { easingFn } from './motion-easing';
import { resolveValue } from '../data/resolve-value';
import type { HudAnimatableProperty, HudAnimation, HudAnimationKeyframe, HudAnimationLoop } from '../../types/hud/hud-motion';

type Scope = Readonly<Record<string, number>>;

/** `width`/`height` can reflow a sibling under a flex/grid parent; the other
 *  six are drawn after placement and never can (see the file header). */
const REFLOW_ANIMATABLE_PROPERTIES: ReadonlySet<HudAnimatableProperty> = new Set(['width', 'height']);

/** `when`/a switch case's `when` share this reading: truthy is non-zero,
 *  never parsed as a bindable `Value`. */
const gateTruthy = (expr: string, scope: Scope): boolean => resolveValue({ from: 'data', expr }, scope) !== 0;

/**
 * Where in the keyframe track `elapsedMs` falls, from 0 to 1. `none` clamps at the
 * end, `loop` wraps, `ping-pong` reflects. Before `delayMs` has elapsed this
 * is 0 (the rest pose, keyframe `at: 0`), not undefined, so an animation
 * whose gate just turned true does not flash to some arbitrary mid-track
 * value while its delay is still running.
 */
const cyclePosition = (elapsedMs: number, delayMs: number, durationMs: number, loop: HudAnimationLoop): number => {
  const since = elapsedMs - delayMs;
  if (since <= 0) return 0;
  if (durationMs <= 0) return 1;
  const raw = since / durationMs;
  if (loop === 'none') return Math.min(1, raw);
  if (loop === 'loop') return raw % 1;
  const cycle = raw % 2;
  return cycle <= 1 ? cycle : 2 - cycle;
};

/** The value at `t` (0-1 of the TRACK, not wall time) - clamped at the ends,
 *  eased per-span between the two bracketing keyframes. A span's own easing
 *  overrides the animation's default for that span only. */
const sampleKeyframes = (
  keyframes: readonly HudAnimationKeyframe[], t: number, scope: Scope, fallbackEasing: string | undefined,
): number => {
  if (keyframes.length === 0) return 0;
  const sorted = [...keyframes].sort((a, b) => a.at - b.at);
  if (t <= sorted[0].at) return resolveValue(sorted[0].value, scope);
  const last = sorted[sorted.length - 1];
  if (t >= last.at) return resolveValue(last.value, scope);

  for (let i = 0; i < sorted.length - 1; i += 1) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (t < a.at || t > b.at) continue;
    const span = b.at - a.at;
    const local = span <= 0 ? 1 : (t - a.at) / span;
    const eased = easingFn(a.easing ?? fallbackEasing)(local);
    const va = resolveValue(a.value, scope);
    const vb = resolveValue(b.value, scope);
    return va + (vb - va) * eased;
  }
  return resolveValue(last.value, scope);
};

/**
 * One animation, sampled at `elapsedMs`. `undefined` means "not active right
 * now" - its `when` gate read false - and the caller draws the property's
 * ordinary, unanimated value instead. Never throws: every `Value` it reads
 * goes through `resolveValue`, which never does either.
 */
const sampleAnimation = (animation: HudAnimation, elapsedMs: number, scope: Scope): number | undefined => {
  if (animation.when !== undefined && !gateTruthy(animation.when, scope)) return undefined;
  const duration = resolveValue(animation.duration, scope);
  const delay = animation.delay !== undefined ? resolveValue(animation.delay, scope) : 0;
  const t = cyclePosition(elapsedMs, delay, duration, animation.loop);
  return sampleKeyframes(animation.keyframes, t, scope, animation.easing);
};

/** A plain 0-1 eased progress for a value TRANSITION - `from` at 0, `to` at
 *  1, clamped, so a caller mid-flight when `duration` changes still lands. */
const transitionProgress = (elapsedMs: number, durationMs: number, easing: string | undefined): number => {
  if (durationMs <= 0) return 1;
  const raw = Math.min(1, Math.max(0, elapsedMs / durationMs));
  return easingFn(easing)(raw);
};

/** `from` eased toward `to` over `durationMs`, at `elapsedMs` since the value
 *  changed. The one interpolation a "bound value changed, ease toward it"
 *  transition needs - `HudNodeMotion`'s own hook owns remembering `from`. */
const sampleTransition = (
  from: number, to: number, elapsedMs: number, durationMs: number, easing: string | undefined,
): number => from + (to - from) * transitionProgress(elapsedMs, durationMs, easing);

/** 0 (not yet arrived/departed) to 1 (fully arrived/departed) for an
 *  enter/exit's own clock - `resolve-node-motion.ts` reads this as "how much
 *  of the fade/scale/settle has played". */
const enterExitProgress = (elapsedMs: number, durationMs: number, easing: string | undefined): number =>
  transitionProgress(elapsedMs, durationMs, easing);

export {
  cyclePosition, enterExitProgress, gateTruthy, REFLOW_ANIMATABLE_PROPERTIES, sampleAnimation, sampleKeyframes,
  sampleTransition, transitionProgress,
};
