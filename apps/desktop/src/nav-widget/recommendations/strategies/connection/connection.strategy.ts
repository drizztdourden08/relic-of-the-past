/* @layer renderer-widgets @kind logic */
import type { ComparisonStrategy } from '@rotp/navigation';
import { eraseSetProbe } from '@rotp/navigation';
import { INDOOR_EDGE_PROBE } from './indoor-edge.set';
import { NAV_PROBE } from './nav.probe';
import { CONNECTION_CROSSING_PROBE } from './points.set';
import { TILES_PROBE } from './tiles.probe';

const connectionStrategy: ComparisonStrategy<'connection'> = {
  kind: 'connection',
  subjects: observations => observations.existingConnections,
  fields: [NAV_PROBE, TILES_PROBE],
  sets: [eraseSetProbe(CONNECTION_CROSSING_PROBE), eraseSetProbe(INDOOR_EDGE_PROBE)],
};

export { connectionStrategy };
