/* @layer renderer-components @kind component */
import { Box, Text, Button, Icon } from '@drizztdourden08/tessera/primitives';
import { GYRO_DESCRIPTION } from './PrereqCards.constants';
import type { GyroPrereqCardProps } from './PrereqCards.type';

const GyroPrereqCard = (props: GyroPrereqCardProps) => {
  const { gyroState, gyroExcluded, latestBytesLength, onGyroStart, onGyroStop, onGyroRedo, onGyroSkip } = props;

  return (
    <Box className={`hid-cal__prereq-card${gyroState === 'done' ? ' hid-cal__prereq-card--done' : ''}`}>
      <Box className="hid-cal__prereq-title">
        <Text>{gyroState === 'done' ? <Icon name="check" /> : '1.'} Gyro Profiling</Text>
        {gyroState === 'done' && <Text className="hid-cal__prereq-badge">{gyroExcluded.size} excluded</Text>}
      </Box>
      <Text as="p" className="hid-cal__desc">{GYRO_DESCRIPTION[gyroState]}</Text>
      <Box className="hid-cal__prereq-actions">
        {gyroState === 'idle' && (
          <>
            <Button variant="primary" size="sm" onClick={onGyroStart} disabled={latestBytesLength === 0}>Start Recording</Button>
            <Button variant="tertiary" size="sm" onClick={onGyroSkip}>Skip</Button>
          </>
        )}
        {gyroState === 'recording' && (
          <Button variant="danger" size="sm" onClick={onGyroStop}>Stop Recording</Button>
        )}
        {gyroState === 'done' && (
          <Button variant="tertiary" size="sm" onClick={onGyroRedo}>Redo</Button>
        )}
      </Box>
    </Box>
  );
};

export { GyroPrereqCard };
