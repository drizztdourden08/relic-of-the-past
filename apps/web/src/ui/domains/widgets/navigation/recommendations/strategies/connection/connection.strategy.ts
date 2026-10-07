/* @layer renderer-widgets @kind logic */
/**
 * The `connection` comparison strategy. The tile-data (`nav`) fix is a field
 * probe (`nav.probe.ts`). Direction is derived from `canExit`
 * (`data/connections/derive.ts`), so no `dir:` tag backfill remains.
 *
 * `sets`: `CONNECTION_CROSSING_PROBE` covers entrance/stair/hole/travel
 * crossings, `INDOOR_EDGE_PROBE` covers indoor scroll edges (F3); each probe's
 * header says why they are two probes, not one. `unresolvable` differences
 * route through `wire-detector.ts`'s `onUnresolvableConnection`, NOT through
 * this strategy's own `detectorFromStrategy` call; see that file for why.
 */
import type { ComparisonStrategy } from '@shared/game/recommendations/compare';
import { INDOOR_EDGE_PROBE } from './indoor-edge.set';
import { NAV_PROBE } from './nav.probe';
import { CONNECTION_CROSSING_PROBE } from './points.set';
import { TILES_PROBE } from './tiles.probe';

const connectionStrategy: ComparisonStrategy<'connection'> = {
  kind: 'connection',
  subjects: observations => observations.existingConnections,
  fields: [NAV_PROBE, TILES_PROBE],
  sets: [CONNECTION_CROSSING_PROBE, INDOOR_EDGE_PROBE],
};

export { connectionStrategy };
