/* @layer renderer-widgets @kind component */
/**
 * Start / Pause / Resume / Stop plus the searchable stop-at-check picker and the
 * Restore pre-run state (Memento) button.
 */
import { Box, Button, Field } from '@ds/primitives';
import type { RunStatus } from '@app/stores/simulator-store';
import { StopAtCheckPicker } from './StopAtCheckPicker';

interface RunControlsProps {
  status: RunStatus;
  stopAtCheckId: string;
  onStopAtChange: (id: string) => void;
  canRestore: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onRestore: () => void;
}

const RunControls = (props: RunControlsProps) => {
  const { status, stopAtCheckId, onStopAtChange, canRestore, onStart, onPause, onResume, onStop, onRestore } = props;

  const idle = status === 'idle' || status === 'done';
  const running = status === 'running';
  const paused = status === 'paused';

  return (
    <Box className="simulator__controls">
      <Field label="Stop at check">
        <StopAtCheckPicker
          stopAtCheckId={stopAtCheckId}
          onStopAtChange={onStopAtChange}
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
