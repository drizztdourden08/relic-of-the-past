/* @layer shared-game @kind constants */
import type { ShopSlotPosition } from '@shared/game/data';
import type { ShelfSide } from '../location-key';

const SIDE_OF_POSITION: Readonly<Record<ShopSlotPosition, ShelfSide>> = {
  Left: 'left', Center: 'center', Right: 'right', Single: 'center',
};

export { SIDE_OF_POSITION };
