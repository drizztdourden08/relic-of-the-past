/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Text, Button } from '@drizztdourden08/tessera/primitives';
import type { ButtonMappingActionsProps } from './ButtonMapping.type';

const ButtonMappingActions = (props: ButtonMappingActionsProps) => {
  const {
    activeIndex, inputPhaseActive, autoAdvance, onStartButtons, onSkip, onGoBack, setAutoAdvanceWrapped, setInputPhaseActiveWrapped,
  } = props;
  const stopAuto = useCallback(() => setAutoAdvanceWrapped(false), [setAutoAdvanceWrapped]);
  const pauseInput = useCallback(() => setInputPhaseActiveWrapped(false), [setInputPhaseActiveWrapped]);

  if (!inputPhaseActive) {
    return (
      <Box className="hid-cal__prereq-actions">
        <Button variant="primary" size="sm" onClick={onStartButtons}>
          Auto-Advance All
        </Button>
      </Box>
    );
  }

  if (autoAdvance) {
    return (
      <Box className="hid-cal__prereq-actions">
        <Button variant="tertiary" size="sm" onClick={onGoBack} disabled={activeIndex <= 0}>Back</Button>
        <Button variant="tertiary" size="sm" onClick={onSkip}>Skip</Button>
        <Button variant="tertiary" size="sm" onClick={stopAuto}>Stop Auto</Button>
        <Button variant="tertiary" size="sm" onClick={pauseInput}>Pause</Button>
      </Box>
    );
  }

  return (
    <Box className="hid-cal__prereq-actions">
      <Text className="hid-cal__manual-hint">
        Click a button above to detect, or click a byte in the grid to assign manually.
      </Text>
      <Button variant="tertiary" size="sm" onClick={pauseInput}>Deselect</Button>
    </Box>
  );
};

export { ButtonMappingActions };
