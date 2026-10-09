/* @layer bridge-wasm @kind types */
import type { LocationKey } from '../../world/location-key';

type FireReportingSession = { reportCheck(location: LocationKey): void };
type FiredLocationListener = (location: LocationKey) => void;

interface FireRegistryState {
  locationByFireId: Map<number, LocationKey>;
  armedCheckIds: Set<string>;
  fired: Set<number>;
  firedLocationKeys: Set<LocationKey>;
  firedListeners: Set<FiredLocationListener>;
  nextFireId: number;
}

export type { FiredLocationListener, FireRegistryState, FireReportingSession };
