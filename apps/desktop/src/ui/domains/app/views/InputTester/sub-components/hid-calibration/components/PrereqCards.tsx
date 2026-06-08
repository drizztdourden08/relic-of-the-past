/* @layer renderer-components @kind component */
/**
 * Gyro and Idle prerequisite cards for the HID Calibration Wizard.
 */
import { Box } from '../../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../../design-system/primitives/Text';
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
                <Box as="button" onClick={onGyroStart} className="input-cal__btn input-cal__btn--primary"
                  disabled={latestBytesLength === 0}>Start Recording</Box>
                <Box as="button" onClick={onGyroSkip} className="input-cal__btn">Skip</Box>
              </>
            )}
            {gyroState === 'recording' && (
              <Box as="button" onClick={onGyroStop} className="input-cal__btn input-cal__btn--danger">Stop Recording</Box>
            )}
            {gyroState === 'done' && (
              <Box as="button" onClick={onGyroRedo} className="input-cal__btn">Redo</Box>
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
            <Box as="button" onClick={onIdleCapture} className="input-cal__btn input-cal__btn--primary"
              disabled={latestBytesLength === 0}>Capture Idle</Box>
          )}
          {idleState === 'done' && (
            <Box as="button" onClick={onIdleRedo} className="input-cal__btn">Redo</Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export { PrereqCards };
