/* @layer shared-game @kind logic */
import { POND_EXTRA_SET } from './pond-spots.constants';
import type { LocationKey } from '../../location-key';

const isPondExtraLocation = (key: LocationKey): boolean => POND_EXTRA_SET.has(key);

export { isPondExtraLocation };
