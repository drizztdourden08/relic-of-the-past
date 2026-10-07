/* @layer renderer-components @kind component */
/**
 * The mark of a swap chest: its item pays a stand-in once the player already holds it, so the
 * same chest reads two ways. Shown whichever of the two it holds now; the tooltip says both.
 */
import { Badge } from '@ds/primitives';
import { getItem } from '@shared/game/data';
import type { CheckRecord, ItemId } from '@shared/game/data';
import { chestSwapOf } from '@shared/game/logic/queries/chest-stand-ins';

interface SwapBadgeProps {
  check: CheckRecord;
  /** The item the row shows right now. */
  shown?: ItemId;
}

const SwapBadge = ({ check, shown }: SwapBadgeProps) => {
  const swap = chestSwapOf(check);
  if (!swap) return null;
  const primary = getItem(swap.primary).name;
  const standIn = getItem(swap.standIn).name;
  const swapped = shown === swap.standIn;
  const title = swapped
    ? `This chest holds the ${primary}. You already have one, so it pays ${standIn}.`
    : `This chest holds the ${primary}. Once you have one it pays ${standIn} instead.`;
  return (
    <Badge className="tracker-swap-badge" variant={swapped ? 'warning' : 'neutral'} title={title}>
      swap
    </Badge>
  );
};

export { SwapBadge };
