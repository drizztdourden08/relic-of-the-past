/* @layer shared-hud @kind logic */
import { checkKeys, isRecord, numberAt, oneOf } from '../validate-box';
import { validateValue } from '../validate-value';
import { easingAt } from './easing-at';
import { gateAt } from './gate-at';
import { ANIMATABLE_PROPERTIES, ANIMATION_KEYS, LOOPS } from './validate-motion.constants';
import type { Issues } from '../validate-box';
import type { HudAnimation, HudAnimationKeyframe } from '../../../types/hud/hud-motion';

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
  checkKeys(value, ANIMATION_KEYS, path, issues);
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

export { validateAnimations };
