/* @layer shared-game @kind logic */
import { LOCATION_ID_BY_KEY } from './ap-id-lookup.constants';
import { lookupOrThrow } from './lookup-or-throw';
import type { LocationKey } from '../../world/location-key';

const apLocationIdOf = (key: LocationKey): number => lookupOrThrow(LOCATION_ID_BY_KEY, key, 'location id for');

export { apLocationIdOf };
