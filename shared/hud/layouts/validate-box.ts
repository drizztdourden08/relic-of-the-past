/* @layer shared-hud @kind logic */
/**
 * The box properties every node carries, checked one at a time.
 *
 * A layout document is a file on a player's disk and, for the built-ins, a file
 * in this repository - both are hand-editable, so both can be wrong. The rule
 * throughout is that a bad value is REPORTED and the document is refused: a
 * half-understood layout that draws four of its five elements is far worse than
 * one that says which line is wrong, because the player has no way to tell the
 * difference between "I mis-typed a gap" and "this element is gone".
 *
 * Every checker takes the path it is validating so the message can name it -
 * `regions[2].root.children[0].size.w` and not "invalid extent".
 *
 * BINDABLE FIELDS route through `validateValue` (`./validate-value`) the
 * moment their type is `Value` instead of a bare number - `scale`, `opacity`,
 * `size.w`/`size.h`, `min`/`max`. A literal number still passes straight
 * through; an expression is parsed and its variables checked against the data
 * table, and a bad one refuses the document exactly as a malformed number
 * always did (phase 2 of `plans/hud-data-binding.html`).
 */

import { minMaxAt, placeAt } from './validate-placement';
import { validateValue } from './validate-value';
import type { Edges, Extent, HudAlignSelf, HudBox } from '../../types/hud/hud-node';

type Issues = string[];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Documentation lives in the document, so one key is reserved for it. Every
 *  other unknown key is a typo until proven otherwise. */
const COMMENT_KEY = '$comment';

const checkKeys = (value: Record<string, unknown>, allowed: readonly string[], path: string, issues: Issues): void => {
  Object.keys(value).forEach((key) => {
    if (key === COMMENT_KEY || allowed.includes(key)) return;
    issues.push(`${path}: unknown key '${key}'`);
  });
};

/** One string out of a fixed set - every enum-shaped field in the document
 *  (`direction`, `justify`, `align`, `alignSelf`, a grid's `justifyItems`, a
 *  border's `style`, a tint's `mode` and so on) is checked through this one helper. */
const oneOf = <T extends string>(
  value: unknown, allowed: readonly T[], path: string, issues: Issues,
): T | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === 'string' && (allowed as readonly string[]).includes(value)) return value as T;
  issues.push(`${path}: expected one of ${allowed.join(', ')}, got ${JSON.stringify(value)}`);
  return undefined;
};

const numberAt = (value: unknown, path: string, issues: Issues): number | undefined => {
  if (value === undefined) return undefined;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    issues.push(`${path}: expected a finite number, got ${JSON.stringify(value)}`);
    return undefined;
  }
  return value;
};

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
    // A bare expression is `px` shorthand (`hud-node.ts`'s own note) - a bare
    // NUMBER is not offered the same shorthand, so this checks for the
    // expression's shape specifically instead of falling through generically.
    if ('from' in value || 'expr' in value) {
      const v = validateValue(value, path, issues, context);
      return v === undefined || typeof v === 'number' ? undefined : v;
    }
  }
  issues.push(`${path}: expected 'auto', 'fill', { px } or { pct }, got ${JSON.stringify(value)}`);
  return undefined;
};

const EDGE_KEYS = ['top', 'right', 'bottom', 'left'] as const;

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
    if (n !== undefined) edges[key] = n;   // negative is legal: that is how art overhangs
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

const ALIGN_SELF: readonly HudAlignSelf[] = ['start', 'center', 'end', 'stretch'];

const BOX_KEYS = [
  'id', 'size', 'min', 'max', 'margin', 'padding', 'scale', 'opacity', 'visible', 'dimWhenEmpty',
  'place', 'order', 'alignSelf', 'justifySelf', 'style', 'animation', 'transition',
] as const;

/** The shared half of any node. Returns what it understood; `issues` carries
 *  everything it did not. `style` is checked by `validate-style.ts`, imported
 *  lazily by the caller (`validate-node.ts`) to keep this file's own concern
 *  to the box itself.
 *
 *  `insideRepeat` says whether this box sits under a `repeat`'s `child` -
 *  forwarded to every `validateValue` call so a bound field here (`scale`,
 *  `opacity`, `min`/`max` and the rest) may name `index`/`count`/`item` exactly the way
 *  the repeat's own `item` expression can (`validate-value.ts`'s
 *  `ValueContext`). Default false: everything outside a repeat validates
 *  exactly as it always has. */
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

export {
  BOX_KEYS, COMMENT_KEY, checkKeys, extentAt, isRecord, numberAt, oneOf, validateBox,
};
export type { Issues };
