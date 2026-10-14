/* @layer shared-hud @kind logic */
import { checkKeys, isRecord, reportMissing } from '../validate-box';
import { validateValue } from '../validate-value';
import { easingAt } from './easing-at';
import { gateAt } from './gate-at';
import {
  ENTER_EXIT_PROPERTIES, TRANSITION_KEYS, TRANSITION_ONLY_NAMES, TRANSITION_PROPERTIES,
} from './validate-motion.constants';
import type { Issues } from '../validate-box';
import type { HudEnterExitTransition, HudTransition } from '../../types/hud-motion';
import type { EnumArraySpec, TransitionParts } from './validate-motion.type';

const enumArrayAt = <T extends string>(
  value: unknown, spec: EnumArraySpec<T>, path: string, issues: Issues,
): T[] | undefined => {
  const { allowed, allowEmpty = false } = spec;
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
  const properties = enumArrayAt(value.properties, { allowed: ENTER_EXIT_PROPERTIES }, `${path}.properties`, issues);
  const duration = validateValue(value.duration, `${path}.duration`, issues, { insideRepeat });
  if (properties === undefined || duration === undefined) {
    if (duration === undefined) return reportMissing(value.duration, `${path}.duration: needs a duration`, issues);
    return undefined;
  }
  const easing = easingAt(value.easing, `${path}.easing`, issues);
  return { properties, duration, ...(easing ? { easing } : {}) };
};

const coreAt = (
  value: Record<string, unknown>, path: string, issues: Issues, insideRepeat: boolean,
): Pick<HudTransition, 'properties' | 'duration'> | undefined => {
  const spec = { allowed: TRANSITION_PROPERTIES, allowEmpty: true };
  const properties = enumArrayAt(value.properties, spec, `${path}.properties`, issues);
  const duration = validateValue(value.duration, `${path}.duration`, issues, { insideRepeat });
  if (properties === undefined || duration === undefined) {
    if (duration === undefined) return reportMissing(value.duration, `${path}.duration: a transition needs a duration`, issues);
    return undefined;
  }
  return { properties, duration };
};

const partsAt = (value: Record<string, unknown>, path: string, issues: Issues, insideRepeat: boolean): TransitionParts => ({
  easing: easingAt(value.easing, `${path}.easing`, issues),
  when: gateAt(value.when, `${path}.when`, issues, { insideRepeat, extraNames: TRANSITION_ONLY_NAMES }),
  enter: enterExitAt(value.enter, `${path}.enter`, issues, insideRepeat),
  exit: enterExitAt(value.exit, `${path}.exit`, issues, insideRepeat),
});

const optionalParts = ({ easing, when, enter, exit }: TransitionParts): Partial<HudTransition> => ({
  ...(easing ? { easing } : {}), ...(when ? { when } : {}), ...(enter ? { enter } : {}), ...(exit ? { exit } : {}),
});

const validateTransition = (
  value: unknown, path: string, issues: Issues, insideRepeat = false,
): HudTransition | undefined => {
  if (value === undefined) return undefined;
  if (!isRecord(value)) { issues.push(`${path}: expected a transition object`); return undefined; }
  checkKeys(value, TRANSITION_KEYS, path, issues);
  const core = coreAt(value, path, issues, insideRepeat);
  if (!core) return undefined;
  const parts = partsAt(value, path, issues, insideRepeat);
  if (core.properties.length === 0 && parts.enter === undefined && parts.exit === undefined) {
    issues.push(`${path}: a transition needs at least one property, or an enter or an exit`);
    return undefined;
  }
  return { ...core, ...optionalParts(parts) };
};

export { validateTransition };
