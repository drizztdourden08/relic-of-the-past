/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Status } from '@drizztdourden08/tessera/primitives';
import { getItem, chestSwapOf } from '@rotp/game-data';
import { itemName } from '@app/game/record-text';
import type { SwapBadgeProps } from '../ChecksTracker.type';
import './SwapBadge.css';

const SwapBadge = ({ check, shown }: SwapBadgeProps) => {
  const t = useT();
  const swap = chestSwapOf(check);
  if (!swap) return null;
  const primary = itemName(getItem(swap.primary));
  const standIn = itemName(getItem(swap.standIn));
  const swapped = shown === swap.standIn;
  const title = swapped
    ? t('compounds:tracker.swap.have', { primary, standIn })
    : t('compounds:tracker.swap.will', { primary, standIn });
  return (
    <Status className="tracker-swap-badge" tone={swapped ? 'warning' : 'neutral'} title={title}>
      {t('compounds:tracker.swap.badge')}
    </Status>
  );
};

export { SwapBadge };
