/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Text, Button } from '@drizztdourden08/tessera/primitives';
import { DESC_SMALL } from './StickCards.constants';
import type { TriggerCardProps } from './TriggerCards.type';

const TriggerCard = (props: TriggerCardProps) => {
  const { side, items, activeTrigger, triggerBusy, triggerLiveInfo, triggerPickMode, triggerPickedByte, idleRecording, idleResults, onStartTrigger, onStopTrigger, onSkipTrigger, onTriggerRedo, onTriggerPickMode, onConfirmTriggerPick, onCancelTriggerPick, onIdleRecord } = props;
  const axisId = side === 'left' ? 'leftTrigger' : 'rightTrigger';
  const item = items.find(it => it.id === axisId);
  const redo = useCallback(() => onTriggerRedo(side), [onTriggerRedo, side]);
  const start = useCallback(() => onStartTrigger(side), [onStartTrigger, side]);
  const pick = useCallback(() => onTriggerPickMode(side), [onTriggerPickMode, side]);
  const skip = useCallback(() => onSkipTrigger(side), [onSkipTrigger, side]);
  const recordIdle = useCallback(() => {
    if (!item) return;
    const byteIndices: number[] = [];
    if (item.axisMapping) byteIndices.push(item.axisMapping.byteIndex);
    if (byteIndices.length > 0) onIdleRecord(item.label, byteIndices);
  }, [item, onIdleRecord]);

  if (!item) return null;
  const label = item.label;
  const isDone = item.status === 'captured' || item.status === 'skipped';
  const isActive = activeTrigger === side;
  const isPicking = isActive && triggerPickMode;
  const isRecording = isActive && triggerBusy && !triggerPickMode;
  const otherBusy = activeTrigger !== null && activeTrigger !== side;

  return (
    <Box className={`hid-cal__prereq-card${isDone ? ' hid-cal__prereq-card--done' : ''}`}>
      <Box className="hid-cal__prereq-title">
        <Text>{isDone ? '✓' : '⊳'} {label}</Text>
        {isDone && item.result && <Text className="hid-cal__prereq-badge">{item.result.split(' ')[0]}</Text>}
      </Box>

      {isPicking && (
        <Text as="p" className="hid-cal__desc">
          Click 1 byte box below, then Confirm. [{triggerPickedByte ?? '-'}]
        </Text>
      )}
      {isRecording && triggerLiveInfo && <Box className="hid-cal__stick-info">{triggerLiveInfo}</Box>}
      {isRecording && !triggerLiveInfo && <Text as="p" className="hid-cal__desc">Press the trigger fully and release...</Text>}
      {!isActive && isDone && (
        <Text as="p" className="hid-cal__desc" style={DESC_SMALL}>{item.result ?? '-'}</Text>
      )}

      <Box className="hid-cal__prereq-actions">
        {isPicking ? (
          <>
            <Button variant="primary" size="sm" onClick={onConfirmTriggerPick} disabled={triggerPickedByte === null}>Confirm</Button>
            <Button variant="danger" size="sm" onClick={onCancelTriggerPick}>Cancel</Button>
          </>
        ) : isRecording ? (
          <Button variant="danger" size="sm" onClick={onStopTrigger}>Stop</Button>
        ) : isDone ? (
          <>
            <Button variant="tertiary" size="sm" onClick={redo} disabled={otherBusy}>Redo</Button>
            <Button
              variant="tertiary"
              size="sm"
              disabled={idleRecording !== null}
              className={idleResults[label] ? 'input-cal__btn--done' : ''}
              onClick={recordIdle}>
              {idleRecording === label ? 'Recording...' : idleResults[label] ? '✓ Idle' : 'Idle'}
            </Button>
          </>
        ) : (
          <>
            <Button variant="primary" size="sm" onClick={start} disabled={otherBusy}>Start</Button>
            <Button variant="tertiary" size="sm" onClick={pick} disabled={otherBusy}>Pick</Button>
            <Button variant="tertiary" size="sm" onClick={skip} disabled={otherBusy}>Skip</Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export { TriggerCard };
