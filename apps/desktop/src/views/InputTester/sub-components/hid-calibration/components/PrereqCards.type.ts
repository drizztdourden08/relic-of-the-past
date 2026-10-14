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

type GyroPrereqCardProps = Pick<
  PrereqCardsProps,
  'gyroState' | 'gyroExcluded' | 'latestBytesLength' | 'onGyroStart' | 'onGyroStop' | 'onGyroRedo' | 'onGyroSkip'
>;

type IdlePrereqCardProps = Pick<PrereqCardsProps, 'idleState' | 'latestBytesLength' | 'onIdleCapture' | 'onIdleRedo'>;

export type { GyroPrereqCardProps, IdlePrereqCardProps, PrereqCardsProps };
