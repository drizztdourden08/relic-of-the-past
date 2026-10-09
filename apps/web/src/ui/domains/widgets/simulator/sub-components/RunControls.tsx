/* @layer renderer-widgets @kind component */
import { Box, Button, Field, NumberInput } from '@drizztdourden08/tessera/primitives';
import { StopAtCheckPicker } from './StopAtCheckPicker';
import type { RunControlsProps } from '../SimulatorWidget.type';

const RunControls = (props: RunControlsProps) => {
  const { status, stopAtCheckId, onStopAtChange, screenLimit, onScreenLimitChange, canRestore, onStart, onPause, onResume, onStop, onRestore } = props;

  const idle = status === 'idle' || status === 'done';
  const running = status === 'running';
  const paused = status === 'paused';

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
      <Box className="simulator__control-buttons">
        {!running && !paused && (
          <Button size="sm" variant="primary" onClick={onStart}>Start from current state</Button>
        )}
        {running && <Button size="sm" variant="secondary" onClick={onPause}>Pause</Button>}
        {paused && <Button size="sm" variant="primary" onClick={onResume}>Resume</Button>}
        {(running || paused) && <Button size="sm" variant="danger" onClick={onStop}>Stop</Button>}
        <Button size="sm" variant="tertiary" onClick={onRestore} disabled={!canRestore || running || paused}>
          Restore pre-run state
        </Button>
      </Box>
    </Box>
  );
};

export { RunControls };
