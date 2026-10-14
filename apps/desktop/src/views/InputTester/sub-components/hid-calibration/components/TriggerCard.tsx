/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Text, Icon } from '@drizztdourden08/tessera/primitives';
import { TriggerCardActions } from './TriggerCardActions';
import { TriggerCardStatus } from './TriggerCardStatus';
import { deriveTriggerCardState } from './trigger-card-state';
import type { TriggerCardProps } from './TriggerCards.type';
import './TriggerCard.css';

const TriggerCard = (props: TriggerCardProps) => {
  const {
    side, items, triggerLiveInfo, triggerPickedByte, idleRecording, idleResults, onStartTrigger, onStopTrigger, onSkipTrigger,
    onTriggerRedo, onTriggerPickMode, onConfirmTriggerPick, onCancelTriggerPick, onIdleRecord,
  } = props;
  const axisId = side === 'left' ? 'leftTrigger' : 'rightTrigger';
  const item = items.find(it => it.id === axisId);
  const redo = useCallback(() => onTriggerRedo(side), [onTriggerRedo, side]);
  const start = useCallback(() => onStartTrigger(side), [onStartTrigger, side]);
  const pick = useCallback(() => onTriggerPickMode(side), [onTriggerPickMode, side]);
  const skip = useCallback(() => onSkipTrigger(side), [onSkipTrigger, side]);
  const recordIdle = useCallback(() => {
    if (!item?.axisMapping) return;
    onIdleRecord(item.label, [item.axisMapping.byteIndex]);
  }, [item, onIdleRecord]);

  if (!item) return null;
  const state = deriveTriggerCardState(item, props);

  return (
    <Box className={`hid-cal__prereq-card${state.isDone ? ' hid-cal__prereq-card--done' : ''}`}>
      <Box className="hid-cal__prereq-title">
        <Text>{state.isDone ? <Icon name="check" /> : <Icon name="play" />} {item.label}</Text>
        {state.isDone && item.result && <Text className="hid-cal__prereq-badge">{item.result.split(' ')[0]}</Text>}
      </Box>
      <TriggerCardStatus state={state} triggerLiveInfo={triggerLiveInfo} triggerPickedByte={triggerPickedByte} />
      <TriggerCardActions
        state={state}
        triggerPickedByte={triggerPickedByte}
        idleRecording={idleRecording}
        hasIdleResult={Boolean(idleResults[item.label])}
        onConfirmTriggerPick={onConfirmTriggerPick}
        onCancelTriggerPick={onCancelTriggerPick}
        onStopTrigger={onStopTrigger}
        onRedo={redo}
        onStart={start}
        onPick={pick}
        onSkip={skip}
        onRecordIdle={recordIdle}
      />
    </Box>
  );
};

export { TriggerCard };
