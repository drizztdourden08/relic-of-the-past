/* @layer shared-game @kind logic */
import type { ScreenObservations } from '../../detection-types';

const roomIdOf = (observations: ScreenObservations): number | null => (
  observations.isIndoors ? observations.liveGameId?.roomIndex ?? null : null
);

export { roomIdOf };
