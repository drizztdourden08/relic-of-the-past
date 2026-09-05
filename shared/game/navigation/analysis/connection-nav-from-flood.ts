/* @layer shared-game @kind logic */
/**
 * Derives ConnectionNavData from a live flood crossing (ConnectionInfo) plus
 * the connection's tags.
 *
 * The flood produces one ConnectionInfo per border/entrance crossing: the
 * crossing tile positions (0-63), the edge they sit on, and the requirements
 * to reach them. This maps that into the persisted ConnectionNavData shape so a
 * written connection records WHERE it connects.
 *
 * Walk crossings record the corridor as `overlapTiles`; door/hole/stair
 * crossings record the entry as a `fromPoint` (tiles + grid position).
 */

import type { ConnectionInfo } from '../types';
import type { ConnectionNavData, ConnectionPointData, RequirementSet, TraversalRequirement } from '../nav-data.types';
import type { ConnectionTag } from '../../data';
import { transitTypeFromTags } from './connection-updater';

type Edge = ConnectionInfo['edge'];

const EDGE_TO_DIR: Record<Edge, 'n' | 's' | 'e' | 'w'> = {
  north: 'n', south: 's', east: 'e', west: 'w',
};

// A border position (0-63) maps to a grid cell using the edge it sits on:
// N/S positions are columns (fixed row), E/W positions are rows (fixed col).
const positionToGrid = (edge: Edge, pos: number): { row: number; col: number } => {
  switch (edge) {
    case 'north': return { row: 0, col: pos };
    case 'south': return { row: 63, col: pos };
    case 'east': return { row: pos, col: 63 };
    case 'west': return { row: pos, col: 0 };
  }
};

// Flood requirement strings collapse into a single AND-group (OR-of-AND with
// one alternative). Empty when the crossing is unconditionally reachable.
const requirementsFromFlood = (reqs: readonly string[]): RequirementSet => {
  return reqs.length > 0 ? [reqs.slice() as TraversalRequirement[]] : [];
};

const buildFromPoint = (info: ConnectionInfo, requirements: RequirementSet): ConnectionPointData => {
  const dir = EDGE_TO_DIR[info.edge];
  const src = info.sourceScreen ?? 0;
  const first = info.positions[0];
  return {
    id: `flood-${src.toString(16).padStart(2, '0')}-${dir}`,
    direction: dir,
    tiles: info.positions.slice(),
    requirements,
    position: positionToGrid(info.edge, first),
    oneWay: null,
  };
};

/**
 * Derive ConnectionNavData for one connection from its matching live flood
 * crossing. `tags` drive transit type and directionality; `info` supplies the
 * tile geometry and requirements.
 */
const buildConnectionNav = (info: ConnectionInfo, tags: readonly ConnectionTag[]): ConnectionNavData => {
  const transitType = transitTypeFromTags(tags);
  const requirements = requirementsFromFlood(info.requirements);
  const positions = info.positions ?? [];
  const hasCrossing = positions.length > 0;

  const nav: ConnectionNavData = {
    transitType,
    requirements,
    weight: transitType === 'walk' ? (positions.length || 1) : 1,
  };

  if (transitType === 'walk') {
    nav.overlapTiles = positions.slice();
  } else if (hasCrossing) {
    nav.fromPoint = buildFromPoint(info, requirements);
  }

  if (!hasCrossing) nav.invalid = true;

  return nav;
};

export { buildConnectionNav };
