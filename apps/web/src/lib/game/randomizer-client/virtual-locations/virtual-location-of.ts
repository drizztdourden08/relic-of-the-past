/* @layer bridge-wasm @kind logic */
import { VIRTUAL_PREFIX } from './virtual-locations.constants';
import type { LocationKey } from '@shared/randomizer/world/location-key';

const virtualLocationOf = (checkId: string): LocationKey => checkId.slice(VIRTUAL_PREFIX.length) as LocationKey;

export { virtualLocationOf };
