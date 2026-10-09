/* @layer shared-hud @kind logic */
import { validateValue } from '../validate-value';
import { isRecord } from './is-record';
import type { Extent } from '../../types/hud-node';
import type { Issues } from './validate-box.type';

const isBareExpression = (value: Record<string, unknown>): boolean => 'from' in value || 'expr' in value;

const extentAt = (value: unknown, path: string, issues: Issues, insideRepeat = false): Extent | undefined => {
  if (value === undefined) return undefined;
  if (value === 'auto' || value === 'fill') return value;
  if (isRecord(value)) {
    const keys = Object.keys(value);
    const context = { insideRepeat };
    if (keys.length === 1 && (keys[0] === 'px' || keys[0] === 'pct')) {
      const v = validateValue(value[keys[0]], `${path}.${keys[0]}`, issues, context);
      if (v === undefined) return undefined;
      return keys[0] === 'px' ? { px: v } : { pct: v };
    }
    if (isBareExpression(value)) {
      const v = validateValue(value, path, issues, context);
      return v === undefined || typeof v === 'number' ? undefined : v;
    }
  }
  issues.push(`${path}: expected 'auto', 'fill', { px } or { pct }, got ${JSON.stringify(value)}`);
  return undefined;
};

export { extentAt };
