/* @layer bridge-wasm @kind logic */
import type { ScreenCrossing } from '@shared/game/navigation';
import { doorwayLandingOpen, exitDoorAt } from '../../../simulator/room-doorways';
import { regionQualifier } from '../../../simulator/screen-resolve';
import { isFollowerActive } from '@rotp/game-core';
import { entryFromEdge } from '../../../simulator/exit-order';
import { doorCrossingTile } from '../../place-tile';
import { roomTarget } from '../../resolve-target';
import { makeCrossing } from '../../make-crossing';
import type { CrossingPass } from '../../crossings.type';
import { FOLLOWER_DOOR, FOLLOWER_REQ } from './indoor-doors.constants';
import { ownDoorways } from './own-doorways';
import { neighbourDoorways } from './neighbour-doorways';
import type { DoorwayCandidate } from './indoor-doors.type';

const requirementsFor = (nativeType: number): string[] =>
  nativeType === FOLLOWER_DOOR && !isFollowerActive() ? [FOLLOWER_REQ] : [];

const doorwayKey = (candidate: DoorwayCandidate): string =>
  `${candidate.edge}:${candidate.adj}${regionQualifier(entryFromEdge(candidate.edge, candidate.pos))}`;

const doorwayCrossings = (pass: CrossingPass): ScreenCrossing[] => {
  const roomIndex = pass.scope.roomIndex;
  const seen = new Set<string>();
  const out: ScreenCrossing[] = [];
  for (const candidate of [...ownDoorways(roomIndex), ...neighbourDoorways(roomIndex)]) {
    const key = doorwayKey(candidate);
    if (seen.has(key)) continue;
    if (exitDoorAt(roomIndex, candidate.edge, candidate.pos)) continue;
    if (!doorwayLandingOpen(candidate.adj, candidate.edge, candidate.pos)) continue;
    seen.add(key);
    out.push(makeCrossing(pass, {
      id: `doorway:${candidate.edge}:${candidate.pos}`,
      class: 'entrance',
      kind: 'door',
      origin: 'room-doorway',
      tile: doorCrossingTile({ ...candidate.tile, direction: candidate.edge }, pass.reachable, candidate.tile),
      side: candidate.edge,
      target: roomTarget(candidate.adj),
      edgeSig: `d${candidate.edge}:${candidate.pos}`,
      requirements: requirementsFor(candidate.nativeType),
    }));
  }
  return out;
};

export { doorwayCrossings };
