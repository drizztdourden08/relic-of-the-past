/* @layer renderer-components @kind component */
import { Button } from '@drizztdourden08/tessera/primitives';
import type { StickCardActionsProps } from './StickCards.type';

const StickActionButtons = (props: StickCardActionsProps) => {
  const { state, pickedCount, onConfirmPick, onCancelPick, onStopCircle, onReadIdle, onRedo, onStart, onPick, onSkip } = props;
  const { isPicking, isRecording, needsIdle, isDone, otherBusy } = state;

  if (isPicking) {
    return (
      <>
        <Button variant="primary" size="sm" onClick={onConfirmPick} disabled={pickedCount === 0}>
          Confirm ({pickedCount})
        </Button>
        <Button variant="danger" size="sm" onClick={onCancelPick}>Cancel</Button>
      </>
    );
  }

  if (isRecording) return <Button variant="danger" size="sm" onClick={onStopCircle}>Stop</Button>;

  if (needsIdle) {
    return (
      <>
        <Button variant="primary" size="sm" onClick={onReadIdle} disabled={otherBusy}>
          Read idle position
        </Button>
        <Button variant="tertiary" size="sm" onClick={onRedo} disabled={otherBusy}>Redo</Button>
      </>
    );
  }

  if (isDone) return <Button variant="tertiary" size="sm" onClick={onRedo} disabled={otherBusy}>Redo</Button>;

  return (
    <>
      <Button variant="primary" size="sm" onClick={onStart} disabled={otherBusy}>Start</Button>
      <Button variant="tertiary" size="sm" onClick={onPick} disabled={otherBusy}>Pick</Button>
      <Button variant="tertiary" size="sm" onClick={onSkip} disabled={otherBusy}>Skip</Button>
    </>
  );
};

export { StickActionButtons };
