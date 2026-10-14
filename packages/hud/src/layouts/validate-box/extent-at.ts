/* @layer shared-hud @kind logic */
import { validateValue } from '../validate-value';
import { isRecord } from './is-record';
import type { Extent } from '../../types/hud-node';
import type { ValueSite, Issues } from './validate-box.type';

const isBareExpression = (value: Record<string, unknown>): boolean => 'from' in value || 'expr' in value;

const unitOf = (value: Record<string, unknown>): 'px' | 'pct' | undefined => {
  const keys = Object.keys(value);
  const [key] = keys;
  return keys.length === 1 && (key === 'px' || key === 'pct') ? key : undefined;
};

const unitExtent = (inner: unknown, unit: 'px' | 'pct', site: ValueSite): Extent | undefined => {
  const v = validateValue(inner, `${site.path}.${unit}`, site.issues, site.context);
  if (v === undefined) return undefined;
  return unit === 'px' ? { px: v } : { pct: v };
};

const bareExtent = (value: Record<string, unknown>, site: ValueSite): Extent | undefined => {
  const v = validateValue(value, site.path, site.issues, site.context);
  return v === undefined || typeof v === 'number' ? undefined : v;
};

const extentAt = (value: unknown, path: string, issues: Issues, insideRepeat = false): Extent | undefined => {
  if (value === undefined) return undefined;
  if (value === 'auto' || value === 'fill') return value;
  if (isRecord(value)) {
    const site: ValueSite = { path, issues, context: { insideRepeat } };
    const unit = unitOf(value);
    if (unit) return unitExtent(value[unit], unit, site);
    if (isBareExpression(value)) return bareExtent(value, site);
  }
  issues.push(`${path}: expected 'auto', 'fill', { px } or { pct }, got ${JSON.stringify(value)}`);
  return undefined;
};

export { extentAt };
