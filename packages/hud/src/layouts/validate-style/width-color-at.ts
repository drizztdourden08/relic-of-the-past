/* @layer shared-hud @kind logic */
import { checkKeys, isRecord } from '../validate-box';
import { validateValue } from '../validate-value';
import { paintAt } from './paint-at';
import type { Issues } from '../validate-box';
import type { Paint, Value } from '../../types/hud-value';

const widthColorAt = (
  value: unknown, path: string, issues: Issues, insideRepeat = false,
): { width: Value; color: Paint } | undefined => {
  if (value === undefined) return undefined;
  if (!isRecord(value)) { issues.push(`${path}: expected { width, color }`); return undefined; }
  checkKeys(value, ['width', 'color'], path, issues);
  const width = validateValue(value.width, `${path}.width`, issues, { insideRepeat });
  const color = paintAt(value.color, `${path}.color`, issues, { required: true, insideRepeat });
  if (width === undefined || color === undefined) return undefined;
  return { width, color };
};

export { widthColorAt };
