/* @layer bridge-wasm @kind logic */
import { createReceivedQueue } from '@drizztdourden08/brock-randomizer/session';
import type { ReceivedQueue } from '@drizztdourden08/brock-randomizer/session';
import { roomStateStore } from './room-state-store';
import type { StoreCore } from './store-core.type';
import type { RoomHashHolder } from './room-hash-holder.type';

const bindReceived = (room: RoomHashHolder, core: StoreCore): ReceivedQueue =>
  createReceivedQueue({ store: roomStateStore(room, core), roomHash: () => String(room.roomHash ?? 0) });

export { bindReceived };
