/* @layer shared-hud @kind logic */
import { checkKeys, isRecord, oneOf } from '../validate-box';
import { validateValue } from '../validate-value';
import { paintAt } from './paint-at';
import {
  BORDER_SIDES, BORDER_STYLES, SHADOW_KEYS, STYLE_KEYS, TINT_MODES,
} from './validate-style.constants';
import type { Issues } from '../validate-box';
import type {
  HudBorder, HudBorderSides, HudBoxStyle, HudOutline, HudRadius, HudShadow, HudTint,
} from '../../../types/hud/hud-style';

const borderSidesAt = (value: unknown, path: string, issues: Issues): HudBorderSides | undefined => {
  if (value === undefined) return undefined;
  if (!isRecord(value)) { issues.push(`${path}: expected an object of sides`); return undefined; }
  checkKeys(value, BORDER_SIDES, path, issues);
  const sides: HudBorderSides = {};
  BORDER_SIDES.forEach((side) => {
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

export { validateStyle };
