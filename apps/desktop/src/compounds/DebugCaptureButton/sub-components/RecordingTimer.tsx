/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { useElapsed } from '../behavior/useElapsed';
import { formatElapsed } from '../behavior/format-elapsed';
import type { RecordingTimerProps } from './RecordingTimer.type';
import './RecordingTimer.css';

const RecordingTimer = ({ startedAt }: RecordingTimerProps) => {
  const t = useT();
  const elapsedMs = useElapsed(startedAt);

  return (
    <Box className="recording-timer" role="timer" aria-label={t('compounds:debug-capture-button.recording-time')}>
      <Box as="span" className="recording-timer__dot" aria-hidden />
      <Text as="span" mono numeric className="recording-timer__time">{formatElapsed(elapsedMs)}</Text>
    </Box>
  );
};

export { RecordingTimer };
