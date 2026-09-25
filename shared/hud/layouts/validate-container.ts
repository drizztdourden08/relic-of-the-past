/* @layer shared-hud @kind logic */
/**
 * A container, checked and rebuilt - flex or grid, whichever `layout` names.
 * Split out of `validate-node.ts` purely to keep both files under this repo's
 * line cap.
 *
 * TWO DIRECTIONS, NOT THREE. `stack` is gone (§42): an overlay is a grid whose
 * children share a cell, so a document naming it is REWRITTEN into one on load
 * (`migrate-screen.ts`) instead of refused here - which is why this file never
 * mentions it and no alias for it survives.
 *
 * `gap` AND `guide` ARE A CONTAINER'S, NOT A GRID'S (§57). Both engines take
 * `gap: { x?, y? }` - a pre-§57 flex `gap: 4` is REWRITTEN on load
 * (`migrate-gap.ts`), never accepted here - and both take a `guide`, because
 * the editor draws either engine's arrangement over the preview.
 */

import {
  BOX_KEYS, checkKeys, extentAt, isRecord, oneOf, validateBox,
} from './validate-box';
import { validateAnimations, validateTransition } from './validate-motion';
import { validateStyle } from './validate-style';
import { validateValue } from './validate-value';
import type {
  HudFlexContainer, HudGap, HudGridContainer, HudGridJustifyItems, HudGuide, HudNode,
} from '../../types/hud/hud-node';
import type { Value } from '../../types/hud/hud-value';
import type { Issues } from './validate-box';

type NodeValidator = (
  value: unknown, path: string, issues: Issues, seen: Set<string>, insideRepeat?: boolean,
) => HudNode | null;

const DIRECTIONS = ['row', 'column'] as const;
const JUSTIFY = ['start', 'center', 'end', 'between', 'around', 'evenly'] as const;
const ALIGN = ['start', 'center', 'end'] as const;
const GRID_JUSTIFY_ITEMS: readonly HudGridJustifyItems[] = ['start', 'center', 'end', 'stretch'];

/** `gap` and `guide` are a CONTAINER's, not a grid's (§57), so both lists carry
 *  both keys and `gapAt`/`guideAt` below are shared, not paired. */
const CONTAINER_KEYS = [...BOX_KEYS, 'kind', 'layout', 'gap', 'guide', 'children'] as const;
const FLEX_KEYS = [...CONTAINER_KEYS, 'direction', 'justify', 'align', 'wrap'] as const;
const GRID_KEYS = [...CONTAINER_KEYS, 'columns', 'rows', 'justifyItems', 'alignItems'] as const;

const validateChildren = (
  value: Record<string, unknown>, path: string, issues: Issues, seen: Set<string>, validateNode: NodeValidator,
  insideRepeat = false,
): HudNode[] => {
  if (!Array.isArray(value.children)) return [];
  return value.children
    .map((child, index) => validateNode(child, `${path}.children[${index}]`, issues, seen, insideRepeat))
    .filter((child): child is HudNode => child !== null);
};

/** One axis of a gap: a `Value`, and never negative - there is no such thing as
 *  a gap that pulls two children together. */
const gapAxisAt = (value: unknown, path: string, issues: Issues, insideRepeat: boolean): Value | undefined => {
  if (value === undefined) return undefined;
  const resolved = validateValue(value, path, issues, { insideRepeat });
  if (typeof resolved === 'number' && resolved < 0) {
    issues.push(`${path}: a gap cannot be negative`);
  }
  return resolved;
};

/** `{ x, y }` UNDER BOTH ENGINES (§57): `x` is always horizontal and `y` always
 *  vertical, so a flex container's two gaps are the same key a grid's are and a
 *  document never has to say which engine it was authored for. */
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

/** What any container carries, whichever engine it names. */
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

const validateFlexContainer = (
  value: Record<string, unknown>, path: string, issues: Issues, seen: Set<string>, validateNode: NodeValidator,
  insideRepeat = false,
): HudFlexContainer | null => {
  checkKeys(value, FLEX_KEYS, path, issues);
  const direction = oneOf(value.direction, DIRECTIONS, `${path}.direction`, issues);
  if (!direction) {
    if (value.direction === undefined) issues.push(`${path}.direction: a flex container needs a direction`);
    return null;
  }
  const common = containerCommon(value, path, issues, insideRepeat);
  if (value.wrap !== undefined && typeof value.wrap !== 'boolean') issues.push(`${path}.wrap: expected true or false`);
  const justify = oneOf(value.justify, JUSTIFY, `${path}.justify`, issues);
  const align = oneOf(value.align, ALIGN, `${path}.align`, issues);
  if (!Array.isArray(value.children)) { issues.push(`${path}.children: expected an array`); return null; }
  const style = validateStyle(value.style, `${path}.style`, issues, insideRepeat);
  const animation = validateAnimations(value.animation, `${path}.animation`, issues, insideRepeat);
  const transition = validateTransition(value.transition, `${path}.transition`, issues, insideRepeat);
  return {
    ...validateBox(value, path, issues, insideRepeat),
    kind: 'container',
    direction,
    ...common,
    ...(justify ? { justify } : {}),
    ...(align ? { align } : {}),
    ...(typeof value.wrap === 'boolean' ? { wrap: value.wrap } : {}),
    ...(style ? { style } : {}),
    ...(animation ? { animation } : {}),
    ...(transition ? { transition } : {}),
    children: validateChildren(value, path, issues, seen, validateNode, insideRepeat),
  };
};

const validateGridContainer = (
  value: Record<string, unknown>, path: string, issues: Issues, seen: Set<string>, validateNode: NodeValidator,
  insideRepeat = false,
): HudGridContainer | null => {
  checkKeys(value, GRID_KEYS, path, issues);
  if (!Array.isArray(value.columns) || value.columns.length === 0) {
    issues.push(`${path}.columns: a grid needs at least one column track`);
    return null;
  }
  const columns = value.columns
    .map((track, i) => extentAt(track, `${path}.columns[${i}]`, issues, insideRepeat))
    .filter((track): track is NonNullable<typeof track> => track !== undefined);
  if (columns.length !== value.columns.length) return null;
  if (value.rows !== undefined && !Array.isArray(value.rows)) issues.push(`${path}.rows: expected an array of extents`);
  const rows = Array.isArray(value.rows)
    ? value.rows
      .map((track, i) => extentAt(track, `${path}.rows[${i}]`, issues, insideRepeat))
      .filter((t): t is NonNullable<typeof t> => t !== undefined)
    : undefined;
  const common = containerCommon(value, path, issues, insideRepeat);
  const justifyItems = oneOf(value.justifyItems, GRID_JUSTIFY_ITEMS, `${path}.justifyItems`, issues);
  const alignItems = oneOf(value.alignItems, GRID_JUSTIFY_ITEMS, `${path}.alignItems`, issues);
  if (!Array.isArray(value.children)) { issues.push(`${path}.children: expected an array`); return null; }
  const style = validateStyle(value.style, `${path}.style`, issues, insideRepeat);
  const animation = validateAnimations(value.animation, `${path}.animation`, issues, insideRepeat);
  const transition = validateTransition(value.transition, `${path}.transition`, issues, insideRepeat);
  return {
    ...validateBox(value, path, issues, insideRepeat),
    kind: 'container',
    layout: 'grid',
    columns,
    ...(rows?.length ? { rows } : {}),
    ...common,
    ...(justifyItems ? { justifyItems } : {}),
    ...(alignItems ? { alignItems } : {}),
    ...(style ? { style } : {}),
    ...(animation ? { animation } : {}),
    ...(transition ? { transition } : {}),
    children: validateChildren(value, path, issues, seen, validateNode, insideRepeat),
  };
};

export { validateFlexContainer, validateGridContainer };
export type { NodeValidator };
