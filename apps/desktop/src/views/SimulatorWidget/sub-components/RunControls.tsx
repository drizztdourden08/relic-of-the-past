/* @layer renderer-widgets @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Field, NumberInput } from '@drizztdourden08/tessera/primitives';
import { StopAtCheckPicker } from './StopAtCheckPicker';
import { RunButtons } from './RunButtons';
import type { RunControlsProps } from '../SimulatorWidget.type';

const RunControls = (props: RunControlsProps) => {
  const { status, stopAtCheckId, onStopAtChange, screenLimit, onScreenLimitChange, canRestore, onStart, onPause, onResume, onStop, onRestore } = props;

  const t = useT();
  const idle = status === 'idle' || status === 'done';

  const handleScreenLimit = (value: number) => {
    onScreenLimitChange(Number.isNaN(value) || value < 1 ? null : Math.floor(value));
  };

  return (
    <Box className="simulator__controls">
      <Field label={t('views-simulator:controls.stop.at')}>
        <StopAtCheckPicker
          stopAtCheckId={stopAtCheckId}
          onStopAtChange={onStopAtChange}
          disabled={!idle}
        />
      </Field>
      <Field label={t('views-simulator:controls.max.screens')} hint={t('views-simulator:controls.max.screens.hint')}>
        <NumberInput
          min={1}
          placeholder={t('views-simulator:controls.unlimited')}
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
