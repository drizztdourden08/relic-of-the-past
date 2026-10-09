/* @layer renderer-widgets @kind logic */
import { dataRevision } from '@rotp/game-core';
import type { DetectionContext } from '@rotp/navigation';

const signatureOf = (context: DetectionContext): string => {
  const { observations } = context;
  const { liveGameId } = observations;
  return [
    dataRevision(), context.screenId, observations.realAvailable ? 1 : 0,
    observations.unmatchedCrossings.length, observations.existingConnections.length,
    observations.liveSprites?.length ?? -1, observations.grantedItems?.length ?? -1,
    observations.chests?.length ?? -1,
    liveGameId?.overworldIndex ?? -1, liveGameId?.roomIndex ?? -1,
    liveGameId?.palaceIndex ?? -1, liveGameId?.entranceId ?? -1,
  ].join('|');
};

export { signatureOf };
