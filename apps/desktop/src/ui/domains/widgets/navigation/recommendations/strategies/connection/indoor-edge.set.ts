/* @layer renderer-widgets @kind data */
import type { SetProbe } from '@shared/game/recommendations/compare';
import type { ObservedTransition } from '@shared/game/recommendations';
import { datasetKey, transitionKey } from './screen-endpoint';
import { readIndoorEdgeDataset } from './indoor-edge/read-indoor-edge-dataset';
import { readIndoorEdgeLive } from './indoor-edge/read-indoor-edge-live';
import { proposeIndoorEdge } from './indoor-edge/propose-indoor-edge';

const INDOOR_EDGE_PROBE: SetProbe<'connection', ObservedTransition> = {
  id: 'connection-indoor-edge',
  noun: 'indoor edge',
  readLive: readIndoorEdgeLive,
  readDataset: readIndoorEdgeDataset,
  liveKey: transitionKey,
  datasetKey,
  toProposed: proposeIndoorEdge,
  removable: true,
  source: 'native:room-boundaries',
  confidence: 'certain',
  removalConfidence: 'likely',
};

export { INDOOR_EDGE_PROBE };
