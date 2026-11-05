/* @layer bridge-wasm @kind logic */
import type { ApStateStore } from '@drizztdourden08/brock-randomizer/session';
import type { RoomHashHolder } from './room-hash-holder.type';
import type { StoreCore } from './store-core.type';

const roomStateStore = (room: RoomHashHolder, core: StoreCore): ApStateStore => ({
  read: () => ({ receivedIndex: core.readReceivedIndex(), roomHash: String(core.readRoomHash()) }),
  write: (state) => {
    if (room.roomHash !== null && core.readRoomHash() === 0) core.writeRoomHash(room.roomHash);
    core.writeReceivedIndex(state.receivedIndex);
  },
});

export { roomStateStore };
