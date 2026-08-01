/* @layer renderer-widgets @kind component */
/**
 * Start / Pause / Resume / Stop plus the searchable stop-at-check picker and the
 * Restore pre-run state (Memento) button.
 */
import { Box, Button, Field, NumberInput } from '@ds/primitives';
import type { RunStatus } from '@app/stores/simulator-store';
import type { CheckId } from '@shared/game/data';
import { StopAtCheckPicker } from './StopAtCheckPicker';

interface RunControlsProps {
  status: RunStatus;
  stopAtCheckId: CheckId | '';
  onStopAtChange: (id: CheckId | '') => void;
  screenLimit: number | null;
  onScreenLimitChange: (limit: number | null) => void;
  canRestore: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onRestore: () => void;
}

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
