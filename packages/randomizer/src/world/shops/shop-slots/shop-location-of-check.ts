/* @layer shared-game @kind logic */
import { FIRST_STOCK_BY_CHECK } from './shop-slot-maps.constants';
import type { LocationKey } from '../../location-key';

const shopLocationOfCheck = (checkId: string): LocationKey | undefined => FIRST_STOCK_BY_CHECK.get(checkId);

export { shopLocationOfCheck };
