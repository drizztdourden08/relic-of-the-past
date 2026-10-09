/* @layer shared-game @kind logic */
import { PLACEHOLDER_AREA_ID } from '../../../data';
import type { AreaId } from '../../../data';
import { screenRecordFile } from '../../../data/record-file-targets';
import type { ScreenHome } from '../../../data/record-file-targets';
import { NEEDS_FILE } from './screen-validity.constants';
import type { ScreenCandidate } from './screen-validity.type';

const asHome = (candidate: ScreenCandidate): ScreenHome => ({
  id: candidate.id,
  kind: candidate.kind,
  world: candidate.world,
  areaId: (candidate.areaId === undefined || candidate.areaId === ''
    ? PLACEHOLDER_AREA_ID
    : candidate.areaId) as AreaId,
  interiorKind: candidate.interiorKind,
  gameId: candidate.gameId,
  position: candidate.position,
});

const homeBlockers = (candidate: ScreenCandidate): readonly string[] => {
  const target = screenRecordFile(asHome(candidate));
  return target.relativePath === null ? [target.unresolved ?? NEEDS_FILE] : [];
};

export { homeBlockers };
