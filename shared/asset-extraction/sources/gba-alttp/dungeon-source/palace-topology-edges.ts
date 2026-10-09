/* @layer shared-asset-extraction @kind logic */
import type { DungeonRoomRecord, DungeonTopologyEdge } from '../../../dungeon/model';
import type { TopologyDestination } from './dungeon-source.type';
import { NO_DESTINATION_ROOM, PALACE_ROOM_IDS } from './dungeon-source.constants';

const palaceTopologyEdges = (rooms: readonly DungeonRoomRecord[]): DungeonTopologyEdge[] => {
  const palaceIds = new Set<number>(PALACE_ROOM_IDS);
  const edges: DungeonTopologyEdge[] = [];
  for (const room of rooms) {
    const destinations: TopologyDestination[] = [
      { kind: 'hole', slot: 0, value: room.header.hole },
      ...room.header.stairs.map((value, slot) => ({ kind: 'stair' as const, slot, value })),
    ];
    for (const destination of destinations) {
      if (destination.value.roomId === NO_DESTINATION_ROOM) continue;
      edges.push({
        fromRoomId: room.id,
        kind: destination.kind,
        slot: destination.slot,
        toRoomId: destination.value.roomId,
        quadrant: destination.value.quadrant,
        insidePalace: palaceIds.has(destination.value.roomId),
      });
    }
  }
  return edges;
};

export { palaceTopologyEdges };
