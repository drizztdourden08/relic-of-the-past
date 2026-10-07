/* @layer shared-hud @kind logic */
/**
 * `text` is a string or a number, drawn in a sprite set or a real font.
 * Checked the same way every other element spec is: one property at a time,
 * refusing instead of guessing at anything malformed.
 */

import { checkKeys, isRecord, numberAt } from './validate-box';
import { paintAt } from './validate-style';
import { validateValue } from './validate-value';
import type { Issues } from './validate-box';
import type { HudTextFace, HudTextFormat, HudTextSpec } from '../../types/hud/hud-text';
import type { Paint, Value } from '../../types/hud/hud-value';

const PAD = ['none', 'zero', 'space'] as const;
const ALIGN = ['start', 'center', 'end'] as const;
const SPRITE_SETS = ['hud-digits', 'pause-letters'] as const;
const FONT_FAMILIES = ['game', 'sans', 'mono'] as const;

const formatAt = (value: unknown, path: string, issues: Issues): HudTextFormat | undefined => {
  if (value === undefined) return undefined;
  if (!isRecord(value)) { issues.push(`${path}: expected { digits?, pad? }`); return undefined; }
  checkKeys(value, ['digits', 'pad'], path, issues);
  const digits = numberAt(value.digits, `${path}.digits`, issues);
  if (digits !== undefined && (!Number.isInteger(digits) || digits < 1)) {
    issues.push(`${path}.digits: expected a whole number of 1 or more`);
  }
  const pad = value.pad === undefined ? undefined
    : (PAD as readonly unknown[]).includes(value.pad) ? (value.pad as HudTextFormat['pad'])
      : (issues.push(`${path}.pad: expected one of ${PAD.join(', ')}, got ${JSON.stringify(value.pad)}`), undefined);
  return { ...(digits !== undefined ? { digits } : {}), ...(pad ? { pad } : {}) };
};

const faceAt = (value: unknown, path: string, issues: Issues): HudTextFace | undefined => {
  if (!isRecord(value)) { issues.push(`${path}: a text element needs a face`); return undefined; }
  if (value.from === 'sprite') {
    checkKeys(value, ['from', 'set'], path, issues);
    if (typeof value.set !== 'string' || !(SPRITE_SETS as readonly string[]).includes(value.set)) {
      issues.push(`${path}.set: expected one of ${SPRITE_SETS.join(', ')}, got ${JSON.stringify(value.set)}`);
      return undefined;
    }
    return { from: 'sprite', set: value.set as 'hud-digits' | 'pause-letters' };
  }
  if (value.from === 'font') {
    checkKeys(value, ['from', 'family', 'size', 'weight'], path, issues);
    if (typeof value.family !== 'string' || !(FONT_FAMILIES as readonly string[]).includes(value.family)) {
      issues.push(`${path}.family: expected one of ${FONT_FAMILIES.join(', ')}, got ${JSON.stringify(value.family)}`);
      return undefined;
    }
    const size = numberAt(value.size, `${path}.size`, issues);
    if (size === undefined || size <= 0) { issues.push(`${path}.size: must be greater than zero`); return undefined; }
    const weight = value.weight !== undefined ? numberAt(value.weight, `${path}.weight`, issues) : undefined;
    return {
      from: 'font', family: value.family as 'game' | 'sans' | 'mono', size, ...(weight !== undefined ? { weight } : {}),
    };
  }
  issues.push(`${path}.from: expected 'sprite' or 'font', got ${JSON.stringify(value.from)}`);
  return undefined;
};

const strokeAt = (
  value: unknown, path: string, issues: Issues, insideRepeat: boolean,
): { width: Value; color: Paint } | undefined => {
  if (value === undefined) return undefined;
  if (!isRecord(value)) { issues.push(`${path}: expected { width, color }`); return undefined; }
  checkKeys(value, ['width', 'color'], path, issues);
  const width = validateValue(value.width, `${path}.width`, issues, { insideRepeat });
  const color = paintAt(value.color, `${path}.color`, issues, true, insideRepeat);
  if (width === undefined || color === undefined) return undefined;
  return { width, color };
};

const TEXT_KEYS = ['type', 'value', 'format', 'face', 'color', 'stroke', 'align', 'tracking'] as const;

const textSpec = (value: Record<string, unknown>, path: string, issues: Issues, insideRepeat = false): HudTextSpec | null => {
  checkKeys(value, TEXT_KEYS, path, issues);
  const rawValue = value.value;
  const textValue = typeof rawValue === 'string' ? rawValue : validateValue(rawValue, `${path}.value`, issues, { insideRepeat });
  if (textValue === undefined) {
    if (rawValue === undefined) issues.push(`${path}.value: a text element needs a value`);
    return null;
  }
  const format = formatAt(value.format, `${path}.format`, issues);
  const face = faceAt(value.face, `${path}.face`, issues);
  if (!face) return null;
  const color = paintAt(value.color, `${path}.color`, issues, false, insideRepeat);
  const stroke = strokeAt(value.stroke, `${path}.stroke`, issues, insideRepeat);
  const align = value.align === undefined ? undefined
    : (ALIGN as readonly unknown[]).includes(value.align) ? (value.align as 'start' | 'center' | 'end')
      : (issues.push(`${path}.align: expected one of ${ALIGN.join(', ')}, got ${JSON.stringify(value.align)}`), undefined);
  const tracking = value.tracking !== undefined ? numberAt(value.tracking, `${path}.tracking`, issues) : undefined;
  return {
    type: 'text',
    value: textValue,
    ...(format && Object.keys(format).length ? { format } : {}),
    face,
    ...(color !== undefined ? { color } : {}),
    ...(stroke ? { stroke } : {}),
    ...(align ? { align } : {}),
    ...(tracking !== undefined ? { tracking } : {}),
  };
};

export { textSpec };
