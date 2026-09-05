/* @layer shared-game @kind logic */
/**
 * Every palace mislabel the fallback has rescued THIS SESSION, folded with
 * whatever the live match just resolved. Moved here from the app-layer
 * screen-identity detector this strategy replaces. The live match is folded
 * in instead of handled separately so a screen that appears in both produces
 * one finding, not two that happen to share an id.
 *
 * `screen.strategy.ts`'s `subjects` uses this to widen past the current
 * screen, and `game-id.probes.ts`'s palace probe uses it again to read the
 * value for whichever of those extra screens it is looking at.
 */
import type { PalaceMismatch } from '../../../logic/queries/palace-fallback';
import type { ScreenObservations } from '../../detection-types';

const resolvedPalaceMismatches = (observations: ScreenObservations): readonly PalaceMismatch[] => {
  const all = [...observations.palaceMismatches];
  const match = observations.match;
  if (match?.method !== 'palace-scan' || !match.palaceMismatch) return all;

  const live: PalaceMismatch = {
    ...match.palaceMismatch,
    room: match.screen.gameId.roomIndex ?? -1,
    screenId: match.screen.id,
  };
  const known = all.some(m => m.screenId === live.screenId && m.actual === live.actual);
  return known ? all : [...all, live];
};

export { resolvedPalaceMismatches };
