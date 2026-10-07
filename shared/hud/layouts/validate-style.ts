/* @layer shared-hud @kind logic */
/**
 * The box grows a face: `background`, `border`, `radius`, `shadow`, `outline`,
 * `tint`, `clip` - checked the same way every other field in this document is,
 * one property at a time, naming its own path.
 *
 * `Paint` is checked here instead of in its own file: every colour-shaped
 * field in the document is a style property, so there is exactly one caller.
 */

import { checkKeys, isRecord, numberAt, oneOf } from './validate-box';
import { validateValue } from './validate-value';
import type { Issues } from './validate-box';
import type {
  HudBorder, HudBorderSides, HudBoxStyle, HudOutline, HudRadius, HudShadow, HudTint,
} from '../../types/hud/hud-style';
import type { GradientStop, Paint } from '../../types/hud/hud-value';

const BORDER_STYLES = ['solid', 'dashed', 'dotted'] as const;
const TINT_MODES = ['multiply', 'replace'] as const;
const REPEATS = ['none', 'repeat', 'repeat-x', 'repeat-y'] as const;
const IMAGE_SIZES = ['contain', 'cover', 'tile'] as const;
const GRADIENTS = ['linear', 'radial'] as const;

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

/** `required` is what a border, a shadow layer, an outline and a tint all set
 *  - `color` is not optional on any of them, unlike `background`, which is the
 *  only caller that leaves it at the default and lets `undefined` pass.
 *  `insideRepeat` only matters for a gradient's `angle`, its one bindable
 *  number - forwarded like every other `Value` field in this file. */
const paintAt = (
  value: unknown, path: string, issues: Issues, required = false, insideRepeat = false,
): Paint | undefined => {
  if (value === undefined) {
    if (required) issues.push(`${path}: a colour is required here`);
    return undefined;
  }
  if (typeof value === 'string') return value;
  if (!isRecord(value)) {
    issues.push(`${path}: expected a colour string, a gradient, or an image`);
    return undefined;
  }
  if ('gradient' in value) {
    checkKeys(value, ['gradient', 'angle', 'stops'], path, issues);
    const gradient = oneOf(value.gradient, GRADIENTS, `${path}.gradient`, issues);
    const angle = value.angle !== undefined
      ? validateValue(value.angle, `${path}.angle`, issues, { insideRepeat }) : undefined;
    if (!Array.isArray(value.stops) || value.stops.length === 0) {
      issues.push(`${path}.stops: expected a non-empty array of { at, color }`);
      return undefined;
    }
    const stops = value.stops
      .map((stop, i) => stopAt(stop, `${path}.stops[${i}]`, issues))
      .filter((stop): stop is GradientStop => stop !== undefined);
    if (!gradient || stops.length !== value.stops.length) return undefined;
    return { gradient, ...(angle !== undefined ? { angle } : {}), stops };
  }
  if ('image' in value) {
    checkKeys(value, ['image', 'repeat', 'size'], path, issues);
    if (typeof value.image !== 'string' || !value.image.trim()) {
      issues.push(`${path}.image: expected a file name`);
      return undefined;
    }
    const repeat = oneOf(value.repeat, REPEATS, `${path}.repeat`, issues);
    const size = oneOf(value.size, IMAGE_SIZES, `${path}.size`, issues);
    return { image: value.image, ...(repeat ? { repeat } : {}), ...(size ? { size } : {}) };
  }
  issues.push(`${path}: expected a colour string, { gradient, stops } or { image }`);
  return undefined;
};

const borderSidesAt = (value: unknown, path: string, issues: Issues): HudBorderSides | undefined => {
  if (value === undefined) return undefined;
  if (!isRecord(value)) { issues.push(`${path}: expected an object of sides`); return undefined; }
  checkKeys(value, ['top', 'right', 'bottom', 'left'], path, issues);
  const sides: HudBorderSides = {};
  (['top', 'right', 'bottom', 'left'] as const).forEach((side) => {
    if (value[side] === undefined) return;
    if (typeof value[side] !== 'boolean') { issues.push(`${path}.${side}: expected true or false`); return; }
    sides[side] = value[side];
  });
  return sides;
};

const borderAt = (value: unknown, path: string, issues: Issues, insideRepeat = false): HudBorder | undefined => {
  if (value === undefined) return undefined;
  if (!isRecord(value)) { issues.push(`${path}: expected { width, color }`); return undefined; }
  checkKeys(value, ['width', 'color', 'style', 'sides'], path, issues);
  const width = validateValue(value.width, `${path}.width`, issues, { insideRepeat });
  const color = paintAt(value.color, `${path}.color`, issues, true, insideRepeat);
  const style = oneOf(value.style, BORDER_STYLES, `${path}.style`, issues);
  const sides = borderSidesAt(value.sides, `${path}.sides`, issues);
  if (width === undefined || color === undefined) return undefined;
  return { width, color, ...(style ? { style } : {}), ...(sides ? { sides } : {}) };
};

const radiusAt = (value: unknown, path: string, issues: Issues, insideRepeat = false): HudRadius | undefined => {
  if (value === undefined) return undefined;
  const context = { insideRepeat };
  if (Array.isArray(value)) {
    if (value.length !== 4) { issues.push(`${path}: expected one value or an array of four`); return undefined; }
    const corners = value.map((corner, i) => validateValue(corner, `${path}[${i}]`, issues, context));
    if (corners.some((corner) => corner === undefined)) return undefined;
    return corners as HudRadius;
  }
  return validateValue(value, path, issues, context);
};

const SHADOW_KEYS = ['x', 'y', 'blur', 'spread', 'color', 'inset'] as const;

const shadowEntryAt = (value: unknown, path: string, issues: Issues, insideRepeat = false): HudShadow | undefined => {
  if (!isRecord(value)) { issues.push(`${path}: expected { x, y, blur, color }`); return undefined; }
  checkKeys(value, SHADOW_KEYS, path, issues);
  const context = { insideRepeat };
  const x = validateValue(value.x, `${path}.x`, issues, context);
  const y = validateValue(value.y, `${path}.y`, issues, context);
  const blur = validateValue(value.blur, `${path}.blur`, issues, context);
  const spread = value.spread !== undefined ? validateValue(value.spread, `${path}.spread`, issues, context) : undefined;
  const color = paintAt(value.color, `${path}.color`, issues, true, insideRepeat);
  if (value.inset !== undefined && typeof value.inset !== 'boolean') issues.push(`${path}.inset: expected true or false`);
  if (x === undefined || y === undefined || blur === undefined || color === undefined) return undefined;
  return {
    x, y, blur, ...(spread !== undefined ? { spread } : {}), color, ...(typeof value.inset === 'boolean' ? { inset: value.inset } : {}),
  };
};

const shadowAt = (value: unknown, path: string, issues: Issues, insideRepeat = false): HudShadow[] | undefined => {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) { issues.push(`${path}: expected an array of shadows`); return undefined; }
  return value
    .map((entry, i) => shadowEntryAt(entry, `${path}[${i}]`, issues, insideRepeat))
    .filter((entry): entry is HudShadow => entry !== undefined);
};

const outlineAt = (value: unknown, path: string, issues: Issues, insideRepeat = false): HudOutline | undefined => {
  if (value === undefined) return undefined;
  if (!isRecord(value)) { issues.push(`${path}: expected { width, color }`); return undefined; }
  checkKeys(value, ['width', 'color'], path, issues);
  const width = validateValue(value.width, `${path}.width`, issues, { insideRepeat });
  const color = paintAt(value.color, `${path}.color`, issues, true, insideRepeat);
  if (width === undefined || color === undefined) return undefined;
  return { width, color };
};

const tintAt = (value: unknown, path: string, issues: Issues, insideRepeat = false): HudTint | undefined => {
  if (value === undefined) return undefined;
  if (!isRecord(value)) { issues.push(`${path}: expected { color }`); return undefined; }
  checkKeys(value, ['color', 'mode', 'amount'], path, issues);
  const color = paintAt(value.color, `${path}.color`, issues, true, insideRepeat);
  const mode = oneOf(value.mode, TINT_MODES, `${path}.mode`, issues);
  const amount = value.amount !== undefined
    ? validateValue(value.amount, `${path}.amount`, issues, { insideRepeat }) : undefined;
  if (color === undefined) return undefined;
  return { color, ...(mode ? { mode } : {}), ...(amount !== undefined ? { amount } : {}) };
};

const STYLE_KEYS = ['background', 'border', 'radius', 'shadow', 'outline', 'tint', 'clip'] as const;

/** `insideRepeat` reaches every bindable field on the style the same way it
 *  reaches the box's own (`validate-box.ts`) - a border width or a shadow's
 *  blur may read `index`/`count`/`item` under a `repeat` exactly as `scale`
 *  can. */
const validateStyle = (value: unknown, path: string, issues: Issues, insideRepeat = false): HudBoxStyle | undefined => {
  if (value === undefined) return undefined;
  if (!isRecord(value)) { issues.push(`${path}: expected an object of style properties`); return undefined; }
  checkKeys(value, STYLE_KEYS, path, issues);
  const background = paintAt(value.background, `${path}.background`, issues, false, insideRepeat);
  const border = borderAt(value.border, `${path}.border`, issues, insideRepeat);
  const radius = radiusAt(value.radius, `${path}.radius`, issues, insideRepeat);
  const shadow = shadowAt(value.shadow, `${path}.shadow`, issues, insideRepeat);
  const outline = outlineAt(value.outline, `${path}.outline`, issues, insideRepeat);
  const tint = tintAt(value.tint, `${path}.tint`, issues, insideRepeat);
  if (value.clip !== undefined && typeof value.clip !== 'boolean') issues.push(`${path}.clip: expected true or false`);
  return {
    ...(background !== undefined ? { background } : {}),
    ...(border ? { border } : {}),
    ...(radius !== undefined ? { radius } : {}),
    ...(shadow?.length ? { shadow } : {}),
    ...(outline ? { outline } : {}),
    ...(tint ? { tint } : {}),
    ...(typeof value.clip === 'boolean' ? { clip: value.clip } : {}),
  };
};

export { paintAt, validateStyle };
