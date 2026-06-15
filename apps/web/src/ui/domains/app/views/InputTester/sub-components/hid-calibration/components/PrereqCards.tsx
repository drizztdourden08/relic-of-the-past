/* @layer renderer-components @kind component */
/**
 * Gyro and Idle prerequisite cards for the HID Calibration Wizard.
 */
import { Box } from '../../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../../design-system/primitives/Text';
import { Button } from '../../../../../../../design-system/primitives/Button';
import type { GyroState, IdleState } from '../hid-calibration.type';

interface PrereqCardsProps {
  hasGyro: boolean;
  gyroState: GyroState;
  idleState: IdleState;
  gyroExcluded: Set<number>;
  latestBytesLength: number;
  onGyroStart: () => void;
  onGyroStop: () => void;
  onGyroRedo: () => void;
  onGyroSkip: () => void;
  onIdleCapture: () => void;
  onIdleRedo: () => void;
}

const PrereqCards = (props: PrereqCardsProps) => {
  const { hasGyro, gyroState, idleState, gyroExcluded, latestBytesLength, onGyroStart, onGyroStop, onGyroRedo, onGyroSkip, onIdleCapture, onIdleRedo } = props;

  return (
    <Box className="hid-cal__prereqs">
      {hasGyro && (
        <Box className={`hid-cal__prereq-card${gyroState === 'done' ? ' hid-cal__prereq-card--done' : ''}`}>
          <Box className="hid-cal__prereq-title">
            <Text>{gyroState === 'done' ? '✓' : '1.'} Gyro Profiling</Text>
            {gyroState === 'done' && <Text className="hid-cal__prereq-badge">{gyroExcluded.size} excluded</Text>}
          </Box>
          <Text as="p" className="hid-cal__desc">
            {gyroState === 'idle' && 'Pick up controller. Start recording, then tilt/rotate/shake.'}
            {gyroState === 'recording' && 'Recording... move the controller freely. Stop when done.'}
            {gyroState === 'done' && 'Gyro bytes identified and excluded.'}
          </Text>
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
      )}

      <Box className={`hid-cal__prereq-card${idleState === 'done' ? ' hid-cal__prereq-card--done' : ''}`}>
        <Box className="hid-cal__prereq-title">
          <Text>{idleState === 'done' ? '✓' : '2.'} Idle Baseline</Text>
        </Box>
        <Text as="p" className="hid-cal__desc">
          {idleState === 'idle' && "Set controller down, don't touch it, then capture."}
          {idleState === 'done' && 'Baseline captured.'}
        </Text>
        <Box className="hid-cal__prereq-actions">
          {idleState === 'idle' && (
            <Button variant="primary" size="sm" onClick={onIdleCapture} disabled={latestBytesLength === 0}>Capture Idle</Button>
          )}
          {idleState === 'done' && (
            <Button variant="tertiary" size="sm" onClick={onIdleRedo}>Redo</Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export { PrereqCards };
