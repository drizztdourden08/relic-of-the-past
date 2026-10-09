/* @layer renderer-widgets @kind hook */
import { useMemo } from 'react';
import type { DetectionContext } from '@rotp/navigation';
import { useChestObservations } from './useChestObservations';
import { useGrantedItems } from './useGrantedItems';
import { useScreenObservations } from './useScreenObservations';
import { useSpriteObservations } from './useSpriteObservations';

const useLiveContext = (): DetectionContext => {
  const core = useScreenObservations();
  const { liveSprites, spriteCombat } = useSpriteObservations(
    core.isIndoors, core.liveGameId.roomIndex ?? 0, core.liveGameId.overworldIndex ?? 0,
  );
  const chests = useChestObservations(core.isIndoors, core.liveGameId.roomIndex ?? 0);
  const grantedItems = useGrantedItems();

  return useMemo<DetectionContext>(() => ({
    origin: 'live',
    screenId: core.screenId,
    observations: {
      match: core.match,
      liveGameId: core.liveGameId,
      isIndoors: core.isIndoors,
      isDarkWorld: core.isDarkWorld,
      realTransitions: core.realTransitions,
      realAvailable: core.realAvailable,
      unmatchedCrossings: core.unmatchedCrossings,
      floodConnections: core.floodConnections,
      existingConnections: core.existingConnections,
      palaceMismatches: core.palaceMismatches,
      entranceRooms: core.entranceRooms,
      roomTags: core.roomTags,
      dungeonMapPos: core.dungeonMapPos,
      entranceSpawns: core.entranceSpawns,
      walkBoundaries: core.walkBoundaries,
      doorBoundaries: core.doorBoundaries,
      liveSprites,
      spriteCombat,
      grantedItems,
      chests,
    },
  }), [core, liveSprites, spriteCombat, grantedItems, chests]);
};

export { useLiveContext };
