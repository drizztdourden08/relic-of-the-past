/* @layer shared-game @kind logic */
import { shopLocationOfCheck } from '../shops/shop-slots';
import type { CheckId } from '@shared/game/data/types/ids';
import type { LocationKey } from '../location-key.type';

const locationKeyOfCheck = (checkId: string): LocationKey =>
  shopLocationOfCheck(checkId) ?? checkId as CheckId;

export { locationKeyOfCheck };
