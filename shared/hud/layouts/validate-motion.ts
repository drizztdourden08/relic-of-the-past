/* @layer shared-hud @kind logic */
/**
 * `animation`/`transition`, checked the same way every other node-level
 * section is - one field at a time, refusing instead of guessing at
 * anything malformed. Called from the three sites that already validate
 * `style` this way (`validate-node.ts`'s `validateElement`,
 * `validate-container.ts`'s flex and grid paths), since `animation`/
 * `transition` live on `HudBox` beside `style` and share its threading
 * (`insideRepeat` - a `when`/duration/delay/keyframe value inside a
 * `repeat`'s subtree may name `index`/`count`/`item`, exactly as `style`'s
 * own bound fields already can).
 *
 * A bare `when` is an EXPRESSION STRING, not a `Value` - the same shape a
 * `switch` case's `when` is (`validate-dynamic-node.ts`). It is checked by
 * wrapping it in `{ from: 'data', expr }` and handing it to `validateValue`,
 * which reuses its compile-and-check-variables path instead of re-deriving
 * it; the wrapper is discarded and only the original string is kept.
 */

import { checkKeys, isRecord, numberAt, oneOf } from './validate-box';
import { validateValue } from './validate-value';
import type { Issues } from './validate-box';
import type {
  HudAnimatableProperty, HudAnimation, HudAnimationKeyframe, HudAnimationLoop, HudEnterExitProperty,
  HudEnterExitTransition, HudTransition, HudTransitionProperty,
} from '../../types/hud/hud-motion';

const ANIMATABLE_PROPERTIES: readonly HudAnimatableProperty[] = [
  'scale', 'opacity', 'x', 'y', 'rotate', 'tint', 'width', 'height',
];
const LOOPS: readonly HudAnimationLoop[] = ['none', 'loop', 'ping-pong'];
const TRANSITION_PROPERTIES: readonly HudTransitionProperty[] = ['size', 'position', 'opacity', 'scale', 'tint', 'color'];
const ENTER_EXIT_PROPERTIES: readonly HudEnterExitProperty[] = ['opacity', 'scale', 'position'];

const NAMED_EASINGS = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'] as const;
/** `n` must be 1 or more - `steps(0)` has nothing to step between. */
const STEPS_RE = /^steps\([1-9]\d*\)$/;

const easingAt = (value: unknown, path: string, issues: Issues): string | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === 'string' && ((NAMED_EASINGS as readonly string[]).includes(value) || STEPS_RE.test(value))) {
    return value;
  }
  issues.push(`${path}: expected linear, ease, ease-in, ease-out, ease-in-out or steps(n), got ${JSON.stringify(value)}`);
  return undefined;
};

/** A bare expression string - never a `Value` - checked by wrapping it.
 *  `extraNames` is how `transition.when`'s own `delta` (meaningless anywhere
 *  else in the document) gets past the unknown-variable check without
 *  becoming a real table entry or a repeat-only scope extra. */
const gateAt = (
  value: unknown, path: string, issues: Issues, insideRepeat: boolean, extraNames: readonly string[] = [],
): string | undefined => {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') { issues.push(`${path}: expected an expression string`); return undefined; }
  const wrapped = validateValue({ from: 'data', expr: value }, path, issues, { insideRepeat, extraNames });
  return wrapped === undefined ? undefined : value;
};

const keyframeAt = (
  value: unknown, path: string, issues: Issues, insideRepeat: boolean,
): HudAnimationKeyframe | undefined => {
  if (!isRecord(value)) { issues.push(`${path}: expected a keyframe object`); return undefined; }
  checkKeys(value, ['at', 'value', 'easing'], path, issues);
  const at = numberAt(value.at, `${path}.at`, issues);
  if (at === undefined) { if (value.at === undefined) issues.push(`${path}.at: a keyframe needs 'at'`); return undefined; }
  if (at < 0 || at > 1) issues.push(`${path}.at: must be between 0 and 1`);
  const v = validateValue(value.value, `${path}.value`, issues, { insideRepeat });
  if (v === undefined) { if (value.value === undefined) issues.push(`${path}.value: a keyframe needs a value`); return undefined; }
  const easing = easingAt(value.easing, `${path}.easing`, issues);
  return { at, value: v, ...(easing ? { easing } : {}) };
};

const animationAt = (value: unknown, path: string, issues: Issues, insideRepeat: boolean): HudAnimation | undefined => {
  if (!isRecord(value)) { issues.push(`${path}: expected an animation object`); return undefined; }
  checkKeys(value, ['when', 'property', 'keyframes', 'duration', 'delay', 'loop', 'easing'], path, issues);
  const property = oneOf(value.property, ANIMATABLE_PROPERTIES, `${path}.property`, issues);
  if (!property) { if (value.property === undefined) issues.push(`${path}.property: an animation needs a property`); return undefined; }
  const when = gateAt(value.when, `${path}.when`, issues, insideRepeat);
  if (!Array.isArray(value.keyframes) || value.keyframes.length < 2) {
    issues.push(`${path}.keyframes: an animation needs at least two`);
    return undefined;
  }
  const keyframes = value.keyframes.map((k, i) => keyframeAt(k, `${path}.keyframes[${i}]`, issues, insideRepeat));
  if (keyframes.some((k) => k === undefined)) return undefined;
  const duration = validateValue(value.duration, `${path}.duration`, issues, { insideRepeat });
  if (duration === undefined) { if (value.duration === undefined) issues.push(`${path}.duration: an animation needs a duration`); return undefined; }
  const delay = value.delay !== undefined ? validateValue(value.delay, `${path}.delay`, issues, { insideRepeat }) : undefined;
  const loop = oneOf(value.loop, LOOPS, `${path}.loop`, issues);
  if (!loop) { if (value.loop === undefined) issues.push(`${path}.loop: expected one of ${LOOPS.join(', ')}`); return undefined; }
  const easing = easingAt(value.easing, `${path}.easing`, issues);
  return {
    property, keyframes: keyframes as HudAnimationKeyframe[], duration, loop,
    ...(when ? { when } : {}), ...(delay !== undefined ? { delay } : {}), ...(easing ? { easing } : {}),
  };
};

const validateAnimations = (
  value: unknown, path: string, issues: Issues, insideRepeat = false,
): HudAnimation[] | undefined => {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) { issues.push(`${path}: expected an array of animations`); return undefined; }
  const animations = value.map((a, i) => animationAt(a, `${path}[${i}]`, issues, insideRepeat));
  return animations.some((a) => a === undefined) ? undefined : (animations as HudAnimation[]);
};

const enumArrayAt = <T extends string>(
  value: unknown, allowed: readonly T[], path: string, issues: Issues, allowEmpty = false,
): T[] | undefined => {
  if (!Array.isArray(value) || (value.length === 0 && !allowEmpty)) {
    issues.push(`${path}: expected a non-empty array of ${allowed.join(', ')}`);
    return undefined;
  }
  const bad = value.find((p) => !(allowed as readonly string[]).includes(p as string));
  if (bad !== undefined) { issues.push(`${path}: expected only ${allowed.join(', ')}, got ${JSON.stringify(bad)}`); return undefined; }
  return value as T[];
};

const enterExitAt = (
  value: unknown, path: string, issues: Issues, insideRepeat: boolean,
): HudEnterExitTransition | undefined => {
  if (value === undefined) return undefined;
  if (!isRecord(value)) { issues.push(`${path}: expected { properties, duration, easing? }`); return undefined; }
  checkKeys(value, ['properties', 'duration', 'easing'], path, issues);
  const properties = enumArrayAt(value.properties, ENTER_EXIT_PROPERTIES, `${path}.properties`, issues);
  const duration = validateValue(value.duration, `${path}.duration`, issues, { insideRepeat });
  if (properties === undefined || duration === undefined) {
    if (duration === undefined && value.duration === undefined) issues.push(`${path}.duration: needs a duration`);
    return undefined;
  }
  const easing = easingAt(value.easing, `${path}.easing`, issues);
  return { properties, duration, ...(easing ? { easing } : {}) };
};

const validateTransition = (
  value: unknown, path: string, issues: Issues, insideRepeat = false,
): HudTransition | undefined => {
  if (value === undefined) return undefined;
  if (!isRecord(value)) { issues.push(`${path}: expected a transition object`); return undefined; }
  checkKeys(value, ['properties', 'duration', 'easing', 'when', 'enter', 'exit'], path, issues);
  // EMPTY IS ALLOWED HERE, unlike on an enter/exit's own `properties`, and the
  // check moves below: `transition` is one object holding two unrelated ideas
  // (value transitions, and the node itself arriving/leaving), so an ENTER-ONLY
  // transition is a legitimate document - a node whose only motion need is a
  // fade-in when its `repeat` produces it has no value property to list. Phase
  // 10 of `plans/hud-inspector-ux-review.html` makes that authorable in the
  // panel ("enter/exit always reachable"), and it would have written a document
  // this validator refused. What is still refused is an object holding NOTHING.
  const properties = enumArrayAt(value.properties, TRANSITION_PROPERTIES, `${path}.properties`, issues, true);
  const duration = validateValue(value.duration, `${path}.duration`, issues, { insideRepeat });
  if (properties === undefined || duration === undefined) {
    if (duration === undefined && value.duration === undefined) issues.push(`${path}.duration: a transition needs a duration`);
    return undefined;
  }
  const easing = easingAt(value.easing, `${path}.easing`, issues);
  const when = gateAt(value.when, `${path}.when`, issues, insideRepeat, ['delta']);
  const enter = enterExitAt(value.enter, `${path}.enter`, issues, insideRepeat);
  const exit = enterExitAt(value.exit, `${path}.exit`, issues, insideRepeat);
  if (properties.length === 0 && enter === undefined && exit === undefined) {
    issues.push(`${path}: a transition needs at least one property, or an enter or an exit`);
    return undefined;
  }
  return {
    properties, duration,
    ...(easing ? { easing } : {}), ...(when ? { when } : {}), ...(enter ? { enter } : {}), ...(exit ? { exit } : {}),
  };
};

export { validateAnimations, validateTransition };
