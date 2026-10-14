/* @layer renderer-widgets @kind component */
import { Box, Field, NumberInput } from '@drizztdourden08/tessera/primitives';
import { StopAtCheckPicker } from './StopAtCheckPicker';
import { RunButtons } from './RunButtons';
import type { RunControlsProps } from '../SimulatorWidget.type';

const RunControls = (props: RunControlsProps) => {
  const { status, stopAtCheckId, onStopAtChange, screenLimit, onScreenLimitChange, canRestore, onStart, onPause, onResume, onStop, onRestore } = props;

  const idle = status === 'idle' || status === 'done';

  const handleScreenLimit = (value: number) => {
    onScreenLimitChange(Number.isNaN(value) || value < 1 ? null : Math.floor(value));
  };

  return (
    <Box className="simulator__controls">
      <Field label="Stop at check">
        <StopAtCheckPicker
          stopAtCheckId={stopAtCheckId}
          onStopAtChange={onStopAtChange}
          disabled={!idle}
        />
      </Field>
      <Field label="Max screens" hint="blank = unlimited">
        <NumberInput
          min={1}
          placeholder="unlimited"
          value={screenLimit ?? ''}
          onChange={handleScreenLimit}
          disabled={!idle}
        />
      </Field>
      <RunButtons
        status={status}
        canRestore={canRestore}
        onStart={onStart}
        onPause={onPause}
        onResume={onResume}
        onStop={onStop}
        onRestore={onRestore}
      />
    </Box>
  );
};

export { RunControls };
