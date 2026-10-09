/* @layer bridge-wasm @kind logic */
import { VIRTUAL_PREFIX } from './virtual-locations.constants';
import type { CheckId } from '@shared/game/data';
import type { LocationKey } from '@shared/randomizer/world/location-key';

const slugKeepingUnderscores = (name: string): string =>
  name.toLowerCase().replace(/[^a-z0-9_]+/g, '-').replace(/(^-|-$)/g, '');

const virtualCheckIdOf = (location: LocationKey): CheckId =>
  `${VIRTUAL_PREFIX}${slugKeepingUnderscores(location)}` as CheckId;

export { virtualCheckIdOf };
