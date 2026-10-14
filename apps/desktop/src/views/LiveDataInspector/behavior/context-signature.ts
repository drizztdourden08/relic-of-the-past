/* @layer renderer-widgets @kind logic */
import { dataRevision } from '@rotp/game-core';
import type { DetectionContext } from '@rotp/navigation';
import { gameIdParts } from './game-id-parts';
import { lengthOrMissing } from './length-or-missing';

const signatureOf = (context: DetectionContext): string => {
  const { observations } = context;
  return [
    dataRevision(), context.screenId, observations.realAvailable ? 1 : 0,
    observations.unmatchedCrossings.length, observations.existingConnections.length,
    lengthOrMissing(observations.liveSprites), lengthOrMissing(observations.grantedItems),
    lengthOrMissing(observations.chests),
    ...gameIdParts(observations.liveGameId),
  ].join('|');
};

export { signatureOf };
