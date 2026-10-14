/* @layer renderer-components @kind logic */
import type { InputItem } from '../hid-calibration.type';
import { STICK_AXES } from './StickCards.constants';
import type { StickCardProps, StickCardState } from './StickCards.type';

const isAnswered = (item: InputItem | undefined): boolean => item?.status === 'captured' || item?.status === 'skipped';

const deriveStickCardState = (props: Pick<StickCardProps, 'side' | 'items' | 'activeStick' | 'stickBusy' | 'stickPickMode'>): StickCardState => {
  const { side, items, activeStick, stickBusy, stickPickMode } = props;
  const { label, xId, yId } = STICK_AXES[side];
  const xItem = items.find(it => it.id === xId);
  const yItem = items.find(it => it.id === yId);
  const isMapped = isAnswered(xItem) && isAnswered(yItem);
  const hasIdle = xItem?.axisMapping?.idle != null;
  const isActive = activeStick === side;

  return {
    label,
    xItem,
    yItem,
    needsIdle: isMapped && !hasIdle,
    isDone: isMapped && hasIdle,
    isActive,
    isPicking: isActive && stickPickMode,
    isRecording: isActive && stickBusy && !stickPickMode,
    otherBusy: activeStick !== null && activeStick !== side,
  };
};

export { deriveStickCardState };
