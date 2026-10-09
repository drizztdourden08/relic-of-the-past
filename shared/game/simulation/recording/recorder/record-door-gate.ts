/* @layer shared-game @kind logic */
import type { SimDoor } from '../../types';
import type { RecorderState } from './recorder.type';

const recordDoorGate = (rec: RecorderState, door: SimDoor): void => {
  if (!rec.doorGates.some(d => d.roomId === door.roomId && d.direction === door.direction)) {
    rec.doorGates.push({ roomId: door.roomId, kind: door.kind, direction: door.direction, opened: door.opened });
  }
};

export { recordDoorGate };
