/* @layer shared-game @kind logic */
import { LOCATION_KEY_BY_ID } from './ap-id-lookup.constants';
import { lookupOrThrow } from './lookup-or-throw';
import type { LocationKey } from '../../world/location-key';

const locationKeyOfApId = (id: number): LocationKey => lookupOrThrow(LOCATION_KEY_BY_ID, id, 'location has id');

export { locationKeyOfApId };
