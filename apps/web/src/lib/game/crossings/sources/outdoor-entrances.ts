/* @layer bridge-wasm @kind logic */
import type { ScreenCrossing } from '@shared/game/navigation';
import { enrichEntrances, FALL_HOLE_ID_BASE } from '../../flood/overworld-entrances';
import { noTarget, roomTarget } from '../resolve-target';
import { entranceRequirements } from '../availability';
import { makeCrossing } from '../make-crossing';
import type { CrossingPass } from '../crossings.type';

/** The doors into interiors and the pits that drop into a room, both off the
 *  same enriched table the flood seeds itself with. */
const outdoorEntranceCrossings = (pass: CrossingPass): ScreenCrossing[] => {
  const screenIndex = pass.scope.owScreenIndex;
  const out: ScreenCrossing[] = [];
  for (const entrance of enrichEntrances()) {
    if (entrance.area !== screenIndex) continue;
    const isHole = entrance.id >= FALL_HOLE_ID_BASE;
    const nativeId = isHole ? entrance.id - FALL_HOLE_ID_BASE : entrance.id;
    const requirements = pass.scope.flood ? entranceRequirements(pass.scope.flood, entrance.id, pass.items) : [];
    out.push(makeCrossing(pass, {
      id: isHole ? `hole:${nativeId}` : `ent:${nativeId}`,
      class: 'entrance',
      kind: isHole ? 'hole' : 'entrance',
      origin: isHole ? 'fall-hole' : 'ow-entrance',
      tile: { row: entrance.gridRow, col: entrance.gridCol },
      target: entrance.roomId !== 0 ? roomTarget(entrance.roomId) : noTarget(isHole ? 'pit' : 'entrance'),
      edgeSig: `e${nativeId}`,
      requirements,
    }));
  }
  return out;
};

export { outdoorEntranceCrossings };
