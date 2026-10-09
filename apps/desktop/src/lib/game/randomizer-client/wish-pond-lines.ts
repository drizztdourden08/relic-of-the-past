/* @layer bridge-wasm @kind logic */
import { WISH_POND_WATERS } from './wish-pond-rung-keys.constants';
import { WISH_POND_AWARD_LINE, WISH_POND_CLOSED_LINE } from './wish-pond-lines.constants';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { ReceiptLine } from '@rotp/game-core';

const anyWishPondPlanned = (placement: Placement): boolean => {
  const profiles = placement.stats.ponds;
  return WISH_POND_WATERS.some(({ instance }) => profiles[instance.id].mode !== 'capacity');
};

const wishPondLinesOf = (placement: Placement): readonly ReceiptLine[] =>
  (anyWishPondPlanned(placement) ? [WISH_POND_AWARD_LINE, WISH_POND_CLOSED_LINE] : []);

export { wishPondLinesOf };
