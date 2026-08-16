/* @layer bridge-wasm @kind logic */
import type { ScreenCrossing } from '@shared/game/navigation';
import { usableEntranceTransition } from '@shared/game/navigation';
import { wasmGetExitScreenMap } from '../../';
import { enrichEntrances } from '../../flood/overworld-entrances';
import { STAIR_ID_BASE } from '../../flood/room-entrances';
import { overworldTarget } from '../resolve-target';
import { makeCrossing } from '../make-crossing';
import type { CrossingPass } from '../crossings.type';

/**
 * Distinct PHYSICAL doors back outside that the flood actually TOUCHED. Several
 * entrance ids can share one door, and an id whose transition never fired — or
 * never passed the item gate — is not a way out the room has demonstrated.
 */
const touchedDoorSpots = (pass: CrossingPass): number => {
  const flood = pass.scope.flood;
  if (!flood) return 0;
  const owSide = enrichEntrances();
  const spots = new Set<string>();
  for (const t of flood.transitions) {
    if (t.edge !== 'entrance' || t.entranceIdx == null || t.entranceIdx >= STAIR_ID_BASE) continue;
    if (!usableEntranceTransition(flood, t, pass.items)) continue;
    const ow = owSide.find((e) => e.id === t.entranceIdx);
    if (ow) spots.add(`${ow.area}:${ow.gridRow},${ow.gridCol}`);
  }
  return spots.size;
};

/**
 * The exit table's own answer: every room it lists HAS a way back outside, even
 * when the flood never touched a door — room 0xe2's spawn sits at row 59 and its
 * floor ends at row 55, so nothing else emits its way out and it reads as a dead
 * end.
 *
 * The table names the destination without saying where the door is, so the
 * crossing carries a placeholder tile and is exempt from the reach test.
 */
const exitTableCrossing = (pass: CrossingPass): ScreenCrossing[] => {
  if (touchedDoorSpots(pass) > 0) return [];
  const roomIndex = pass.scope.roomIndex;
  const exitScreen = wasmGetExitScreenMap().get(roomIndex);
  if (exitScreen === undefined) return [];
  return [makeCrossing(pass, {
    id: `exit:${roomIndex}`,
    class: 'entrance',
    kind: 'door',
    origin: 'exit-table',
    tile: { row: 0, col: 0 },
    target: overworldTarget(exitScreen),
    edgeSig: `x${roomIndex}`,
    screenWide: true,
  })];
};

export { exitTableCrossing };
