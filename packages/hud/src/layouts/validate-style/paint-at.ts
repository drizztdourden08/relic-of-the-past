/* @layer shared-hud @kind logic */
import { checkKeys, isRecord, numberAt, oneOf } from '../validate-box';
import { validateValue } from '../validate-value';
import { GRADIENTS, IMAGE_SIZES, REPEATS } from './validate-style.constants';
import type { PaintOptions } from './validate-style.type';
import type { Issues } from '../validate-box';
import type { GradientStop, Paint } from '../../types/hud-value';

const stopAt = (value: unknown, path: string, issues: Issues): GradientStop | undefined => {
  if (!isRecord(value)) { issues.push(`${path}: expected { at, color }`); return undefined; }
  checkKeys(value, ['at', 'color'], path, issues);
  const at = numberAt(value.at, `${path}.at`, issues);
  if (typeof value.color !== 'string' || !value.color.trim()) {
    issues.push(`${path}.color: expected a colour string`);
    return undefined;
  }
  if (at === undefined) return undefined;
  return { at, color: value.color };
};

const gradientPaint = (value: Record<string, unknown>, path: string, issues: Issues, insideRepeat: boolean): Paint | undefined => {
  checkKeys(value, ['gradient', 'angle', 'stops'], path, issues);
  const gradient = oneOf(value.gradient, GRADIENTS, `${path}.gradient`, issues);
  const angle = validateValue(value.angle, `${path}.angle`, issues, { insideRepeat });
  if (!Array.isArray(value.stops) || value.stops.length === 0) {
    issues.push(`${path}.stops: expected a non-empty array of { at, color }`);
    return undefined;
  }
  const stops = value.stops
    .map((stop, i) => stopAt(stop, `${path}.stops[${i}]`, issues))
    .filter((stop): stop is GradientStop => stop !== undefined);
  if (!gradient || stops.length !== value.stops.length) return undefined;
  return { gradient, ...(angle !== undefined ? { angle } : {}), stops };
};

const imagePaint = (value: Record<string, unknown>, path: string, issues: Issues): Paint | undefined => {
  checkKeys(value, ['image', 'repeat', 'size'], path, issues);
  if (typeof value.image !== 'string' || !value.image.trim()) {
    issues.push(`${path}.image: expected a file name`);
    return undefined;
  }
  const repeat = oneOf(value.repeat, REPEATS, `${path}.repeat`, issues);
  const size = oneOf(value.size, IMAGE_SIZES, `${path}.size`, issues);
  return { image: value.image, ...(repeat ? { repeat } : {}), ...(size ? { size } : {}) };
};

const paintAt = (value: unknown, path: string, issues: Issues, options: PaintOptions = {}): Paint | undefined => {
  const { required = false, insideRepeat = false } = options;
  if (value === undefined) {
    if (required) issues.push(`${path}: a colour is required here`);
    return undefined;
  }
  if (typeof value === 'string') return value;
  if (!isRecord(value)) {
    issues.push(`${path}: expected a colour string, a gradient, or an image`);
    return undefined;
  }
  if ('gradient' in value) return gradientPaint(value, path, issues, insideRepeat);
  if ('image' in value) return imagePaint(value, path, issues);
  issues.push(`${path}: expected a colour string, { gradient, stops } or { image }`);
  return undefined;
};

export { paintAt };
