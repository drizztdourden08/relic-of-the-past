/* @layer shared-game @kind logic */
import { NEEDS_INDEX, NEEDS_PALACE } from './screen-validity.constants';
import type { ScreenCandidate } from './screen-validity.type';

const indexBlockers = (candidate: ScreenCandidate): readonly string[] => {
  const { overworldIndex, roomIndex, palaceIndex } = candidate.gameId;
  if (candidate.kind === 'overworld') {
    return overworldIndex === undefined ? [NEEDS_INDEX.overworld] : [];
  }
  const blockers = roomIndex === undefined ? [NEEDS_INDEX[candidate.kind]] : [];
  if (candidate.kind === 'dungeon' && palaceIndex === undefined) return [...blockers, NEEDS_PALACE];
  return blockers;
};

export { indexBlockers };
