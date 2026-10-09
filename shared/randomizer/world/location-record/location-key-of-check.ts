/* @layer shared-game @kind logic */
import { shopLocationOfCheck } from '../shops/shop-slots';
import type { CheckId } from '@rotp/game-data';
import type { LocationKey } from '../location-key.type';

const locationKeyOfCheck = (checkId: string): LocationKey =>
  shopLocationOfCheck(checkId) ?? checkId as CheckId;

export { locationKeyOfCheck };
