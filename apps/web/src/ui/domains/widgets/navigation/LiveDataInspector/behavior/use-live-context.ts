/* @layer renderer-widgets @kind hook */
/**
 * Assembles the live `DetectionContext` for the current screen — the one
 * piece nothing in the recommendation engine builds for itself, since a
 * detector only ever receives observations, never reads the game.
 *
 * `origin` is always `'live'` here; the simulator's own recording path is a
 * separate producer of the same `DetectionContext` shape (see
 * `shared/game/simulation/recording/`) and is not this hook's concern.
 */
import { useMemo } from 'react';
import type { DetectionContext } from '@shared/game/recommendations';
import { useChestObservations } from './use-chest-observations';
import { useGrantedItems } from './use-granted-items';
import { useScreenObservations } from './use-screen-observations';
import { useSpriteObservations } from './use-sprite-observations';

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
      realTransitions: core.realTransitions,
      realAvailable: core.realAvailable,
      unmatchedCrossings: core.unmatchedCrossings,
      floodConnections: core.floodConnections,
      existingConnections: core.existingConnections,
      palaceMismatches: core.palaceMismatches,
      liveSprites,
      spriteCombat,
      grantedItems,
      chests,
    },
  }), [core, liveSprites, spriteCombat, grantedItems, chests]);
};

export { useLiveContext };
