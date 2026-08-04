/* @layer renderer-widgets @kind logic */
/**
 * The `connection` comparison strategy. The tile-data (`nav`) fix from
 * `connection-shape.ts` (deleted) is expressed as a field probe
 * (`nav.probe.ts`); the `dir:` tag fix that used to ride alongside it is
 * gone along with the whole `dir:*` tag namespace — direction is derived
 * from `canExit` now (`data/connections/derive.ts`), so there is nothing
 * left to backfill.
 *
 * `sets` (phase 4, part 2 — Fix 5) replaces `connection-audit-core.ts`'s
 * hand-rolled `buildAddFindings`/`buildBadFindings` pair (deleted, along with
 * the `connection-add`/`connection-remove` detectors that wrapped them):
 * `CONNECTION_CROSSING_PROBE` covers entrance/stair/hole/travel crossings,
 * `INDOOR_EDGE_PROBE` covers the newly-auditable indoor scroll edges (F3) —
 * see each probe's own header for why they are two probes rather than one.
 * Both `unresolvable` differences route through `wire-detector.ts`'s
 * `onUnresolvableConnection` (F2), NOT through this strategy's own
 * `detectorFromStrategy` call — see that file for why the wiring has to be
 * a separate, later-imported module.
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
