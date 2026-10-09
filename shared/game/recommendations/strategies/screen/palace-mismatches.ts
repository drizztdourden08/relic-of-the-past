/* @layer shared-game @kind logic */
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
