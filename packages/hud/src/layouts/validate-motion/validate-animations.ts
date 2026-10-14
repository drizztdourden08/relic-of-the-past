/* @layer shared-hud @kind logic */
import { checkKeys, isRecord, numberAt, oneOf, reportMissing } from '../validate-box';
import { validateValue } from '../validate-value';
import { easingAt } from './easing-at';
import { gateAt } from './gate-at';
import { ANIMATABLE_PROPERTIES, ANIMATION_KEYS, LOOPS } from './validate-motion.constants';
import type { Issues } from '../validate-box';
import type { HudAnimation, HudAnimationKeyframe } from '../../types/hud-motion';
import type { OptionalAnimationParts } from './validate-motion.type';

const keyframeAt = (
  value: unknown, path: string, issues: Issues, insideRepeat: boolean,
): HudAnimationKeyframe | undefined => {
  if (!isRecord(value)) { issues.push(`${path}: expected a keyframe object`); return undefined; }
  checkKeys(value, ['at', 'value', 'easing'], path, issues);
  const at = numberAt(value.at, `${path}.at`, issues);
  if (at === undefined) return reportMissing(value.at, `${path}.at: a keyframe needs 'at'`, issues);
  if (at < 0 || at > 1) issues.push(`${path}.at: must be between 0 and 1`);
  const v = validateValue(value.value, `${path}.value`, issues, { insideRepeat });
  if (v === undefined) return reportMissing(value.value, `${path}.value: a keyframe needs a value`, issues);
  const easing = easingAt(value.easing, `${path}.easing`, issues);
  return { at, value: v, ...(easing ? { easing } : {}) };
};

const keyframesAt = (
  value: Record<string, unknown>, path: string, issues: Issues, insideRepeat: boolean,
): HudAnimationKeyframe[] | undefined => {
  if (!Array.isArray(value.keyframes) || value.keyframes.length < 2) {
    issues.push(`${path}.keyframes: an animation needs at least two`);
    return undefined;
  }
  const keyframes = value.keyframes.map((k, i) => keyframeAt(k, `${path}.keyframes[${i}]`, issues, insideRepeat));
  const valid = keyframes.filter((k): k is HudAnimationKeyframe => k !== undefined);
  return valid.length === keyframes.length ? valid : undefined;
};

const optionalParts = ({ when, delay, easing }: OptionalAnimationParts): Partial<HudAnimation> => ({
  ...(when ? { when } : {}),
  ...(delay !== undefined ? { delay } : {}),
  ...(easing ? { easing } : {}),
});

const animationAt = (value: unknown, path: string, issues: Issues, insideRepeat: boolean): HudAnimation | undefined => {
  if (!isRecord(value)) { issues.push(`${path}: expected an animation object`); return undefined; }
  checkKeys(value, ANIMATION_KEYS, path, issues);
  const property = oneOf(value.property, ANIMATABLE_PROPERTIES, `${path}.property`, issues);
  if (!property) return reportMissing(value.property, `${path}.property: an animation needs a property`, issues);
  const when = gateAt(value.when, `${path}.when`, issues, { insideRepeat });
  const keyframes = keyframesAt(value, path, issues, insideRepeat);
  if (!keyframes) return undefined;
  const duration = validateValue(value.duration, `${path}.duration`, issues, { insideRepeat });
  if (duration === undefined) return reportMissing(value.duration, `${path}.duration: an animation needs a duration`, issues);
  const delay = value.delay !== undefined ? validateValue(value.delay, `${path}.delay`, issues, { insideRepeat }) : undefined;
  const loop = oneOf(value.loop, LOOPS, `${path}.loop`, issues);
  if (!loop) return reportMissing(value.loop, `${path}.loop: expected one of ${LOOPS.join(', ')}`, issues);
  const easing = easingAt(value.easing, `${path}.easing`, issues);
  return { property, keyframes, duration, loop, ...optionalParts({ when, delay, easing }) };
};

const validateAnimations = (
  value: unknown, path: string, issues: Issues, insideRepeat = false,
): HudAnimation[] | undefined => {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) { issues.push(`${path}: expected an array of animations`); return undefined; }
  const animations = value.map((a, i) => animationAt(a, `${path}[${i}]`, issues, insideRepeat));
  const valid = animations.filter((a): a is HudAnimation => a !== undefined);
  return valid.length === animations.length ? valid : undefined;
};

export { validateAnimations };
