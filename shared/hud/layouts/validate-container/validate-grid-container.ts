/* @layer shared-hud @kind logic */
import { checkKeys, extentAt, oneOf, validateBox } from '../validate-box';
import { validateAnimations, validateTransition } from '../validate-motion';
import { validateStyle } from '../validate-style';
import { containerCommon } from './container-common';
import { validateChildren } from './validate-children';
import { GRID_JUSTIFY_ITEMS, GRID_KEYS } from './validate-container.constants';
import type { HudGridContainer } from '../../../types/hud/hud-node';
import type { Issues } from '../validate-box';
import type { NodeValidator } from './validate-container.type';

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

export { validateGridContainer };
