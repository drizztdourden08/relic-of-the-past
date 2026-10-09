/* @layer shared-hud @kind logic */
import { minMaxAt, placeAt } from '../validate-placement';
import { validateValue } from '../validate-value';
import { checkKeys } from './check-keys';
import { extentAt } from './extent-at';
import { isRecord } from './is-record';
import { numberAt } from './number-at';
import { oneOf } from './one-of';
import { ALIGN_SELF, EDGE_KEYS } from './validate-box.constants';
import type { Edges, HudBox } from '../../../types/hud/hud-node';
import type { Issues } from './validate-box.type';

const edgesAt = (value: unknown, path: string, issues: Issues): Edges | undefined => {
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    issues.push(`${path}: expected an object of edges`);
    return undefined;
  }
  checkKeys(value, EDGE_KEYS, path, issues);
  const edges: Edges = {};
  EDGE_KEYS.forEach((key) => {
    const n = numberAt(value[key], `${path}.${key}`, issues);
    if (n !== undefined) edges[key] = n;
  });
  return edges;
};

const sizeAt = (value: unknown, path: string, issues: Issues, insideRepeat = false): HudBox['size'] => {
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    issues.push(`${path}: expected { w?, h? }`);
    return undefined;
  }
  checkKeys(value, ['w', 'h'], path, issues);
  const w = extentAt(value.w, `${path}.w`, issues, insideRepeat);
  const h = extentAt(value.h, `${path}.h`, issues, insideRepeat);
  return { ...(w !== undefined ? { w } : {}), ...(h !== undefined ? { h } : {}) };
};

const slotsAt = (value: unknown, path: string, issues: Issues): number[] | undefined => {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    issues.push(`${path}: expected an array of slot numbers`);
    return undefined;
  }
  const slots: number[] = [];
  value.forEach((entry, index) => {
    const n = numberAt(entry, `${path}[${index}]`, issues);
    if (n === undefined) return;
    if (!Number.isInteger(n) || n < 1) issues.push(`${path}[${index}]: a slot number is 1 or more`);
    else slots.push(n);
  });
  return slots;
};

const validateBox = (value: Record<string, unknown>, path: string, issues: Issues, insideRepeat = false): HudBox => {
  const id = typeof value.id === 'string' && value.id.trim() ? value.id : '';
  if (!id) issues.push(`${path}.id: every node needs a non-empty id`);

  const context = { insideRepeat };
  const scale = value.scale !== undefined ? validateValue(value.scale, `${path}.scale`, issues, context) : undefined;
  if (typeof scale === 'number' && scale <= 0) issues.push(`${path}.scale: must be greater than zero`);
  const opacity = value.opacity !== undefined
    ? validateValue(value.opacity, `${path}.opacity`, issues, context) : undefined;
  if (typeof opacity === 'number' && (opacity < 0 || opacity > 1)) {
    issues.push(`${path}.opacity: must be between 0 and 1`);
  }
  const visible = value.visible === undefined ? undefined
    : typeof value.visible === 'boolean' ? value.visible
      : validateValue(value.visible, `${path}.visible`, issues, context);

  const size = sizeAt(value.size, `${path}.size`, issues, insideRepeat);
  const min = minMaxAt(value.min, `${path}.min`, issues, insideRepeat);
  const max = minMaxAt(value.max, `${path}.max`, issues, insideRepeat);
  const margin = edgesAt(value.margin, `${path}.margin`, issues);
  const padding = edgesAt(value.padding, `${path}.padding`, issues);
  const dimWhenEmpty = slotsAt(value.dimWhenEmpty, `${path}.dimWhenEmpty`, issues);
  const place = placeAt(value.place, `${path}.place`, issues);
  const order = numberAt(value.order, `${path}.order`, issues);
  const alignSelf = oneOf(value.alignSelf, ALIGN_SELF, `${path}.alignSelf`, issues);
  const justifySelf = oneOf(value.justifySelf, ALIGN_SELF, `${path}.justifySelf`, issues);

  return {
    id,
    ...(size && Object.keys(size).length ? { size } : {}),
    ...(min && Object.keys(min).length ? { min } : {}),
    ...(max && Object.keys(max).length ? { max } : {}),
    ...(margin ? { margin } : {}),
    ...(padding ? { padding } : {}),
    ...(scale !== undefined ? { scale } : {}),
    ...(opacity !== undefined ? { opacity } : {}),
    ...(visible !== undefined ? { visible } : {}),
    ...(dimWhenEmpty?.length ? { dimWhenEmpty } : {}),
    ...(place && Object.keys(place).length ? { place } : {}),
    ...(order !== undefined ? { order } : {}),
    ...(alignSelf ? { alignSelf } : {}),
    ...(justifySelf ? { justifySelf } : {}),
  };
};

export { validateBox };
