/* @layer shared-hud @kind logic */
import { NAMED_EASINGS, STEPS_AT_LEAST_ONE_RE } from './validate-motion.constants';
import type { Issues } from '../validate-box';

const easingAt = (value: unknown, path: string, issues: Issues): string | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === 'string' && ((NAMED_EASINGS as readonly string[]).includes(value) || STEPS_AT_LEAST_ONE_RE.test(value))) {
    return value;
  }
  issues.push(`${path}: expected linear, ease, ease-in, ease-out, ease-in-out or steps(n), got ${JSON.stringify(value)}`);
  return undefined;
};

export { easingAt };
