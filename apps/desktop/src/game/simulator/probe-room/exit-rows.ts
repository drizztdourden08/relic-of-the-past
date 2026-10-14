/* @layer bridge-wasm @kind logic */
import type { RoomProbe } from '@rotp/navigation';
import type { DetectedRoom } from './probe-room.type';

const exitRows = (detected: DetectedRoom): RoomProbe['exits'] =>
  (detected?.exits ?? []).map((e) => ({ to: e.to, ...(e.steps == null ? {} : { steps: e.steps }) }));

export { exitRows };
