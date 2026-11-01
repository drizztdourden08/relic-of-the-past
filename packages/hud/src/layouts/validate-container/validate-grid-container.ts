/* @layer shared-hud @kind logic */
import { checkKeys, extentAt, oneOf } from '../validate-box';
import { buildContainer } from './build-container';
import { containerCommon } from './container-common';
import { GRID_JUSTIFY_ITEMS, GRID_KEYS } from './validate-container.constants';
import type { Extent, HudGridContainer } from '../../types/hud-node';
import type { Issues } from '../validate-box';
import type { NodeContext, NodeValidator } from './validate-container.type';

const tracksAt = (tracks: readonly unknown[], path: string, issues: Issues, insideRepeat: boolean): Extent[] =>
  tracks
    .map((track, i) => extentAt(track, `${path}[${i}]`, issues, insideRepeat))
    .filter((track): track is NonNullable<typeof track> => track !== undefined);

const rowsAt = (value: Record<string, unknown>, path: string, issues: Issues, insideRepeat: boolean): Extent[] | undefined => {
  if (value.rows !== undefined && !Array.isArray(value.rows)) issues.push(`${path}.rows: expected an array of extents`);
  return Array.isArray(value.rows) ? tracksAt(value.rows, `${path}.rows`, issues, insideRepeat) : undefined;
};

const validateGridContainer = (
  value: Record<string, unknown>, path: string, ctx: NodeContext, validateNode: NodeValidator,
): HudGridContainer | null => {
  const { issues, insideRepeat } = ctx;
  checkKeys(value, GRID_KEYS, path, issues);
  if (!Array.isArray(value.columns) || value.columns.length === 0) {
    issues.push(`${path}.columns: a grid needs at least one column track`);
    return null;
  }
  const columns = tracksAt(value.columns, `${path}.columns`, issues, insideRepeat);
  if (columns.length !== value.columns.length) return null;
  const rows = rowsAt(value, path, issues, insideRepeat);
  const common = containerCommon(value, path, issues, insideRepeat);
  const justifyItems = oneOf(value.justifyItems, GRID_JUSTIFY_ITEMS, `${path}.justifyItems`, issues);
  const alignItems = oneOf(value.alignItems, GRID_JUSTIFY_ITEMS, `${path}.alignItems`, issues);
  return buildContainer({
    value, path, ctx, validateNode,
    own: {
      layout: 'grid' as const,
      columns,
      ...(rows?.length ? { rows } : {}),
      ...common,
      ...(justifyItems ? { justifyItems } : {}),
      ...(alignItems ? { alignItems } : {}),
    },
  });
};

export { validateGridContainer };
