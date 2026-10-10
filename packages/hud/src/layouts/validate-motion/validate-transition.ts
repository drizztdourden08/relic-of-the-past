/* @layer shared-hud @kind logic */
import { checkKeys, isRecord } from '../validate-box';
import { validateValue } from '../validate-value';
import { easingAt } from './easing-at';
import { gateAt } from './gate-at';
import {
  ENTER_EXIT_PROPERTIES, TRANSITION_KEYS, TRANSITION_ONLY_NAMES, TRANSITION_PROPERTIES,
} from './validate-motion.constants';
import type { Issues } from '../validate-box';
import type { HudEnterExitTransition, HudTransition } from '../../types/hud-motion';

const enumArrayAt = <T extends string>(
  value: unknown, allowed: readonly T[], path: string, issues: Issues, allowEmpty = false,
): T[] | undefined => {
  if (!Array.isArray(value) || (value.length === 0 && !allowEmpty)) {
    issues.push(`${path}: expected a non-empty array of ${allowed.join(', ')}`);
    return undefined;
  }
  const bad: unknown = value.find((p: unknown) => !(allowed as readonly string[]).includes(p as string));
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
  checkKeys(value, TRANSITION_KEYS, path, issues);
  const allowEmptyProperties = true;
  const properties = enumArrayAt(value.properties, TRANSITION_PROPERTIES, `${path}.properties`, issues, allowEmptyProperties);
  const duration = validateValue(value.duration, `${path}.duration`, issues, { insideRepeat });
  if (properties === undefined || duration === undefined) {
    if (duration === undefined && value.duration === undefined) issues.push(`${path}.duration: a transition needs a duration`);
    return undefined;
  }
  const easing = easingAt(value.easing, `${path}.easing`, issues);
  const when = gateAt(value.when, `${path}.when`, issues, insideRepeat, TRANSITION_ONLY_NAMES);
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

export { validateTransition };
