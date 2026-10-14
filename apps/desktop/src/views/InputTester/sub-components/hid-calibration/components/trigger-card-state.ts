/* @layer renderer-components @kind logic */
import type { InputItem } from '../hid-calibration.type';
import type { TriggerCardProps, TriggerCardState } from './TriggerCards.type';

const deriveTriggerCardState = (
  item: InputItem,
  props: Pick<TriggerCardProps, 'side' | 'activeTrigger' | 'triggerBusy' | 'triggerPickMode'>,
): TriggerCardState => {
  const { side, activeTrigger, triggerBusy, triggerPickMode } = props;
  const isActive = activeTrigger === side;

  return {
    item,
    isDone: item.status === 'captured' || item.status === 'skipped',
    isActive,
    isPicking: isActive && triggerPickMode,
    isRecording: isActive && triggerBusy && !triggerPickMode,
    otherBusy: activeTrigger !== null && activeTrigger !== side,
  };
};

export { deriveTriggerCardState };
