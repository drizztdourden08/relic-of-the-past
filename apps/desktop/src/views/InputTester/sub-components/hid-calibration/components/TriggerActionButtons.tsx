/* @layer renderer-components @kind component */
import { Button, Icon } from '@drizztdourden08/tessera/primitives';
import type { TriggerCardActionsProps } from './TriggerCards.type';

const TriggerActionButtons = (props: TriggerCardActionsProps) => {
  const {
    state, triggerPickedByte, idleRecording, hasIdleResult, onConfirmTriggerPick, onCancelTriggerPick, onStopTrigger,
    onRedo, onStart, onPick, onSkip, onRecordIdle,
  } = props;
  const { item, isPicking, isRecording, isDone, otherBusy } = state;

  if (isPicking) {
    return (
      <>
        <Button variant="primary" size="sm" onClick={onConfirmTriggerPick} disabled={triggerPickedByte === null}>Confirm</Button>
        <Button variant="danger" size="sm" onClick={onCancelTriggerPick}>Cancel</Button>
      </>
    );
  }

  if (isRecording) return <Button variant="danger" size="sm" onClick={onStopTrigger}>Stop</Button>;

  if (isDone) {
    return (
      <>
        <Button variant="tertiary" size="sm" onClick={onRedo} disabled={otherBusy}>Redo</Button>
        <Button
          variant="tertiary"
          size="sm"
          disabled={idleRecording !== null}
          className={hasIdleResult ? 'input-cal__btn--done' : ''}
          onClick={onRecordIdle}>
          {idleRecording === item.label ? 'Recording...' : <>{hasIdleResult && <Icon name="check" />} Idle</>}
        </Button>
      </>
    );
  }

  return (
    <>
      <Button variant="primary" size="sm" onClick={onStart} disabled={otherBusy}>Start</Button>
      <Button variant="tertiary" size="sm" onClick={onPick} disabled={otherBusy}>Pick</Button>
      <Button variant="tertiary" size="sm" onClick={onSkip} disabled={otherBusy}>Skip</Button>
    </>
  );
};

export { TriggerActionButtons };
