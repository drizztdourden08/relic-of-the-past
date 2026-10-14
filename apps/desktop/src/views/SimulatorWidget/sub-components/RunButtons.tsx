/* @layer renderer-widgets @kind component */
import { Box, Button } from '@drizztdourden08/tessera/primitives';
import type { RunButtonsProps } from '../SimulatorWidget.type';

const RunButtons = (props: RunButtonsProps) => {
  const { status, canRestore, onStart, onPause, onResume, onStop, onRestore } = props;
  const running = status === 'running';
  const paused = status === 'paused';
  const active = running || paused;

  return (
    <Box className="simulator__control-buttons">
      {!active && <Button size="sm" variant="primary" onClick={onStart}>Start from current state</Button>}
      {running && <Button size="sm" variant="secondary" onClick={onPause}>Pause</Button>}
      {paused && <Button size="sm" variant="primary" onClick={onResume}>Resume</Button>}
      {active && <Button size="sm" variant="danger" onClick={onStop}>Stop</Button>}
      <Button size="sm" variant="tertiary" onClick={onRestore} disabled={!canRestore || active}>
        Restore pre-run state
      </Button>
    </Box>
  );
};

export { RunButtons };
