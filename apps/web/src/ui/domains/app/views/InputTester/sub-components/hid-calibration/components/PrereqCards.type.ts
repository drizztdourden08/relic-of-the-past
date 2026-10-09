/* @layer renderer-components @kind types */
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

export type { PrereqCardsProps };
