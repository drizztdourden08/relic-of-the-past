/* @layer bridge-wasm @kind logic */
import type { RoomSectionSplit } from '../../simulation/types/room-section.type';
import type { RoomLayoutInfo } from './room-layout.type';

const roomSectionSplitFrom = (info: RoomLayoutInfo | null): RoomSectionSplit => ({
  splitX: Boolean(info?.intraEdges.some((edge) => edge === 'east' || edge === 'west')),
  splitY: Boolean(info?.intraEdges.some((edge) => edge === 'north' || edge === 'south')),
  playerSectionX: info?.quadrantX === 1 ? 1 : 0,
  playerSectionY: info?.quadrantY === 2 ? 1 : 0,
});

export { roomSectionSplitFrom };
