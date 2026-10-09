/* @layer shared-game @kind logic */
import { TRAVERSAL_ROOM_PATTERN } from './dungeon-group.constants';

const traversalRoomOf = (screenId: string): number | null => {
  const m = TRAVERSAL_ROOM_PATTERN.exec(screenId);
  return m ? Number(m[1]) : null;
};

export { traversalRoomOf };
