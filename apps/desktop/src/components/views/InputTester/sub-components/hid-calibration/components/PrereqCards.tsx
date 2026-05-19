/**
 * Gyro and Idle prerequisite cards for the HID Calibration Wizard.
 */
import type { GyroState, IdleState } from '../types';

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
    <div className="hid-cal__prereqs">
      {hasGyro && (
        <div className={`hid-cal__prereq-card${gyroState === 'done' ? ' hid-cal__prereq-card--done' : ''}`}>
          <div className="hid-cal__prereq-title">
            <span>{gyroState === 'done' ? '✓' : '1.'} Gyro Profiling</span>
            {gyroState === 'done' && <span className="hid-cal__prereq-badge">{gyroExcluded.size} excluded</span>}
          </div>
          <p className="hid-cal__desc">
            {gyroState === 'idle' && 'Pick up controller. Start recording, then tilt/rotate/shake.'}
            {gyroState === 'recording' && 'Recording... move the controller freely. Stop when done.'}
            {gyroState === 'done' && 'Gyro bytes identified and excluded.'}
          </p>
          <div className="hid-cal__prereq-actions">
            {gyroState === 'idle' && (
              <>
                <button onClick={onGyroStart} className="input-cal__btn input-cal__btn--primary"
                  disabled={latestBytesLength === 0}>Start Recording</button>
                <button onClick={onGyroSkip} className="input-cal__btn">Skip</button>
              </>
            )}
            {gyroState === 'recording' && (
              <button onClick={onGyroStop} className="input-cal__btn input-cal__btn--danger">Stop Recording</button>
            )}
            {gyroState === 'done' && (
              <button onClick={onGyroRedo} className="input-cal__btn">Redo</button>
            )}
          </div>
        </div>
      )}

      <div className={`hid-cal__prereq-card${idleState === 'done' ? ' hid-cal__prereq-card--done' : ''}`}>
        <div className="hid-cal__prereq-title">
          <span>{idleState === 'done' ? '✓' : '2.'} Idle Baseline</span>
        </div>
        <p className="hid-cal__desc">
          {idleState === 'idle' && "Set controller down, don't touch it, then capture."}
          {idleState === 'done' && 'Baseline captured.'}
        </p>
        <div className="hid-cal__prereq-actions">
          {idleState === 'idle' && (
            <button onClick={onIdleCapture} className="input-cal__btn input-cal__btn--primary"
              disabled={latestBytesLength === 0}>Capture Idle</button>
          )}
          {idleState === 'done' && (
            <button onClick={onIdleRedo} className="input-cal__btn">Redo</button>
          )}
        </div>
      </div>
    </div>
  );
};

export { PrereqCards };
