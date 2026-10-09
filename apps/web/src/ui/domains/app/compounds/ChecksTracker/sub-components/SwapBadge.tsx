/* @layer renderer-components @kind component */
import { Badge } from '@ds/primitives';
import { getItem } from '@shared/game/data';
import { chestSwapOf } from '@shared/game/logic/queries/chest-stand-ins';
import type { SwapBadgeProps } from '../ChecksTracker.type';

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
