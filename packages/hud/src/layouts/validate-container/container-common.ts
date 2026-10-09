/* @layer shared-hud @kind logic */
import { checkKeys, isRecord } from '../validate-box';
import { validateValue } from '../validate-value';
import type { HudGap, HudGuide } from '../../types/hud-node';
import type { Value } from '../../types/hud-value';
import type { Issues } from '../validate-box';

const gapAxisAt = (value: unknown, path: string, issues: Issues, insideRepeat: boolean): Value | undefined => {
  if (value === undefined) return undefined;
  const resolved = validateValue(value, path, issues, { insideRepeat });
  if (typeof resolved === 'number' && resolved < 0) {
    issues.push(`${path}: a gap cannot be negative`);
  }
  return resolved;
};

const gapAt = (
  value: unknown, path: string, issues: Issues, insideRepeat = false,
): HudGap | undefined => {
  if (value === undefined) return undefined;
  if (!isRecord(value)) { issues.push(`${path}: expected { x?, y? }`); return undefined; }
  checkKeys(value, ['x', 'y'], path, issues);
  const x = gapAxisAt(value.x, `${path}.x`, issues, insideRepeat);
  const y = gapAxisAt(value.y, `${path}.y`, issues, insideRepeat);
  return { ...(x !== undefined ? { x } : {}), ...(y !== undefined ? { y } : {}) };
};

const guideAt = (value: unknown, path: string, issues: Issues): HudGuide | undefined => {
  if (value === undefined) return undefined;
  if (!isRecord(value)) { issues.push(`${path}: expected { show, color }`); return undefined; }
  checkKeys(value, ['show', 'color'], path, issues);
  if (typeof value.show !== 'boolean') { issues.push(`${path}.show: expected true or false`); return undefined; }
  if (typeof value.color !== 'string' || !value.color.trim()) { issues.push(`${path}.color: expected a colour string`); return undefined; }
  return { show: value.show, color: value.color };
};

const containerCommon = (
  value: Record<string, unknown>, path: string, issues: Issues, insideRepeat: boolean,
): { gap?: HudGap; guide?: HudGuide } => {
  const gap = gapAt(value.gap, `${path}.gap`, issues, insideRepeat);
  const guide = guideAt(value.guide, `${path}.guide`, issues);
  return {
    ...(gap && Object.keys(gap).length ? { gap } : {}),
    ...(guide ? { guide } : {}),
  };
};

export { containerCommon };
