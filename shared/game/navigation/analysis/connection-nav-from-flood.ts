/* @layer shared-game @kind logic */
import type { BorderEdge, ConnectionInfo, GridPos } from '@rotp/game-core';
import type { ConnectionNavData, ConnectionPointData, RequirementSet, TraversalRequirement } from '@rotp/game-data';
import type { ConnectionTag } from '@rotp/game-data';
import { GRID_SIZE } from '../types/grid.constants';
import { transitTypeFromTags } from './transit-type-from-tags';
import { EDGE_TO_DIR } from './connection-nav-from-flood.constants';

const positionToGrid = (edge: BorderEdge, pos: number): GridPos => {
  switch (edge) {
    case 'north': return { row: 0, col: pos };
    case 'south': return { row: GRID_SIZE - 1, col: pos };
    case 'east': return { row: pos, col: GRID_SIZE - 1 };
    case 'west': return { row: pos, col: 0 };
  }
};

const requirementsFromFlood = (reqs: readonly string[]): RequirementSet =>
  reqs.length > 0 ? [reqs.slice() as TraversalRequirement[]] : [];

const buildFromPoint = (info: ConnectionInfo, requirements: RequirementSet): ConnectionPointData => {
  const dir = EDGE_TO_DIR[info.edge];
  const src = info.sourceScreen ?? 0;
  return {
    id: `flood-${src.toString(16).padStart(2, '0')}-${dir}`,
    direction: dir,
    tiles: info.positions.slice(),
    requirements,
    position: positionToGrid(info.edge, info.positions[0]),
    oneWay: null,
  };
};

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
