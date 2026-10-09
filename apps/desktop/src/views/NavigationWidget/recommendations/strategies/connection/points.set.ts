/* @layer renderer-widgets @kind data */
import type { SetProbe } from '@rotp/navigation';
import type { ObservedTransition } from '@rotp/game-core';
import { datasetKey, transitionKey } from './screen-endpoint';
import { readPointsDataset } from './points/read-points-dataset';
import { readPointsLive } from './points/read-points-live';
import { proposePoint } from './points/propose-point';

const CONNECTION_CROSSING_PROBE: SetProbe<'connection', ObservedTransition> = {
  id: 'connection-crossing',
  noun: 'crossing',
  readLive: readPointsLive,
  readDataset: readPointsDataset,
  liveKey: transitionKey,
  datasetKey,
  toProposed: proposePoint,
  removable: true,
  source: 'native:room-transitions',
  confidence: 'certain',
  removalConfidence: 'likely',
};

export { CONNECTION_CROSSING_PROBE };
export { inferTags } from './points/infer-tags';
