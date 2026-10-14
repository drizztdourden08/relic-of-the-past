/* @layer shared-hud @kind logic */
import { checkKeys, isRecord, numberAt, oneOf } from './validate-box';
import { paintAt } from './validate-style';
import { validateValue } from './validate-value';
import { ALIGN, FONT_FAMILIES, PAD, SPRITE_SETS, TEXT_KEYS } from './validate-text-node.constants';
import type { Issues } from './validate-box';
import type { HudTextFace, HudTextFormat, HudTextSpec } from '../types/hud-text';
import type { Paint, Value } from '../types/hud-value';
import type { TextPaintFragment, TextPaintParts } from './validate-text-node.type';

const formatAt = (value: unknown, path: string, issues: Issues): HudTextFormat | undefined => {
  if (value === undefined) return undefined;
  if (!isRecord(value)) { issues.push(`${path}: expected { digits?, pad? }`); return undefined; }
  checkKeys(value, ['digits', 'pad'], path, issues);
  const digits = numberAt(value.digits, `${path}.digits`, issues);
  if (digits !== undefined && (!Number.isInteger(digits) || digits < 1)) {
    issues.push(`${path}.digits: expected a whole number of 1 or more`);
  }
  const pad: HudTextFormat['pad'] = oneOf(value.pad, PAD, `${path}.pad`, issues);
  return { ...(digits !== undefined ? { digits } : {}), ...(pad ? { pad } : {}) };
};

const spriteFaceAt = (value: Record<string, unknown>, path: string, issues: Issues): HudTextFace | undefined => {
  checkKeys(value, ['from', 'set'], path, issues);
  if (typeof value.set !== 'string' || !(SPRITE_SETS as readonly string[]).includes(value.set)) {
    issues.push(`${path}.set: expected one of ${SPRITE_SETS.join(', ')}, got ${JSON.stringify(value.set)}`);
    return undefined;
  }
  return { from: 'sprite', set: value.set as 'hud-digits' | 'pause-letters' };
};

const fontFaceAt = (value: Record<string, unknown>, path: string, issues: Issues): HudTextFace | undefined => {
  checkKeys(value, ['from', 'family', 'size', 'weight'], path, issues);
  if (typeof value.family !== 'string' || !(FONT_FAMILIES as readonly string[]).includes(value.family)) {
    issues.push(`${path}.family: expected one of ${FONT_FAMILIES.join(', ')}, got ${JSON.stringify(value.family)}`);
    return undefined;
  }
  const size = numberAt(value.size, `${path}.size`, issues);
  if (size === undefined || size <= 0) { issues.push(`${path}.size: must be greater than zero`); return undefined; }
  const weight = numberAt(value.weight, `${path}.weight`, issues);
  return {
    from: 'font', family: value.family as 'game' | 'sans' | 'mono', size, ...(weight !== undefined ? { weight } : {}),
  };
};

const faceAt = (value: unknown, path: string, issues: Issues): HudTextFace | undefined => {
  if (!isRecord(value)) { issues.push(`${path}: a text element needs a face`); return undefined; }
  if (value.from === 'sprite') return spriteFaceAt(value, path, issues);
  if (value.from === 'font') return fontFaceAt(value, path, issues);
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
  const color = paintAt(value.color, `${path}.color`, issues, { required: true, insideRepeat });
  if (width === undefined || color === undefined) return undefined;
  return { width, color };
};

const paintParts = ({ color, stroke, align, tracking }: TextPaintParts): TextPaintFragment => ({
  ...(color !== undefined ? { color } : {}),
  ...(stroke ? { stroke } : {}),
  ...(align ? { align } : {}),
  ...(tracking !== undefined ? { tracking } : {}),
});

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
  const color = paintAt(value.color, `${path}.color`, issues, { insideRepeat });
  const stroke = strokeAt(value.stroke, `${path}.stroke`, issues, insideRepeat);
  const align: 'start' | 'center' | 'end' | undefined = oneOf(value.align, ALIGN, `${path}.align`, issues);
  const tracking = numberAt(value.tracking, `${path}.tracking`, issues);
  return {
    type: 'text',
    value: textValue,
    ...(format && Object.keys(format).length ? { format } : {}),
    face,
    ...paintParts({ color, stroke, align, tracking }),
  };
};

export { textSpec };
