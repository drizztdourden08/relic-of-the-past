/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { GyroPrereqCard } from './GyroPrereqCard';
import { IdlePrereqCard } from './IdlePrereqCard';
import type { PrereqCardsProps } from './PrereqCards.type';

const PrereqCards = (props: PrereqCardsProps) => {
  const { hasGyro, gyroState, idleState, gyroExcluded, latestBytesLength, onGyroStart, onGyroStop, onGyroRedo, onGyroSkip, onIdleCapture, onIdleRedo } = props;

  return (
    <Box className="hid-cal__prereqs">
      {hasGyro && (
        <GyroPrereqCard
          gyroState={gyroState}
          gyroExcluded={gyroExcluded}
          latestBytesLength={latestBytesLength}
          onGyroStart={onGyroStart}
          onGyroStop={onGyroStop}
          onGyroRedo={onGyroRedo}
          onGyroSkip={onGyroSkip}
        />
      )}
      <IdlePrereqCard idleState={idleState} latestBytesLength={latestBytesLength} onIdleCapture={onIdleCapture} onIdleRedo={onIdleRedo} />
    </Box>
  );
};

export { PrereqCards };
